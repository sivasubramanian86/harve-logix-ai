"""
HarvestReady Agent - Optimal harvest timing using crop phenology + market + weather.

This agent determines the optimal harvest date and time based on:
- Crop phenology (ripeness, growth stage)
- Weather forecast (rain, temperature)
- Market prices (trend analysis)
- Processor orders (buyer demand)
"""

import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime, timedelta
import requests

import boto3
from botocore.exceptions import ClientError

from agents.base_agent import BaseAgent
from config import (
    WEATHER_API_KEY,
    WEATHER_API_BASE_URL,
    DEFAULT_HARVEST_INCOME_GAIN,
    PROCESSOR_PROFILES_TABLE,
)
from utils.errors import ExternalAPIException, DataAccessException, ValidationException
from utils.retry import retry_with_backoff

logger = logging.getLogger(__name__)


class HarvestReadyAgent(BaseAgent):
    """Agent for determining optimal harvest timing."""

    def __init__(self):
        """Initialize HarvestReady Agent."""
        super().__init__('HarvestReady')
        self.weather_api_key = WEATHER_API_KEY
        self.weather_api_base_url = WEATHER_API_BASE_URL
        self.processor_profiles_table = self.get_dynamodb_table(PROCESSOR_PROFILES_TABLE)

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process harvest timing request.

        Args:
            request_data: Request containing crop_type, growth_stage, location

        Returns:
            Harvest recommendation with date, time, and income impact
        """
        try:
            # Validate input
            self._validate_input(request_data)

            crop_type = request_data.get('crop_type')
            growth_stage = request_data.get('current_growth_stage', 0)
            location = request_data.get('location', {})

            self.logger.info(f"Analyzing harvest timing for {crop_type} at stage {growth_stage}")

            # Gather data from multiple sources
            phenology_data = self._get_phenology_data(crop_type, growth_stage)
            weather_data = self._get_weather_forecast(location)
            market_data = self._get_market_prices(crop_type)
            processor_data = self._get_processor_orders(crop_type, location)

            # Use Bedrock for reasoning
            recommendation = self._bedrock_reasoning(
                crop_type=crop_type,
                growth_stage=growth_stage,
                phenology_data=phenology_data,
                weather_data=weather_data,
                market_data=market_data,
                processor_data=processor_data
            )

            return self.create_response(
                status='success',
                output=recommendation,
                confidence_score=recommendation.get('confidence_score', 0.85),
                reasoning=recommendation.get('reasoning', '')
            )

        except ValidationException as e:
            self.logger.error(f"Validation error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except Exception as e:
            self.logger.error(f"Error analyzing harvest timing: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """
        Validate input data.

        Args:
            request_data: Request data to validate

        Raises:
            ValidationException: If validation fails
        """
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        growth_stage = request_data.get('current_growth_stage', 0)
        if not isinstance(growth_stage, (int, float)) or growth_stage < 0 or growth_stage > 10:
            raise ValidationException('current_growth_stage must be between 0 and 10')

        location = request_data.get('location', {})
        if location:
            if 'latitude' not in location or 'longitude' not in location:
                raise ValidationException('location must contain latitude and longitude')

    def _get_phenology_data(self, crop_type: str, growth_stage: int) -> Dict[str, Any]:
        """
        Get crop phenology data from RDS.

        Args:
            crop_type: Type of crop
            growth_stage: Current growth stage (0-10)

        Returns:
            Phenology data including ripeness, optimal harvest window
        """
        try:
            # In production, this would query RDS
            # For now, returning realistic mock data based on crop type
            phenology_map = {
                'tomato': {
                    'ripeness_percent': min(87 + (growth_stage * 1.3), 100),
                    'optimal_harvest_window': '85-95%',
                    'expected_yield_kg_per_acre': 25000,
                    'days_to_maturity': max(0, 3 - growth_stage)
                },
                'onion': {
                    'ripeness_percent': min(80 + (growth_stage * 2), 100),
                    'optimal_harvest_window': '80-90%',
                    'expected_yield_kg_per_acre': 20000,
                    'days_to_maturity': max(0, 5 - growth_stage)
                },
                'capsicum': {
                    'ripeness_percent': min(85 + (growth_stage * 1.5), 100),
                    'optimal_harvest_window': '85-95%',
                    'expected_yield_kg_per_acre': 22000,
                    'days_to_maturity': max(0, 4 - growth_stage)
                }
            }

            data = phenology_map.get(crop_type.lower(), phenology_map['tomato'])
            return {
                'crop_type': crop_type,
                'growth_stage': growth_stage,
                **data
            }
        except Exception as e:
            self.logger.error(f"Error getting phenology data: {str(e)}")
            return {}

    @retry_with_backoff(exceptions=(requests.RequestException,))
    def _get_weather_forecast(self, location: Dict[str, float]) -> Dict[str, Any]:
        """
        Get 7-day weather forecast from Weather API.

        Args:
            location: Location coordinates (latitude, longitude)

        Returns:
            Weather forecast data
        """
        try:
            if not location or not self.weather_api_key:
                return self._get_mock_weather_forecast()

            lat = location.get('latitude', 0)
            lon = location.get('longitude', 0)

            # Call Weather API
            url = f"{self.weather_api_base_url}/forecast"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.weather_api_key,
                'units': 'metric'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract relevant data
            forecast = {
                'location': location,
                'forecast_data': []
            }

            for item in data.get('list', [])[:8]:  # Next 2 days
                forecast['forecast_data'].append({
                    'date': item['dt_txt'],
                    'temperature': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'rainfall_probability': item.get('pop', 0),
                    'description': item['weather'][0]['description']
                })

            return forecast

        except requests.RequestException as e:
            self.logger.warning(f"Weather API error: {str(e)}, using mock data")
            return self._get_mock_weather_forecast()
        except Exception as e:
            self.logger.error(f"Error getting weather forecast: {str(e)}")
            return self._get_mock_weather_forecast()

    def _get_mock_weather_forecast(self) -> Dict[str, Any]:
        """Get mock weather forecast for testing."""
        return {
            'location': {},
            'forecast_data': [
                {
                    'date': (datetime.now() + timedelta(hours=i*3)).isoformat(),
                    'temperature': 28 + (i % 3),
                    'humidity': 65,
                    'rainfall_probability': 0.1,
                    'description': 'Clear sky'
                }
                for i in range(8)
            ]
        }

    def _get_market_prices(self, crop_type: str) -> Dict[str, Any]:
        """
        Get market price data from RDS.

        Args:
            crop_type: Type of crop

        Returns:
            Market price data including trend
        """
        try:
            # In production, this would query RDS market_prices table
            # For now, returning realistic mock data
            price_map = {
                'tomato': {'current': 48, 'min': 40, 'max': 55, 'forecast_2d': 52},
                'onion': {'current': 35, 'min': 30, 'max': 45, 'forecast_2d': 38},
                'capsicum': {'current': 60, 'min': 50, 'max': 70, 'forecast_2d': 65}
            }

            prices = price_map.get(crop_type.lower(), price_map['tomato'])
            trend_percent = ((prices['forecast_2d'] - prices['current']) / prices['current']) * 100

            return {
                'crop_type': crop_type,
                'current_price': prices['current'],
                'min_price': prices['min'],
                'max_price': prices['max'],
                'trend': f"up_{trend_percent:.1f}%" if trend_percent > 0 else f"down_{abs(trend_percent):.1f}%",
                'forecast_price_in_2_days': prices['forecast_2d'],
                'volume_traded': 125000
            }
        except Exception as e:
            self.logger.error(f"Error getting market prices: {str(e)}")
            return {}

    def _get_processor_orders(self, crop_type: str, location: Dict[str, float]) -> Dict[str, Any]:
        """
        Get processor orders from DynamoDB.

        Args:
            crop_type: Type of crop
            location: Location coordinates

        Returns:
            Processor orders data
        """
        try:
            # Query DynamoDB for processor profiles with matching crop demand
            response = self.processor_profiles_table.query(
                KeyConditionExpression='crop_type = :crop_type',
                ExpressionAttributeValues={':crop_type': crop_type},
                Limit=10
            )

            orders = response.get('Items', [])

            return {
                'crop_type': crop_type,
                'orders': orders,
                'total_demand_kg': sum(order.get('daily_requirement_kg', 0) for order in orders)
            }

        except ClientError as e:
            self.logger.warning(f"Error getting processor orders: {str(e)}, using mock data")
            return {
                'crop_type': crop_type,
                'orders': [],
                'total_demand_kg': 5000
            }

    def _bedrock_reasoning(self, crop_type: str, growth_stage: int,
                          phenology_data: Dict[str, Any],
                          weather_data: Dict[str, Any],
                          market_data: Dict[str, Any],
                          processor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Bedrock Claude for reasoning about harvest timing.

        Args:
            crop_type: Type of crop
            growth_stage: Current growth stage
            phenology_data: Crop phenology data
            weather_data: Weather forecast data
            market_data: Market price data
            processor_data: Processor orders data

        Returns:
            Harvest recommendation from Bedrock
        """
        try:
            # Prepare prompt for Bedrock
            prompt = f"""You are an expert agricultural advisor. Based on the following data, recommend the optimal harvest date and time for {crop_type}.

Crop Data:
- Growth Stage: {growth_stage}/10
- Ripeness: {phenology_data.get('ripeness_percent', 0):.1f}%
- Optimal Harvest Window: {phenology_data.get('optimal_harvest_window', 'N/A')}
- Expected Yield: {phenology_data.get('expected_yield_kg_per_acre', 0)} kg/acre
- Days to Maturity: {phenology_data.get('days_to_maturity', 0)}

Weather Forecast (Next 48 hours):
{json.dumps(weather_data.get('forecast_data', [])[:4], indent=2)}

Market Data:
- Current Price: ₹{market_data.get('current_price', 0)}/kg
- Price Trend: {market_data.get('trend', 'stable')}
- Forecast Price in 2 days: ₹{market_data.get('forecast_price_in_2_days', 0)}/kg
- Market Volume: {market_data.get('volume_traded', 0)} kg

Processor Demand:
- Total Demand: {processor_data.get('total_demand_kg', 0)} kg
- Number of Orders: {len(processor_data.get('orders', []))}

Based on this data, provide:
1. Recommended harvest date (YYYY-MM-DD format)
2. Recommended harvest time (HH:MM format, 24-hour)
3. Expected income gain in rupees
4. Confidence score (0-1)
5. Reasoning for the recommendation

Format your response as JSON with keys: harvest_date, harvest_time, expected_income_gain_rupees, confidence_score, reasoning"""

            # Call Bedrock
            response_text = self.invoke_bedrock(prompt)
            recommendation = self.extract_json_from_response(response_text)

            # Ensure all required fields are present
            if not recommendation:
                recommendation = self._get_default_recommendation()

            return recommendation

        except Exception as e:
            self.logger.error(f"Error in Bedrock reasoning: {str(e)}")
            return self._get_default_recommendation()

    def _get_default_recommendation(self) -> Dict[str, Any]:
        """Get default recommendation when Bedrock fails."""
        return {
            'harvest_date': (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
            'harvest_time': '05:00',
            'expected_income_gain_rupees': DEFAULT_HARVEST_INCOME_GAIN,
            'confidence_score': 0.75,
            'reasoning': 'Default recommendation due to processing constraints'
        }


def lambda_handler(event, context):
    """
    Lambda handler for HarvestReady Agent.

    Args:
        event: Lambda event
        context: Lambda context

    Returns:
        Harvest recommendation
    """
    try:
        agent = HarvestReadyAgent()

        # Extract request data
        request_data = event.get('request_data', {})
        farmer_id = event.get('farmer_id', 'unknown')

        # Process request
        result = agent.process(request_data)

        # Log execution
        agent.log_execution(farmer_id, request_data, result)

        return {
            'statusCode': 200 if result['status'] == 'success' else 400,
            'body': json.dumps(result)
        }

    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
