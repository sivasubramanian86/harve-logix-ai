"""
Custom exceptions for HarveLogix AI.
"""


class HarveLogixException(Exception):
    """Base exception for HarveLogix AI."""

    def __init__(self, message: str, error_code: str = 'INTERNAL_ERROR', details: dict = None):
        """
        Initialize HarveLogix exception.

        Args:
            message: Error message
            error_code: Error code for tracking
            details: Additional error details
        """
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """Convert exception to dictionary."""
        return {
            'error': self.message,
            'error_code': self.error_code,
            'details': self.details
        }


class DataAccessException(HarveLogixException):
    """Exception for data access errors (RDS, DynamoDB, S3)."""

    def __init__(self, message: str, details: dict = None):
        """Initialize data access exception."""
        super().__init__(message, 'DATA_ACCESS_ERROR', details)


class BedrockException(HarveLogixException):
    """Exception for Bedrock API errors."""

    def __init__(self, message: str, details: dict = None):
        """Initialize Bedrock exception."""
        super().__init__(message, 'BEDROCK_ERROR', details)


class ExternalAPIException(HarveLogixException):
    """Exception for external API errors (Weather, eNAM, etc.)."""

    def __init__(self, message: str, details: dict = None):
        """Initialize external API exception."""
        super().__init__(message, 'EXTERNAL_API_ERROR', details)


class ValidationException(HarveLogixException):
    """Exception for input validation errors."""

    def __init__(self, message: str, details: dict = None):
        """Initialize validation exception."""
        super().__init__(message, 'VALIDATION_ERROR', details)


class RekognitionException(HarveLogixException):
    """Exception for AWS Rekognition errors."""

    def __init__(self, message: str, details: dict = None):
        """Initialize Rekognition exception."""
        super().__init__(message, 'REKOGNITION_ERROR', details)


class TimeoutException(HarveLogixException):
    """Exception for timeout errors."""

    def __init__(self, message: str, details: dict = None):
        """Initialize timeout exception."""
        super().__init__(message, 'TIMEOUT_ERROR', details)
