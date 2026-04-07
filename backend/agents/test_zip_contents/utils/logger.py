"""
Logging configuration for HarveLogix AI.
"""

import logging
import json
from typing import Any, Dict
from datetime import datetime

from config import LOG_LEVEL


class JSONFormatter(logging.Formatter):
    """JSON formatter for CloudWatch logs."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)

        return json.dumps(log_data)


def get_logger(name: str) -> logging.Logger:
    """
    Get configured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(LOG_LEVEL)

    # Remove existing handlers to avoid duplicates
    logger.handlers = []

    # Create console handler with JSON formatter
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)

    return logger


def log_with_context(logger: logging.Logger, level: str, message: str, **context) -> None:
    """
    Log message with additional context.

    Args:
        logger: Logger instance
        level: Log level (INFO, ERROR, WARNING, DEBUG)
        message: Log message
        **context: Additional context data
    """
    record = logging.LogRecord(
        name=logger.name,
        level=getattr(logging, level),
        pathname='',
        lineno=0,
        msg=message,
        args=(),
        exc_info=None
    )
    record.extra_data = context
    logger.handle(record)
