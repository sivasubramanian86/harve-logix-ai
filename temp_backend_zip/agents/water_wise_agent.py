"""
WaterWise Agent - Water optimization for post-harvest operations.

This agent recommends water-efficient protocols for washing, cooling, and processing
to reduce water usage and costs while maintaining quality.
"""

import json
import logging
from typing import Any, Dict
from datetime import datetime

from agents.base_agent import BaseAgent
from config import (
    DEFAULT_WATER_SAVINGS_LITERS,
    DEFAULT_WATER_COST_SAVINGS,
)
from utils.errors import ValidationException

logger = logging.getLogger(__name__)


class WaterWiseAgent(BaseAgent):
    """Agent for optimizing water usage in post-harvest operations."""

    def __init__(self):
        """Initialize WaterWise Agent."""
        super().__init__('WaterWise')

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process water optimization request.

        Args:
            request_data: Request containing crop_type, operations, climate_data, cost_per_liter

        Returns:
            Water optimization protocol with savings estimates
        """
        try:
            # Validate input
            self._validate_input(request_data)

            crop_type = request_data.get('crop_type')
            operations = request_data.get('post_harvest_operations', [])
            climate_data = request_data.get('climate_data', {})
            cost_per_liter = request_data.get('cost_per_liter_rupees', 1.0)

            self.logger.info(f"Optimizing water for {crop_type} with operations: {operations}")

            # Get water protocols
            protocols = self._get_water_protocols(crop_type, operations)

            # Analyze climate data
            climate_analysis = self._analyze_climate(climate_data)

            # Use Bedrock for reasoning
            recommendation = self._bedrock_reasoning(
                crop_type=crop_type,
                operations=operations,
                protocols=protocols,
                climate_data=climate_analysis,
                cost_per_liter=cost_per_liter
            )

            return self.create_response(
                status='success',
                output=recommendation,
                confidence_score=recommendation.get('confidence_score', 0.82),
                reasoning=recommendation.get('reasoning', '')
            )

        except ValidationException as e:
            self.logger.error(f"Validation error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except Exception as e:
            self.logger.error(f"Error optimizing water: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """Validate input data."""
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        operations = request_data.get('post_harvest_operations', [])
        if not isinstance(operations, list) or len(operations) == 0:
            raise ValidationException('post_harvest_operations must be a non-empty list')

        cost = request_data.get('cost_per_liter_rupees', 0)
        if not isinstance(cost, (int, float)) or cost < 0:
            raise ValidationException('cost_per_liter_rupees must be non-negative')

    def _get_water_protocols(self, crop_type: str, operations: list) -> Dict[str, Any]:
        """Get water protocols for crop type and operations."""
        protocols_map = {
            'tomato': {
                'washing': {'standard_liters': 500, 'efficient_liters': 300},
                'cooling': {'standard_liters': 1000, 'efficient_liters': 600},
                'processing': {'standard_liters': 800, 'efficient_liters': 400}
            },
            'onion': {
                'washing': {'standard_liters': 400, 'efficient_liters': 200},
                'cooling': {'standard_liters': 600, 'efficient_liters': 300},
                'processing': {'standard_liters': 500, 'efficient_liters': 250}
            },
            'capsicum': {
                'washing': {'standard_liters': 600, 'efficient_liters': 350},
                'cooling': {'standard_liters': 1200, 'efficient_liters': 700},
                'processing': {'standard_liters': 900, 'efficient_liters': 500}
            }
        }

        crop_protocols = protocols_map.get(crop_type.lower(), protocols_map['tomato'])
        return {op: crop_protocols.get(op, {'standard_liters': 500, 'efficient_liters': 300}) for op in operations}

    def _analyze_climate(self, climate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze climate data for water optimization."""
        return {
            'temperature_c': climate_data.get('temperature_c', 25),
            'humidity_percent': climate_data.get('humidity_percent', 60),
            'rainfall_mm': climate_data.get('rainfall_mm', 0),
            'wind_speed_kmh': climate_data.get('wind_speed_kmh', 5)
        }

    def _bedrock_reasoning(self, crop_type: str, operations: list,
                          protocols: Dict[str, Any],
                          climate_data: Dict[str, Any],
                          cost_per_liter: float) -> Dict[str, Any]:
        """Use Bedrock for water optimization reasoning."""
        try:
            # Calculate standard vs efficient usage
            standard_total = sum(p.get('standard_liters', 0) for p in protocols.values())
            efficient_total = sum(p.get('efficient_liters', 0) for p in protocols.values())
            water_savings = standard_total - efficient_total
            cost_savings = water_savings * cost_per_liter

            prompt = f"""You are a water conservation expert. Recommend water-efficient protocols for {crop_type} post-harvest operations.

Operations: {', '.join(operations)}

Water Usage (liters):
- Standard approach: {standard_total}L
- Efficient approach: {efficient_total}L
- Potential savings: {water_savings}L

Climate Conditions:
- Temperature: {climate_data.get('temperature_c', 25)}°C
- Humidity: {climate_data.get('humidity_percent', 60)}%
- Rainfall: {climate_data.get('rainfall_mm', 0)}mm
- Wind Speed: {climate_data.get('wind_speed_kmh', 5)} km/h

Cost per liter: ₹{cost_per_liter}

Provide:
1. Water-optimized protocol (JSON with operation-specific recommendations)
2. Water savings (liters)
3. Cost savings (rupees)
4. Environmental impact (CO2 saved in kg)
5. Confidence score (0-1)
6. Reasoning

Format as JSON with keys: water_optimized_protocol, water_savings_liters, cost_savings_rupees, environmental_impact_co2_kg, confidence_score, reasoning"""

            response_text = self.invoke_bedrock(prompt)
            recommendation = self.extract_json_from_response(response_text)

            if not recommendation:
                recommendation = self._get_default_recommendation(water_savings, cost_savings)

            return recommendation

        except Exception as e:
            self.logger.error(f"Error in Bedrock reasoning: {str(e)}")
            standard_total = sum(p.get('standard_liters', 0) for p in protocols.values())
            efficient_total = sum(p.get('efficient_liters', 0) for p in protocols.values())
            water_savings = standard_total - efficient_total
            cost_savings = water_savings * cost_per_liter
            return self._get_default_recommendation(water_savings, cost_savings)

    def _get_default_recommendation(self, water_savings: float, cost_savings: float) -> Dict[str, Any]:
        """Get default recommendation."""
        return {
            'water_optimized_protocol': {
                'washing': 'Use drip irrigation and recirculation systems',
                'cooling': 'Use evaporative cooling with water recycling',
                'processing': 'Implement closed-loop water systems'
            },
            'water_savings_liters': water_savings,
            'cost_savings_rupees': cost_savings,
            'environmental_impact_co2_kg': water_savings * 0.0005,  # Rough estimate
            'confidence_score': 0.80,
            'reasoning': 'Default water optimization protocol based on crop type'
        }


def lambda_handler(event, context):
    """Lambda handler for WaterWise Agent."""
    try:
        agent = WaterWiseAgent()
        request_data = event.get('request_data', {})
        farmer_id = event.get('farmer_id', 'unknown')

        result = agent.process(request_data)
        agent.log_execution(farmer_id, request_data, result)

        if 'workflow_id' in event and 'task_id' in event:
            from core.mcp_orchestrator import lambda_handler as orchestrator_handler
            orchestrator_handler({
                'workflow_id': event['workflow_id'],
                'task_id': event['task_id'],
                'status': result.get('status', 'success'),
                'output': result.get('output'),
            }, None)

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
