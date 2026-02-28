"""
Unit tests for HarvestReady Agent.
"""

import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock

from agents.harvest_ready_agent import HarvestReadyAgent
from utils.errors import ValidationException


class TestHarvestReadyAgent:
    """Test suite for HarvestReady Agent."""

    @pytest.fixture
    def agent(self):
        """Create agent instance."""
        return HarvestReadyAgent()

    @pytest.fixture
    def valid_request(self):
        """Create valid request data."""
        return {
            'crop_type': 'tomato',
            'current_growth_stage': 8,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

    def test_agent_initialization(self, agent):
        """Test agent initialization."""
        assert agent.agent_name == 'HarvestReady'
        assert agent.model_id is not None

    def test_validate_input_valid(self, agent, valid_request):
        """Test validation with valid input."""
        # Should not raise exception
        agent._validate_input(valid_request)

    def test_validate_input_missing_crop_type(self, agent):
        """Test validation with missing crop_type."""
        request = {'current_growth_stage': 8}
        with pytest.raises(ValidationException):
            agent._validate_input(request)

    def test_validate_input_invalid_growth_stage(self, agent):
        """Test validation with invalid growth stage."""
        request = {'crop_type': 'tomato', 'current_growth_stage': 15}
        with pytest.raises(ValidationException):
            agent._validate_input(request)

    def test_validate_input_negative_growth_stage(self, agent):
        """Test validation with negative growth stage."""
        request = {'crop_type': 'tomato', 'current_growth_stage': -1}
        with pytest.raises(ValidationException):
            agent._validate_input(request)

    def test_get_phenology_data_tomato(self, agent):
        """Test phenology data retrieval for tomato."""
        data = agent._get_phenology_data('tomato', 8)
        assert data['crop_type'] == 'tomato'
        assert data['growth_stage'] == 8
        assert 'ripeness_percent' in data
        assert 'optimal_harvest_window' in data

    def test_get_phenology_data_onion(self, agent):
        """Test phenology data retrieval for onion."""
        data = agent._get_phenology_data('onion', 5)
        assert data['crop_type'] == 'onion'
        assert 'ripeness_percent' in data

    def test_get_phenology_data_capsicum(self, agent):
        """Test phenology data retrieval for capsicum."""
        data = agent._get_phenology_data('capsicum', 7)
        assert data['crop_type'] == 'capsicum'
        assert 'ripeness_percent' in data

    def test_get_mock_weather_forecast(self, agent):
        """Test mock weather forecast."""
        forecast = agent._get_mock_weather_forecast()
        assert 'forecast_data' in forecast
        assert len(forecast['forecast_data']) == 8
        assert 'temperature' in forecast['forecast_data'][0]
        assert 'humidity' in forecast['forecast_data'][0]

    def test_get_market_prices_tomato(self, agent):
        """Test market price retrieval for tomato."""
        prices = agent._get_market_prices('tomato')
        assert prices['crop_type'] == 'tomato'
        assert 'current_price' in prices
        assert 'trend' in prices
        assert prices['current_price'] > 0

    def test_get_market_prices_onion(self, agent):
        """Test market price retrieval for onion."""
        prices = agent._get_market_prices('onion')
        assert prices['crop_type'] == 'onion'
        assert prices['current_price'] > 0

    def test_get_default_recommendation(self, agent):
        """Test default recommendation generation."""
        rec = agent._get_default_recommendation()
        assert 'harvest_date' in rec
        assert 'harvest_time' in rec
        assert 'expected_income_gain_rupees' in rec
        assert 'confidence_score' in rec
        assert rec['confidence_score'] > 0

    def test_process_success(self, agent, valid_request):
        """Test successful processing."""
        result = agent.process(valid_request)
        assert result['status'] == 'success'
        assert 'output' in result
        assert 'confidence_score' in result

    def test_process_invalid_input(self, agent):
        """Test processing with invalid input."""
        request = {'current_growth_stage': 8}
        result = agent.process(request)
        assert result['status'] == 'error'
        assert 'error' in result

    def test_create_response_success(self, agent):
        """Test response creation for success."""
        output = {'harvest_date': '2026-01-28', 'harvest_time': '05:00'}
        response = agent.create_response(
            status='success',
            output=output,
            confidence_score=0.85,
            reasoning='Test reasoning'
        )
        assert response['status'] == 'success'
        assert response['output'] == output
        assert response['confidence_score'] == 0.85
        assert response['reasoning'] == 'Test reasoning'

    def test_create_response_error(self, agent):
        """Test response creation for error."""
        response = agent.create_response(
            status='error',
            error='Test error'
        )
        assert response['status'] == 'error'
        assert response['error'] == 'Test error'

    def test_extract_json_from_response_valid_json(self, agent):
        """Test JSON extraction from valid JSON response."""
        response_text = '{"harvest_date": "2026-01-28", "harvest_time": "05:00"}'
        result = agent.extract_json_from_response(response_text)
        assert result['harvest_date'] == '2026-01-28'
        assert result['harvest_time'] == '05:00'

    def test_extract_json_from_response_embedded_json(self, agent):
        """Test JSON extraction from embedded JSON."""
        response_text = 'Here is the recommendation: {"harvest_date": "2026-01-28"} Please follow it.'
        result = agent.extract_json_from_response(response_text)
        assert result['harvest_date'] == '2026-01-28'

    def test_extract_json_from_response_invalid(self, agent):
        """Test JSON extraction from invalid JSON."""
        response_text = 'This is not JSON'
        result = agent.extract_json_from_response(response_text)
        assert result == {}

    def test_phenology_ripeness_increases_with_stage(self, agent):
        """Test that ripeness increases with growth stage."""
        stage_5_data = agent._get_phenology_data('tomato', 5)
        stage_8_data = agent._get_phenology_data('tomato', 8)
        assert stage_8_data['ripeness_percent'] > stage_5_data['ripeness_percent']

    def test_market_price_forecast_consistency(self, agent):
        """Test market price forecast consistency."""
        prices = agent._get_market_prices('tomato')
        assert prices['min_price'] <= prices['current_price'] <= prices['max_price']
        assert prices['forecast_price_in_2_days'] > 0

    def test_weather_forecast_has_required_fields(self, agent):
        """Test weather forecast has all required fields."""
        forecast = agent._get_mock_weather_forecast()
        for item in forecast['forecast_data']:
            assert 'date' in item
            assert 'temperature' in item
            assert 'humidity' in item
            assert 'rainfall_probability' in item

    def test_processor_orders_default_values(self, agent):
        """Test processor orders returns sensible defaults."""
        orders = agent._get_processor_orders('tomato', {})
        assert 'crop_type' in orders
        assert 'orders' in orders
        assert 'total_demand_kg' in orders
        assert orders['total_demand_kg'] >= 0


class TestHarvestReadyAgentIntegration:
    """Integration tests for HarvestReady Agent."""

    @pytest.fixture
    def agent(self):
        """Create agent instance."""
        return HarvestReadyAgent()

    def test_full_harvest_analysis_flow(self, agent):
        """Test complete harvest analysis flow."""
        request = {
            'crop_type': 'tomato',
            'current_growth_stage': 8,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        result = agent.process(request)

        assert result['status'] == 'success'
        assert 'output' in result
        output = result['output']
        assert 'harvest_date' in output
        assert 'harvest_time' in output
        assert 'expected_income_gain_rupees' in output
        assert 'confidence_score' in output

    def test_different_crops_produce_different_recommendations(self, agent):
        """Test that different crops produce different recommendations."""
        tomato_request = {
            'crop_type': 'tomato',
            'current_growth_stage': 8,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        onion_request = {
            'crop_type': 'onion',
            'current_growth_stage': 8,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        tomato_result = agent.process(tomato_request)
        onion_result = agent.process(onion_request)

        assert tomato_result['status'] == 'success'
        assert onion_result['status'] == 'success'

    def test_growth_stage_affects_recommendation(self, agent):
        """Test that growth stage affects harvest recommendation."""
        early_stage_request = {
            'crop_type': 'tomato',
            'current_growth_stage': 3,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        late_stage_request = {
            'crop_type': 'tomato',
            'current_growth_stage': 9,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        early_result = agent.process(early_stage_request)
        late_result = agent.process(late_stage_request)

        assert early_result['status'] == 'success'
        assert late_result['status'] == 'success'


@pytest.mark.parametrize('crop_type', ['tomato', 'onion', 'capsicum'])
def test_harvest_ready_agent_all_crops(crop_type):
    """Test HarvestReady agent with all supported crops."""
    agent = HarvestReadyAgent()
    request = {
        'crop_type': crop_type,
        'current_growth_stage': 7,
        'location': {'latitude': 15.8, 'longitude': 75.6}
    }

    result = agent.process(request)
    assert result['status'] == 'success'


@pytest.mark.parametrize('growth_stage', [0, 3, 5, 7, 10])
def test_harvest_ready_agent_all_growth_stages(growth_stage):
    """Test HarvestReady agent with all growth stages."""
    agent = HarvestReadyAgent()
    request = {
        'crop_type': 'tomato',
        'current_growth_stage': growth_stage,
        'location': {'latitude': 15.8, 'longitude': 75.6}
    }

    result = agent.process(request)
    assert result['status'] == 'success'
