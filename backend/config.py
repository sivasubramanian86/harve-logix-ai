"""
Configuration management for HarveLogix AI.

Handles environment variables, AWS configuration, and application settings.
"""

import os
from typing import Optional

# AWS Configuration
# Using ap-south-2 (Mumbai) as primary region per user requirements
# Using Amazon Nova 2 Lite via inference profile in ap-south-1
# Client automatically routes ap-south-1 profile requests to ap-south-1 region
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-2')
BEDROCK_MODEL_ID = os.getenv('BEDROCK_MODEL_ID', 'arn:aws:bedrock:ap-south-1:020513638290:application-inference-profile/hs79u71flmnc')
BEDROCK_MODEL_TYPE = os.getenv('BEDROCK_MODEL_TYPE', 'nova')  # 'nova' or 'claude'

# DynamoDB Tables
FARMERS_TABLE = os.getenv('FARMERS_TABLE', 'farmers')
AGENT_DECISIONS_TABLE = os.getenv('AGENT_DECISIONS_TABLE', 'agent_decisions')
PROCESSOR_PROFILES_TABLE = os.getenv('PROCESSOR_PROFILES_TABLE', 'processor_profiles')
STORAGE_TEMPLATES_TABLE = os.getenv('STORAGE_TEMPLATES_TABLE', 'storage_templates')

# RDS Configuration
RDS_HOST = os.getenv('RDS_HOST', 'localhost')
RDS_PORT = int(os.getenv('RDS_PORT', '5432'))
RDS_DATABASE = os.getenv('RDS_DATABASE', 'harvelogix')
RDS_USER = os.getenv('RDS_USER', 'postgres')
RDS_PASSWORD = os.getenv('RDS_PASSWORD', '')

# External APIs
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
WEATHER_API_BASE_URL = os.getenv('WEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5')

# EventBridge
EVENTBRIDGE_BUS_NAME = os.getenv('EVENTBRIDGE_BUS_NAME', 'harvelogix-events')

# Performance Settings
LAMBDA_TIMEOUT_SECONDS = int(os.getenv('LAMBDA_TIMEOUT_SECONDS', '30'))
BEDROCK_MAX_TOKENS = int(os.getenv('BEDROCK_MAX_TOKENS', '1024'))
BEDROCK_TEMPERATURE = float(os.getenv('BEDROCK_TEMPERATURE', '0.7'))

# Retry Configuration
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
RETRY_DELAY_SECONDS = int(os.getenv('RETRY_DELAY_SECONDS', '1'))

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Feature Flags
ENABLE_BEDROCK_REASONING = os.getenv('ENABLE_BEDROCK_REASONING', 'true').lower() == 'true'
ENABLE_REKOGNITION = os.getenv('ENABLE_REKOGNITION', 'true').lower() == 'true'

# TTL Configuration (in seconds)
AGENT_DECISIONS_TTL_DAYS = int(os.getenv('AGENT_DECISIONS_TTL_DAYS', '90'))
AGENT_DECISIONS_TTL_SECONDS = AGENT_DECISIONS_TTL_DAYS * 24 * 60 * 60

# Income Impact Defaults (in rupees)
DEFAULT_HARVEST_INCOME_GAIN = float(os.getenv('DEFAULT_HARVEST_INCOME_GAIN', '4500'))
DEFAULT_SUPPLY_INCOME_GAIN = float(os.getenv('DEFAULT_SUPPLY_INCOME_GAIN', '20000'))
DEFAULT_QUALITY_INCOME_GAIN = float(os.getenv('DEFAULT_QUALITY_INCOME_GAIN', '5000'))
DEFAULT_COLLECTIVE_INCOME_GAIN = float(os.getenv('DEFAULT_COLLECTIVE_INCOME_GAIN', '3000'))

# Water Savings Defaults
DEFAULT_WATER_SAVINGS_LITERS = float(os.getenv('DEFAULT_WATER_SAVINGS_LITERS', '5000'))
DEFAULT_WATER_COST_SAVINGS = float(os.getenv('DEFAULT_WATER_COST_SAVINGS', '8000'))

# Quality Grading Thresholds
QUALITY_GRADE_A_THRESHOLD = float(os.getenv('QUALITY_GRADE_A_THRESHOLD', '0.85'))
QUALITY_GRADE_B_THRESHOLD = float(os.getenv('QUALITY_GRADE_B_THRESHOLD', '0.70'))

# Collective Voice Settings
MIN_FARMERS_FOR_COLLECTIVE = int(os.getenv('MIN_FARMERS_FOR_COLLECTIVE', '50'))
COLLECTIVE_BULK_DISCOUNT_PERCENT = float(os.getenv('COLLECTIVE_BULK_DISCOUNT_PERCENT', '15'))

# Response Time Targets (milliseconds)
TARGET_RESPONSE_TIME_MS = int(os.getenv('TARGET_RESPONSE_TIME_MS', '100'))
