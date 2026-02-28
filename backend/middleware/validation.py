"""
Input validation and sanitization middleware.
Prevents prompt injection and validates request data.
"""

import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Validation error exception."""
    pass


def sanitize_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize input to prevent prompt injection and malicious input.
    
    Args:
        data: Input data to sanitize
        
    Returns:
        Sanitized data
        
    Raises:
        ValidationError: If suspicious patterns detected
    """
    # Patterns that indicate prompt injection attempts
    dangerous_patterns = [
        r'ignore\s+(?:previous\s+)?instructions?',
        r'system\s+prompt',
        r'forget\s+(?:previous\s+)?(?:instructions?|context)',
        r'execute\s+(?:code|command)',
        r'override\s+(?:safety|guardrails)',
        r'bypass\s+(?:safety|security)',
        r'disregard\s+(?:safety|rules)',
        r'you\s+are\s+now',
        r'pretend\s+(?:you\s+are|to\s+be)',
        r'act\s+as\s+(?:if\s+)?you',
    ]
    
    for key, value in data.items():
        if isinstance(value, str):
            # Check for dangerous patterns
            for pattern in dangerous_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    logger.warning(f"Suspicious pattern detected in {key}: {pattern}")
                    raise ValidationError(f"Suspicious input detected in field: {key}")
            
            # Check for excessive length (potential DoS)
            if len(value) > 10000:
                raise ValidationError(f"Input too long in field: {key} (max 10000 chars)")
    
    return data


def validate_crop_type(crop_type: str) -> str:
    """Validate crop type."""
    allowed_crops = ['tomato', 'onion', 'capsicum', 'potato', 'pepper', 'carrot']
    
    if not crop_type or not isinstance(crop_type, str):
        raise ValidationError("crop_type must be a non-empty string")
    
    if crop_type.lower() not in allowed_crops:
        raise ValidationError(f"crop_type must be one of: {', '.join(allowed_crops)}")
    
    return crop_type.lower()


def validate_growth_stage(stage: int) -> int:
    """Validate growth stage."""
    if not isinstance(stage, int):
        raise ValidationError("growth_stage must be an integer")
    
    if stage < 0 or stage > 10:
        raise ValidationError("growth_stage must be between 0 and 10")
    
    return stage


def validate_location(location: Dict[str, float]) -> Dict[str, float]:
    """Validate location coordinates."""
    if not isinstance(location, dict):
        raise ValidationError("location must be a dictionary")
    
    lat = location.get('latitude')
    lon = location.get('longitude')
    
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        raise ValidationError("latitude and longitude must be numbers")
    
    # India bounds
    if not (8.0 <= lat <= 35.0):
        raise ValidationError("latitude must be between 8.0 and 35.0 (India bounds)")
    
    if not (68.0 <= lon <= 97.0):
        raise ValidationError("longitude must be between 68.0 and 97.0 (India bounds)")
    
    return {'latitude': lat, 'longitude': lon}


def validate_quantity(quantity: float) -> float:
    """Validate quantity in kg."""
    if not isinstance(quantity, (int, float)):
        raise ValidationError("quantity must be a number")
    
    if quantity <= 0:
        raise ValidationError("quantity must be positive")
    
    if quantity > 1000000:  # Max 1 million kg
        raise ValidationError("quantity too large (max 1,000,000 kg)")
    
    return float(quantity)


def validate_quality_grade(grade: str) -> str:
    """Validate quality grade."""
    allowed_grades = ['A', 'B', 'C']
    
    if not isinstance(grade, str) or grade.upper() not in allowed_grades:
        raise ValidationError(f"quality_grade must be one of: {', '.join(allowed_grades)}")
    
    return grade.upper()


def validate_harvest_ready_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate HarvestReady agent request."""
    sanitize_input(data)
    
    validated = {
        'crop_type': validate_crop_type(data.get('crop_type', '')),
        'current_growth_stage': validate_growth_stage(data.get('current_growth_stage', 0)),
    }
    
    if 'location' in data:
        validated['location'] = validate_location(data['location'])
    
    return validated


def validate_supply_match_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate SupplyMatch agent request."""
    sanitize_input(data)
    
    validated = {
        'crop_type': validate_crop_type(data.get('crop_type', '')),
        'quantity_kg': validate_quantity(data.get('quantity_kg', 0)),
        'quality_grade': validate_quality_grade(data.get('quality_grade', 'B')),
    }
    
    if 'location' in data:
        validated['location'] = validate_location(data['location'])
    
    return validated


def validate_quality_hub_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate QualityHub agent request."""
    sanitize_input(data)
    
    validated = {
        'crop_type': validate_crop_type(data.get('crop_type', '')),
        'batch_size_kg': validate_quantity(data.get('batch_size_kg', 0)),
    }
    
    return validated


def validate_storage_scout_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate StorageScout agent request."""
    sanitize_input(data)
    
    validated = {
        'crop_type': validate_crop_type(data.get('crop_type', '')),
    }
    
    if 'storage_duration_days' in data:
        duration = data['storage_duration_days']
        if not isinstance(duration, int) or duration <= 0 or duration > 365:
            raise ValidationError("storage_duration_days must be between 1 and 365")
        validated['storage_duration_days'] = duration
    
    return validated
