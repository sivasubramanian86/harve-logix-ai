"""
PII (Personally Identifiable Information) filtering and masking.
Prevents sensitive data from being logged or returned in responses.
"""

import re
import json
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class PIIFilter:
    """Filter and mask PII in data."""
    
    # Patterns for common PII
    PATTERNS = {
        'phone': r'\+91[-\s]?\d{4}[-\s]?\d{6}|\+91\d{10}|91\d{10}|\d{10}',
        'aadhaar': r'\d{4}[\s-]?\d{4}[\s-]?\d{4}',
        'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        'coordinates': r'\d{1,2}\.\d{4,},\s?\d{1,2}\.\d{4,}',
        'bank_account': r'\d{9,18}',
    }
    
    # Replacement masks
    MASKS = {
        'phone': '+91-XXXX-XXXXXX',
        'aadhaar': 'XXXX XXXX XXXX',
        'email': 'user@XXXX.com',
        'coordinates': 'XX.XXXX, XX.XXXX',
        'bank_account': 'XXXX...XXXX',
    }
    
    @staticmethod
    def mask_phone(text: str) -> str:
        """Mask phone numbers."""
        return re.sub(
            PIIFilter.PATTERNS['phone'],
            PIIFilter.MASKS['phone'],
            text
        )
    
    @staticmethod
    def mask_aadhaar(text: str) -> str:
        """Mask Aadhaar numbers."""
        return re.sub(
            PIIFilter.PATTERNS['aadhaar'],
            PIIFilter.MASKS['aadhaar'],
            text
        )
    
    @staticmethod
    def mask_email(text: str) -> str:
        """Mask email addresses."""
        return re.sub(
            PIIFilter.PATTERNS['email'],
            PIIFilter.MASKS['email'],
            text
        )
    
    @staticmethod
    def mask_coordinates(text: str) -> str:
        """Mask GPS coordinates."""
        return re.sub(
            PIIFilter.PATTERNS['coordinates'],
            PIIFilter.MASKS['coordinates'],
            text
        )
    
    @staticmethod
    def mask_all(text: str) -> str:
        """Mask all PII patterns."""
        if not isinstance(text, str):
            return text
        
        text = PIIFilter.mask_phone(text)
        text = PIIFilter.mask_aadhaar(text)
        text = PIIFilter.mask_email(text)
        text = PIIFilter.mask_coordinates(text)
        
        return text
    
    @staticmethod
    def filter_dict(data: Dict[str, Any], mask_fields: List[str] = None) -> Dict[str, Any]:
        """
        Filter PII from dictionary.
        
        Args:
            data: Dictionary to filter
            mask_fields: List of field names to mask (e.g., ['phone', 'location'])
            
        Returns:
            Filtered dictionary
        """
        if mask_fields is None:
            mask_fields = ['phone', 'location', 'coordinates', 'farmer_id']
        
        filtered = {}
        
        for key, value in data.items():
            # Skip sensitive fields entirely
            if key in ['password', 'token', 'secret', 'api_key']:
                continue
            
            # Mask specific fields
            if key in mask_fields:
                if isinstance(value, str):
                    filtered[key] = PIIFilter.mask_all(value)
                elif isinstance(value, dict):
                    filtered[key] = PIIFilter.filter_dict(value, mask_fields)
                elif isinstance(value, list):
                    filtered[key] = [
                        PIIFilter.filter_dict(item, mask_fields) if isinstance(item, dict)
                        else PIIFilter.mask_all(item) if isinstance(item, str)
                        else item
                        for item in value
                    ]
                else:
                    filtered[key] = value
            else:
                # Recursively filter nested structures
                if isinstance(value, dict):
                    filtered[key] = PIIFilter.filter_dict(value, mask_fields)
                elif isinstance(value, list):
                    filtered[key] = [
                        PIIFilter.filter_dict(item, mask_fields) if isinstance(item, dict)
                        else PIIFilter.mask_all(item) if isinstance(item, str)
                        else item
                        for item in value
                    ]
                elif isinstance(value, str):
                    # Mask PII in all string values
                    filtered[key] = PIIFilter.mask_all(value)
                else:
                    filtered[key] = value
        
        return filtered
    
    @staticmethod
    def filter_response(response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filter PII from API response before sending to client.
        
        Args:
            response: Response dictionary
            
        Returns:
            Filtered response
        """
        # Don't filter error messages (they may contain debug info)
        if response.get('status') == 'error':
            return response
        
        # Filter output section
        if 'output' in response and isinstance(response['output'], dict):
            response['output'] = PIIFilter.filter_dict(response['output'])
        
        return response
    
    @staticmethod
    def filter_log_record(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filter PII from log records.
        
        Args:
            record: Log record dictionary
            
        Returns:
            Filtered log record
        """
        # Don't log sensitive fields
        sensitive_keys = ['password', 'token', 'secret', 'api_key', 'phone', 'aadhaar']
        
        filtered = {}
        for key, value in record.items():
            if key in sensitive_keys:
                filtered[key] = '[REDACTED]'
            elif isinstance(value, str):
                filtered[key] = PIIFilter.mask_all(value)
            elif isinstance(value, dict):
                filtered[key] = PIIFilter.filter_dict(value)
            else:
                filtered[key] = value
        
        return filtered
