"""
Pytest configuration and fixtures for HarveLogix AI tests.
"""

import pytest
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


@pytest.fixture
def mock_aws_credentials(monkeypatch):
    """Mock AWS credentials for testing."""
    monkeypatch.setenv('AWS_ACCESS_KEY_ID', 'testing')
    monkeypatch.setenv('AWS_SECRET_ACCESS_KEY', 'testing')
    monkeypatch.setenv('AWS_SECURITY_TOKEN', 'testing')
    monkeypatch.setenv('AWS_SESSION_TOKEN', 'testing')
    monkeypatch.setenv('AWS_DEFAULT_REGION', 'ap-south-1')


@pytest.fixture
def sample_farmer_data():
    """Sample farmer data for testing."""
    return {
        'farmer_id': 'farmer-001',
        'phone': '+91-9876543210',
        'state': 'Karnataka',
        'district': 'Belgaum',
        'location': {'latitude': 15.8, 'longitude': 75.6},
        'crop_type': 'tomato',
        'field_size_acres': 2.5,
        'current_growth_stage': 8
    }


@pytest.fixture
def sample_harvest_request():
    """Sample harvest ready request."""
    return {
        'crop_type': 'tomato',
        'current_growth_stage': 8,
        'location': {'latitude': 15.8, 'longitude': 75.6}
    }


@pytest.fixture
def sample_storage_request():
    """Sample storage scout request."""
    return {
        'crop_type': 'tomato',
        'storage_duration_days': 14,
        'ambient_conditions': {
            'temperature_c': 25,
            'humidity_percent': 60
        }
    }


@pytest.fixture
def sample_supply_request():
    """Sample supply match request."""
    return {
        'farmer_id': 'farmer-001',
        'crop_type': 'tomato',
        'quantity_kg': 1000,
        'quality_grade': 'A',
        'location': {'latitude': 15.8, 'longitude': 75.6}
    }


@pytest.fixture
def sample_water_request():
    """Sample water wise request."""
    return {
        'crop_type': 'tomato',
        'post_harvest_operations': ['washing', 'cooling'],
        'climate_data': {
            'temperature_c': 25,
            'humidity_percent': 60
        },
        'cost_per_liter_rupees': 1.5
    }


@pytest.fixture
def sample_quality_request():
    """Sample quality hub request."""
    return {
        'crop_type': 'tomato',
        'batch_size_kg': 500,
        'farmer_photo': 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
    }


@pytest.fixture
def sample_collective_request():
    """Sample collective voice request."""
    farmers = [
        {
            'farmer_id': f'farmer-{i:03d}',
            'crop_type': 'tomato',
            'region': 'Karnataka',
            'expected_production_kg': 5000 + (i * 500)
        }
        for i in range(60)
    ]

    return {
        'crop_type': 'tomato',
        'region': 'Karnataka',
        'farmer_profiles': farmers
    }


@pytest.fixture
def mock_bedrock_response():
    """Mock Bedrock response."""
    return {
        'harvest_date': '2026-01-28',
        'harvest_time': '05:00',
        'expected_income_gain_rupees': 4500,
        'confidence_score': 0.94,
        'reasoning': 'ripeness 87% + no rain 48hrs + market peak on day-4'
    }


@pytest.fixture
def mock_processor_profiles():
    """Mock processor profiles."""
    return [
        {
            'processor_id': 'proc-001',
            'name': 'FreshMart Cooperative',
            'location': {'latitude': 15.8, 'longitude': 75.6},
            'crops_needed': ['tomato', 'capsicum', 'onion'],
            'daily_requirement_kg': 5000,
            'quality_requirement': 'A_grade',
            'price_offered': 48,
            'transport_available': True,
            'payment_terms': 'same_day_cash',
            'historical_reliability': 0.98
        },
        {
            'processor_id': 'proc-002',
            'name': 'Agro Industries Ltd',
            'location': {'latitude': 15.9, 'longitude': 75.7},
            'crops_needed': ['tomato', 'onion'],
            'daily_requirement_kg': 3000,
            'quality_requirement': 'B_grade',
            'price_offered': 45,
            'transport_available': False,
            'payment_terms': '2_days',
            'historical_reliability': 0.92
        }
    ]


# Pytest markers
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line('markers', 'unit: mark test as a unit test')
    config.addinivalue_line('markers', 'integration: mark test as an integration test')
    config.addinivalue_line('markers', 'property: mark test as a property-based test')
    config.addinivalue_line('markers', 'slow: mark test as slow running')
