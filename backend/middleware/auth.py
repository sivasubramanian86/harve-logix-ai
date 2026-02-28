"""
Authentication middleware for HarveLogix AI.
Handles JWT verification and role extraction.
"""

import os
import json
import logging
from functools import wraps
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# For development, use a simple token validation
# In production, integrate with Cognito
DEMO_TOKEN = os.getenv('DEMO_TOKEN', 'demo-token-12345')


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token and extract claims.
    
    In production, this would verify against Cognito.
    For demo, we accept demo tokens.
    """
    try:
        # Demo mode: accept demo token
        if token == DEMO_TOKEN:
            return {
                'sub': 'demo-farmer-001',
                'role': 'farmer',
                'cognito:groups': ['farmer']
            }
        
        # In production, verify JWT signature with Cognito public key
        # For now, reject unknown tokens
        logger.warning(f"Invalid token received")
        return None
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return None


def extract_auth_context(request) -> Dict[str, Any]:
    """Extract authentication context from request."""
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    
    if not token:
        return {
            'authenticated': False,
            'farmer_id': None,
            'role': None,
            'error': 'Missing Authorization header'
        }
    
    claims = verify_token(token)
    
    if not claims:
        return {
            'authenticated': False,
            'farmer_id': None,
            'role': None,
            'error': 'Invalid token'
        }
    
    return {
        'authenticated': True,
        'farmer_id': claims.get('sub'),
        'role': claims.get('role', 'farmer'),
        'groups': claims.get('cognito:groups', [])
    }


def require_auth(allowed_roles: list = None):
    """
    Decorator to require authentication on endpoints.
    
    Args:
        allowed_roles: List of allowed roles (e.g., ['farmer', 'processor'])
    """
    if allowed_roles is None:
        allowed_roles = ['farmer', 'processor', 'admin']
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This will be called from Express middleware
            # For now, just pass through
            return f(*args, **kwargs)
        return decorated_function
    
    return decorator
