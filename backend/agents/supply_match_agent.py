"""
SupplyMatch Agent - Direct farmer-processor buyer matching.

This agent eliminates middlemen by matching farmers with processors based on
crop type, quantity, quality, and location.
"""

import json
import logging
import math
from typing import Any, Dict, List
from datetime import datetime
import uuid

from agents.base_agent import BaseAgent
from config import (
    PROCESSOR_PROFILES_TABLE,
    DEFAULT_SUPPLY_INCOME_GAIN,
)
from utils.errors import ValidationException

logger = logging.getLogger(__name__)


class SupplyMatchAgent(BaseAgent):
    """Agent for matching farmers with processors."""

    def __init__(self):
        """Initialize SupplyMatch Agent."""
        super().__init__('SupplyMatch')
        self.processor_profiles_table = self.get_dynamodb_table(PROCESSOR_PROFILES_TABLE)

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process supply matching request.

        Args:
            request_data: Request containing farmer_id, crop_type, quantity, quality_grade, location

        Returns:
            Top 3 buyer matches with direct connection links
        """
        try:
            # Validate input
            self._validate_input(request_data)

            farmer_id = request_data.get('farmer_id')
            crop_type = request_data.get('crop_type')
            quantity_kg = request_data.get('quantity_kg', 0)
            quality_grade = request_data.get('quality_grade', 'B')
            location = request_data.get('location', {})

            self.logger.info(f"Matching {quantity_kg}kg of {crop_type} ({quality_grade}) for farmer {farmer_id}")

            # Get processor profiles
            processors = self._get_matching_processors(crop_type, quality_grade)

            # Calculate match scores
            scored_matches = self._calculate_match_scores(
                processors, quantity_kg, quality_grade, location
            )

            # Get top 3 matches
            top_matches = sorted(scored_matches, key=lambda x: x['match_score'], reverse=True)[:3]

            # Generate connection links
            matches_with_links = self._add_connection_links(top_matches, farmer_id)

            # Calculate income impact
            income_impact = self._calculate_income_impact(matches_with_links, quantity_kg)

            recommendation = {
                'top_3_buyer_matches': matches_with_links,
                'no_middleman_flag': True,
                'estimated_income_rupees': income_impact,
                'confidence_score': 0.88,
                'reasoning': f'Matched {len(matches_with_links)} processors for {crop_type}'
            }

            return self.create_response(
                status='success',
                output=recommendation,
                confidence_score=0.88,
                reasoning=recommendation['reasoning']
            )

        except ValidationException as e:
            self.logger.error(f"Validation error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except Exception as e:
            self.logger.error(f"Error matching supply: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """Validate input data."""
        if not request_data.get('farmer_id'):
            raise ValidationException('farmer_id is required')
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        quantity = request_data.get('quantity_kg', 0)
        if not isinstance(quantity, (int, float)) or quantity <= 0:
            raise ValidationException('quantity_kg must be positive')

        quality_grade = request_data.get('quality_grade', 'B')
        if quality_grade not in ['A', 'B', 'C']:
            raise ValidationException('quality_grade must be A, B, or C')

    def _get_matching_processors(self, crop_type: str, quality_grade: str) -> List[Dict[str, Any]]:
        """Get processors matching crop type and quality requirements."""
        try:
            # In production, query DynamoDB processor_profiles table
            # For now, return mock processors
            mock_processors = [
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
                },
                {
                    'processor_id': 'proc-003',
                    'name': 'Rural Harvest Pvt Ltd',
                    'location': {'latitude': 15.7, 'longitude': 75.5},
                    'crops_needed': ['tomato', 'capsicum'],
                    'daily_requirement_kg': 2000,
                    'quality_requirement': 'B_grade',
                    'price_offered': 50,
                    'transport_available': True,
                    'payment_terms': 'same_day_cash',
                    'historical_reliability': 0.95
                }
            ]

            # Filter by crop type
            matching = [p for p in mock_processors if crop_type.lower() in [c.lower() for c in p.get('crops_needed', [])]]
            return matching

        except Exception as e:
            self.logger.error(f"Error getting matching processors: {str(e)}")
            return []

    def _calculate_match_scores(self, processors: List[Dict[str, Any]], quantity_kg: float,
                               quality_grade: str, location: Dict[str, float]) -> List[Dict[str, Any]]:
        """Calculate match scores for each processor."""
        scored = []

        for processor in processors:
            # Distance score (0-30 points)
            distance_score = self._calculate_distance_score(location, processor['location'])

            # Price score (0-30 points)
            price_score = self._calculate_price_score(processor['price_offered'])

            # Reliability score (0-20 points)
            reliability_score = processor['historical_reliability'] * 20

            # Quality match score (0-20 points)
            quality_score = self._calculate_quality_score(quality_grade, processor['quality_requirement'])

            # Total score
            total_score = distance_score + price_score + reliability_score + quality_score

            scored.append({
                **processor,
                'match_score': total_score,
                'distance_score': distance_score,
                'price_score': price_score,
                'reliability_score': reliability_score,
                'quality_score': quality_score
            })

        return scored

    def _calculate_distance_score(self, farmer_location: Dict[str, float],
                                 processor_location: Dict[str, float]) -> float:
        """Calculate distance-based score (closer is better)."""
        if not farmer_location or not processor_location:
            return 15  # Default middle score

        lat1 = farmer_location.get('latitude', 0)
        lon1 = farmer_location.get('longitude', 0)
        lat2 = processor_location.get('latitude', 0)
        lon2 = processor_location.get('longitude', 0)

        # Simple distance calculation (in km)
        distance = math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) * 111  # Rough conversion to km

        # Score: 30 points for <10km, decreasing with distance
        if distance < 10:
            return 30
        elif distance < 50:
            return 20
        else:
            return 10

    def _calculate_price_score(self, price_offered: float) -> float:
        """Calculate price-based score (higher price is better)."""
        # Normalize to 0-30 scale
        # Assume prices range from 30-60 rupees
        normalized = (price_offered - 30) / 30 * 30
        return min(max(normalized, 0), 30)

    def _calculate_quality_score(self, farmer_quality: str, processor_requirement: str) -> float:
        """Calculate quality match score."""
        quality_map = {'A': 3, 'B': 2, 'C': 1}
        farmer_level = quality_map.get(farmer_quality, 2)
        processor_level = quality_map.get(processor_requirement.split('_')[0], 2)

        if farmer_level >= processor_level:
            return 20
        elif farmer_level == processor_level - 1:
            return 15
        else:
            return 10

    def _add_connection_links(self, matches: List[Dict[str, Any]], farmer_id: str) -> List[Dict[str, Any]]:
        """Add direct connection links to matches."""
        for i, match in enumerate(matches):
            connection_id = str(uuid.uuid4())
            match['direct_connection_link'] = f"https://harvelogix.app/connect/{connection_id}"
            match['rank'] = i + 1

        return matches

    def _calculate_income_impact(self, matches: List[Dict[str, Any]], quantity_kg: float) -> float:
        """Calculate estimated income from best match."""
        if not matches:
            return 0

        best_match = matches[0]
        price_per_kg = best_match.get('price_offered', 45)
        return price_per_kg * quantity_kg


def lambda_handler(event, context):
    """Lambda handler for SupplyMatch Agent."""
    try:
        agent = SupplyMatchAgent()
        request_data = event.get('request_data', {})
        farmer_id = event.get('farmer_id', 'unknown')

        result = agent.process(request_data)
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
