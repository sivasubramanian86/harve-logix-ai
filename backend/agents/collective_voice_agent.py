"""
CollectiveVoice Agent - Aggregation and collective bargaining.

This agent identifies farmers with the same crop in a region and proposes
aggregation for bulk discounts and shared logistics.
"""

import json
import logging
from typing import Any, Dict, List
from datetime import datetime
import uuid

from agents.base_agent import BaseAgent
from config import (
    FARMERS_TABLE,
    MIN_FARMERS_FOR_COLLECTIVE,
    COLLECTIVE_BULK_DISCOUNT_PERCENT,
    DEFAULT_COLLECTIVE_INCOME_GAIN,
)
from utils.errors import ValidationException

logger = logging.getLogger(__name__)


class CollectiveVoiceAgent(BaseAgent):
    """Agent for proposing farmer aggregation and collective bargaining."""

    def __init__(self):
        """Initialize CollectiveVoice Agent."""
        super().__init__('CollectiveVoice')
        self.farmers_table = self.get_dynamodb_table(FARMERS_TABLE)

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process collective voice request.

        Args:
            request_data: Request containing farmer_profiles, crop_type, region

        Returns:
            Aggregation proposal with collective size, discount, logistics plan
        """
        try:
            # Validate input
            self._validate_input(request_data)

            crop_type = request_data.get('crop_type')
            region = request_data.get('region')
            farmer_profiles = request_data.get('farmer_profiles', [])

            self.logger.info(f"Proposing aggregation for {crop_type} in {region}")

            # Get nearby farmers with same crop
            nearby_farmers = self._get_nearby_farmers(crop_type, region, farmer_profiles)

            # Check if minimum threshold met
            if len(nearby_farmers) < MIN_FARMERS_FOR_COLLECTIVE:
                return self.create_response(
                    status='error',
                    error=f'Insufficient farmers ({len(nearby_farmers)}) for collective. Minimum: {MIN_FARMERS_FOR_COLLECTIVE}'
                )

            # Calculate aggregation metrics
            aggregation = self._calculate_aggregation(nearby_farmers, crop_type)

            # Plan shared logistics
            logistics_plan = self._plan_logistics(nearby_farmers, crop_type)

            # Generate collective proposal
            proposal = {
                'aggregation_proposal': {
                    'collective_id': str(uuid.uuid4()),
                    'crop_type': crop_type,
                    'region': region,
                    'farmer_count': len(nearby_farmers),
                    'total_production_kg': aggregation['total_production_kg'],
                    'bulk_discount_percent': aggregation['bulk_discount_percent'],
                    'estimated_income_increase_per_farmer': aggregation['income_increase_per_farmer']
                },
                'collective_size': len(nearby_farmers),
                'expected_discount_percent': aggregation['bulk_discount_percent'],
                'shared_logistics_plan': logistics_plan,
                'confidence_score': 0.87,
                'reasoning': f'Aggregation proposal for {len(nearby_farmers)} farmers producing {aggregation["total_production_kg"]}kg'
            }

            return self.create_response(
                status='success',
                output=proposal,
                confidence_score=0.87,
                reasoning=proposal['reasoning']
            )

        except ValidationException as e:
            self.logger.error(f"Validation error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except Exception as e:
            self.logger.error(f"Error proposing aggregation: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """Validate input data."""
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        if not request_data.get('region'):
            raise ValidationException('region is required')

    def _get_nearby_farmers(self, crop_type: str, region: str,
                           farmer_profiles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get nearby farmers with same crop."""
        try:
            # In production, query DynamoDB with GSI on (crop_type, region)
            # For now, filter provided farmer profiles
            nearby = [
                f for f in farmer_profiles
                if f.get('crop_type', '').lower() == crop_type.lower()
                and f.get('region', '').lower() == region.lower()
            ]

            # If no profiles provided, return mock farmers
            if not nearby:
                nearby = self._get_mock_farmers(crop_type, region)

            return nearby

        except Exception as e:
            self.logger.error(f"Error getting nearby farmers: {str(e)}")
            return []

    def _get_mock_farmers(self, crop_type: str, region: str) -> List[Dict[str, Any]]:
        """Get mock farmers for testing."""
        return [
            {
                'farmer_id': f'farmer-{i:03d}',
                'crop_type': crop_type,
                'region': region,
                'field_size_acres': 2.5 + (i * 0.5),
                'expected_production_kg': 6250 + (i * 1250),
                'location': {'latitude': 15.8 + (i * 0.01), 'longitude': 75.6 + (i * 0.01)}
            }
            for i in range(60)  # 60 farmers
        ]

    def _calculate_aggregation(self, farmers: List[Dict[str, Any]], crop_type: str) -> Dict[str, Any]:
        """Calculate aggregation metrics."""
        total_production = sum(f.get('expected_production_kg', 0) for f in farmers)
        avg_production_per_farmer = total_production / len(farmers) if farmers else 0

        # Bulk discount increases with volume
        if total_production > 100000:
            bulk_discount = 20
        elif total_production > 50000:
            bulk_discount = 15
        else:
            bulk_discount = 10

        # Income increase from bulk discount
        avg_price = self._get_avg_price(crop_type)
        income_increase = (avg_price * avg_production_per_farmer * bulk_discount) / 100

        return {
            'total_production_kg': total_production,
            'avg_production_per_farmer': avg_production_per_farmer,
            'bulk_discount_percent': bulk_discount,
            'income_increase_per_farmer': income_increase
        }

    def _get_avg_price(self, crop_type: str) -> float:
        """Get average market price for crop type."""
        price_map = {
            'tomato': 48,
            'onion': 35,
            'capsicum': 60
        }
        return price_map.get(crop_type.lower(), 45)

    def _plan_logistics(self, farmers: List[Dict[str, Any]], crop_type: str) -> Dict[str, Any]:
        """Plan shared logistics for collective."""
        total_production = sum(f.get('expected_production_kg', 0) for f in farmers)

        # Estimate transport requirements
        trucks_needed = max(1, int(total_production / 10000))  # 10 tons per truck
        storage_capacity_needed = total_production * 1.2  # 20% buffer

        return {
            'transport_plan': {
                'trucks_needed': trucks_needed,
                'estimated_cost_per_truck': 5000,
                'total_transport_cost': trucks_needed * 5000,
                'collection_points': max(1, len(farmers) // 20),  # 1 collection point per 20 farmers
                'consolidation_center': f'{crop_type.capitalize()} Hub - {farmers[0].get("region", "Region")}'
            },
            'storage_plan': {
                'storage_capacity_kg': storage_capacity_needed,
                'storage_type': 'cold_storage',
                'estimated_cost_per_day': 500,
                'duration_days': 7
            },
            'quality_assurance': {
                'sampling_rate_percent': 5,
                'grading_location': 'Consolidation Center',
                'certification_provided': True
            },
            'payment_plan': {
                'settlement_days': 1,
                'payment_method': 'Direct bank transfer',
                'transaction_fee_percent': 2
            }
        }


def lambda_handler(event, context):
    """Lambda handler for CollectiveVoice Agent."""
    try:
        agent = CollectiveVoiceAgent()
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
