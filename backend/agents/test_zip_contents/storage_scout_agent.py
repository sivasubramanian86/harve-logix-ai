"""
StorageScout Agent - Zero-loss storage protocol using ambient data + crop type.

This agent recommends optimal storage methods and conditions to minimize post-harvest loss.
"""

import json
import logging
from typing import Any, Dict
from datetime import datetime

from agents.base_agent import BaseAgent
from config import (
    STORAGE_TEMPLATES_TABLE,
    DEFAULT_HARVEST_INCOME_GAIN,
)
from utils.errors import ValidationException

logger = logging.getLogger(__name__)


class StorageScoutAgent(BaseAgent):
    """Agent for recommending optimal storage protocols."""

    def __init__(self):
        """Initialize StorageScout Agent."""
        super().__init__('StorageScout')
        self.storage_templates_table = self.get_dynamodb_table(STORAGE_TEMPLATES_TABLE)

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process storage recommendation request.

        Args:
            request_data: Request containing crop_type, storage_duration, ambient_conditions

        Returns:
            Storage recommendation with method, temperature, humidity, waste reduction
        """
        try:
            # Validate input
            self._validate_input(request_data)

            crop_type = request_data.get('crop_type')
            storage_duration = request_data.get('storage_duration_days', 7)
            ambient_conditions = request_data.get('ambient_conditions', {})

            self.logger.info(f"Analyzing storage for {crop_type} for {storage_duration} days")

            # Get storage templates
            templates = self._get_storage_templates(crop_type)

            # Analyze ambient conditions
            condition_analysis = self._analyze_ambient_conditions(ambient_conditions)

            # Use Bedrock for reasoning
            recommendation = self._bedrock_reasoning(
                crop_type=crop_type,
                storage_duration=storage_duration,
                templates=templates,
                ambient_conditions=condition_analysis
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
            self.logger.error(f"Error analyzing storage: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """Validate input data."""
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        storage_duration = request_data.get('storage_duration_days', 0)
        if not isinstance(storage_duration, (int, float)) or storage_duration <= 0:
            raise ValidationException('storage_duration_days must be positive')

    def _get_storage_templates(self, crop_type: str) -> Dict[str, Any]:
        """Get storage templates for crop type."""
        try:
            # In production, query DynamoDB
            templates_map = {
                'tomato': {
                    'methods': ['shade_storage', 'cold_storage', 'modified_atmosphere'],
                    'optimal_temp_c': 22,
                    'optimal_humidity_percent': 65,
                    'shelf_life_days': 14
                },
                'onion': {
                    'methods': ['shade_storage', 'cold_storage'],
                    'optimal_temp_c': 15,
                    'optimal_humidity_percent': 70,
                    'shelf_life_days': 30
                },
                'capsicum': {
                    'methods': ['cold_storage', 'modified_atmosphere'],
                    'optimal_temp_c': 10,
                    'optimal_humidity_percent': 90,
                    'shelf_life_days': 21
                }
            }

            return templates_map.get(crop_type.lower(), templates_map['tomato'])
        except Exception as e:
            self.logger.error(f"Error getting storage templates: {str(e)}")
            return {}

    def _analyze_ambient_conditions(self, ambient_conditions: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze ambient conditions."""
        return {
            'temperature_c': ambient_conditions.get('temperature_c', 25),
            'humidity_percent': ambient_conditions.get('humidity_percent', 60),
            'light_level': ambient_conditions.get('light_level', 'high'),
            'ventilation': ambient_conditions.get('ventilation', 'moderate')
        }

    def _bedrock_reasoning(self, crop_type: str, storage_duration: int,
                          templates: Dict[str, Any],
                          ambient_conditions: Dict[str, Any]) -> Dict[str, Any]:
        """Use Bedrock for storage recommendation reasoning."""
        try:
            prompt = f"""You are an expert in post-harvest storage. Recommend optimal storage conditions for {crop_type}.

Crop Storage Templates:
- Available Methods: {', '.join(templates.get('methods', []))}
- Optimal Temperature: {templates.get('optimal_temp_c', 20)}°C
- Optimal Humidity: {templates.get('optimal_humidity_percent', 65)}%
- Shelf Life: {templates.get('shelf_life_days', 14)} days

Current Ambient Conditions:
- Temperature: {ambient_conditions.get('temperature_c', 25)}°C
- Humidity: {ambient_conditions.get('humidity_percent', 60)}%
- Light Level: {ambient_conditions.get('light_level', 'high')}
- Ventilation: {ambient_conditions.get('ventilation', 'moderate')}

Storage Duration: {storage_duration} days

Provide:
1. Recommended storage method
2. Temperature setpoint (°C)
3. Humidity setpoint (%)
4. Estimated waste reduction (%)
5. Estimated shelf life extension (days)
6. Confidence score (0-1)
7. Reasoning

Format as JSON with keys: storage_method, temperature_setpoint_celsius, humidity_setpoint_percent, waste_reduction_percent, shelf_life_extension_days, confidence_score, reasoning"""

            response_text = self.invoke_bedrock(prompt)
            recommendation = self.extract_json_from_response(response_text)

            if not recommendation:
                recommendation = self._get_default_recommendation(templates)

            return recommendation

        except Exception as e:
            self.logger.error(f"Error in Bedrock reasoning: {str(e)}")
            return self._get_default_recommendation(templates)

    def _get_default_recommendation(self, templates: Dict[str, Any]) -> Dict[str, Any]:
        """Get default recommendation."""
        return {
            'storage_method': templates.get('methods', ['shade_storage'])[0],
            'temperature_setpoint_celsius': templates.get('optimal_temp_c', 22),
            'humidity_setpoint_percent': templates.get('optimal_humidity_percent', 65),
            'waste_reduction_percent': 25,
            'shelf_life_extension_days': 7,
            'confidence_score': 0.75,
            'reasoning': 'Default recommendation based on crop templates'
        }


def lambda_handler(event, context):
    """Lambda handler for StorageScout Agent."""
    try:
        agent = StorageScoutAgent()
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
