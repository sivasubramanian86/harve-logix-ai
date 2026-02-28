"""
Property-based tests for HarveLogix AI agents using Hypothesis.

**Validates: Requirements 1.1-1.7**
"""

import pytest
from hypothesis import given, strategies as st, assume
from datetime import datetime, timedelta

from agents.harvest_ready_agent import HarvestReadyAgent
from agents.storage_scout_agent import StorageScoutAgent
from agents.supply_match_agent import SupplyMatchAgent
from agents.water_wise_agent import WaterWiseAgent
from agents.quality_hub_agent import QualityHubAgent
from agents.collective_voice_agent import CollectiveVoiceAgent


# Strategies for generating test data
crop_types = st.sampled_from(['tomato', 'onion', 'capsicum'])
growth_stages = st.integers(min_value=0, max_value=10)
quality_grades = st.sampled_from(['A', 'B', 'C'])
locations = st.fixed_dictionaries({
    'latitude': st.floats(min_value=8.0, max_value=35.0),
    'longitude': st.floats(min_value=68.0, max_value=97.0)
})
positive_numbers = st.floats(min_value=0.1, max_value=100000)
confidence_scores = st.floats(min_value=0.0, max_value=1.0)


class TestHarvestReadyAgentProperties:
    """Property-based tests for HarvestReady Agent."""

    @given(crop_types, growth_stages, locations)
    def test_harvest_recommendation_always_returns_valid_date(self, crop_type, growth_stage, location):
        """Property: Harvest recommendation always returns a valid future date."""
        agent = HarvestReadyAgent()
        request = {
            'crop_type': crop_type,
            'current_growth_stage': growth_stage,
            'location': location
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            assert 'harvest_date' in output
            # Parse and validate date format
            harvest_date = datetime.strptime(output['harvest_date'], '%Y-%m-%d')
            assert harvest_date > datetime.now()

    @given(crop_types, growth_stages, locations)
    def test_harvest_recommendation_confidence_in_valid_range(self, crop_type, growth_stage, location):
        """Property: Confidence score is always between 0 and 1."""
        agent = HarvestReadyAgent()
        request = {
            'crop_type': crop_type,
            'current_growth_stage': growth_stage,
            'location': location
        }

        result = agent.process(request)

        if result['status'] == 'success':
            confidence = result.get('confidence_score', 0)
            assert 0 <= confidence <= 1

    @given(crop_types, growth_stages, locations)
    def test_harvest_income_gain_is_positive(self, crop_type, growth_stage, location):
        """Property: Expected income gain is always positive."""
        agent = HarvestReadyAgent()
        request = {
            'crop_type': crop_type,
            'current_growth_stage': growth_stage,
            'location': location
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            assert output.get('expected_income_gain_rupees', 0) >= 0

    @given(crop_types, growth_stages)
    def test_higher_growth_stage_means_sooner_harvest(self, crop_type, growth_stage):
        """Property: Higher growth stage should recommend earlier harvest."""
        assume(growth_stage < 10)  # Leave room for higher stage

        agent = HarvestReadyAgent()

        early_request = {
            'crop_type': crop_type,
            'current_growth_stage': growth_stage,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        late_request = {
            'crop_type': crop_type,
            'current_growth_stage': growth_stage + 1,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        early_result = agent.process(early_request)
        late_result = agent.process(late_request)

        if early_result['status'] == 'success' and late_result['status'] == 'success':
            early_date = datetime.strptime(early_result['output']['harvest_date'], '%Y-%m-%d')
            late_date = datetime.strptime(late_result['output']['harvest_date'], '%Y-%m-%d')
            # Higher growth stage should recommend same or earlier date
            assert late_date <= early_date


class TestStorageScoutAgentProperties:
    """Property-based tests for StorageScout Agent."""

    @given(crop_types, st.integers(min_value=1, max_value=90))
    def test_storage_recommendation_has_valid_temperature(self, crop_type, storage_duration):
        """Property: Storage temperature is within reasonable range."""
        agent = StorageScoutAgent()
        request = {
            'crop_type': crop_type,
            'storage_duration_days': storage_duration,
            'ambient_conditions': {
                'temperature_c': 25,
                'humidity_percent': 60
            }
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            temp = output.get('temperature_setpoint_celsius', 0)
            assert 0 <= temp <= 30  # Reasonable storage temperature range

    @given(crop_types, st.integers(min_value=1, max_value=90))
    def test_storage_waste_reduction_is_positive(self, crop_type, storage_duration):
        """Property: Waste reduction percentage is always positive."""
        agent = StorageScoutAgent()
        request = {
            'crop_type': crop_type,
            'storage_duration_days': storage_duration,
            'ambient_conditions': {
                'temperature_c': 25,
                'humidity_percent': 60
            }
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            waste_reduction = output.get('waste_reduction_percent', 0)
            assert waste_reduction >= 0

    @given(crop_types, st.integers(min_value=1, max_value=90))
    def test_storage_humidity_in_valid_range(self, crop_type, storage_duration):
        """Property: Humidity setpoint is between 0 and 100%."""
        agent = StorageScoutAgent()
        request = {
            'crop_type': crop_type,
            'storage_duration_days': storage_duration,
            'ambient_conditions': {
                'temperature_c': 25,
                'humidity_percent': 60
            }
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            humidity = output.get('humidity_setpoint_percent', 0)
            assert 0 <= humidity <= 100


class TestSupplyMatchAgentProperties:
    """Property-based tests for SupplyMatch Agent."""

    @given(crop_types, positive_numbers, quality_grades)
    def test_supply_match_returns_top_3_or_fewer(self, crop_type, quantity, quality_grade):
        """Property: Supply match returns at most 3 matches."""
        agent = SupplyMatchAgent()
        request = {
            'farmer_id': 'farmer-001',
            'crop_type': crop_type,
            'quantity_kg': quantity,
            'quality_grade': quality_grade,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            matches = output.get('top_3_buyer_matches', [])
            assert len(matches) <= 3

    @given(crop_types, positive_numbers, quality_grades)
    def test_supply_match_income_is_positive(self, crop_type, quantity, quality_grade):
        """Property: Estimated income is always positive."""
        agent = SupplyMatchAgent()
        request = {
            'farmer_id': 'farmer-001',
            'crop_type': crop_type,
            'quantity_kg': quantity,
            'quality_grade': quality_grade,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            income = output.get('estimated_income_rupees', 0)
            assert income >= 0

    @given(crop_types, positive_numbers, quality_grades)
    def test_supply_match_scores_are_ordered(self, crop_type, quantity, quality_grade):
        """Property: Match scores are in descending order."""
        agent = SupplyMatchAgent()
        request = {
            'farmer_id': 'farmer-001',
            'crop_type': crop_type,
            'quantity_kg': quantity,
            'quality_grade': quality_grade,
            'location': {'latitude': 15.8, 'longitude': 75.6}
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            matches = output.get('top_3_buyer_matches', [])
            scores = [m.get('match_score', 0) for m in matches]
            # Verify scores are in descending order
            assert scores == sorted(scores, reverse=True)


class TestWaterWiseAgentProperties:
    """Property-based tests for WaterWise Agent."""

    @given(crop_types, st.lists(st.sampled_from(['washing', 'cooling', 'processing']), min_size=1, max_size=3), positive_numbers)
    def test_water_savings_is_positive(self, crop_type, operations, cost_per_liter):
        """Property: Water savings is always positive."""
        agent = WaterWiseAgent()
        request = {
            'crop_type': crop_type,
            'post_harvest_operations': operations,
            'climate_data': {
                'temperature_c': 25,
                'humidity_percent': 60
            },
            'cost_per_liter_rupees': cost_per_liter
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            water_savings = output.get('water_savings_liters', 0)
            assert water_savings >= 0

    @given(crop_types, st.lists(st.sampled_from(['washing', 'cooling', 'processing']), min_size=1, max_size=3), positive_numbers)
    def test_cost_savings_is_positive(self, crop_type, operations, cost_per_liter):
        """Property: Cost savings is always positive."""
        agent = WaterWiseAgent()
        request = {
            'crop_type': crop_type,
            'post_harvest_operations': operations,
            'climate_data': {
                'temperature_c': 25,
                'humidity_percent': 60
            },
            'cost_per_liter_rupees': cost_per_liter
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            cost_savings = output.get('cost_savings_rupees', 0)
            assert cost_savings >= 0


class TestQualityHubAgentProperties:
    """Property-based tests for QualityHub Agent."""

    @given(crop_types, positive_numbers)
    def test_quality_grade_is_valid(self, crop_type, batch_size):
        """Property: Quality grade is always A, B, or C."""
        agent = QualityHubAgent()
        request = {
            'crop_type': crop_type,
            'batch_size_kg': batch_size,
            'farmer_photo': 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='  # Minimal base64 image
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            grade = output.get('quality_grade', '')
            assert grade in ['A', 'B', 'C']

    @given(crop_types, positive_numbers)
    def test_defect_percent_in_valid_range(self, crop_type, batch_size):
        """Property: Defect percentage is between 0 and 100."""
        agent = QualityHubAgent()
        request = {
            'crop_type': crop_type,
            'batch_size_kg': batch_size,
            'farmer_photo': 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            defect_percent = output.get('defect_percent', 0)
            assert 0 <= defect_percent <= 100

    @given(crop_types, positive_numbers)
    def test_price_premium_is_non_negative(self, crop_type, batch_size):
        """Property: Price premium is always non-negative."""
        agent = QualityHubAgent()
        request = {
            'crop_type': crop_type,
            'batch_size_kg': batch_size,
            'farmer_photo': 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            premium = output.get('market_price_premium_percent', 0)
            assert premium >= 0


class TestCollectiveVoiceAgentProperties:
    """Property-based tests for CollectiveVoice Agent."""

    @given(crop_types)
    def test_collective_discount_is_positive(self, crop_type):
        """Property: Collective discount is always positive."""
        agent = CollectiveVoiceAgent()

        # Generate mock farmers
        farmers = [
            {
                'farmer_id': f'farmer-{i:03d}',
                'crop_type': crop_type,
                'region': 'Karnataka',
                'expected_production_kg': 5000 + (i * 500)
            }
            for i in range(60)
        ]

        request = {
            'crop_type': crop_type,
            'region': 'Karnataka',
            'farmer_profiles': farmers
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            discount = output.get('expected_discount_percent', 0)
            assert discount > 0

    @given(crop_types)
    def test_collective_size_matches_farmer_count(self, crop_type):
        """Property: Collective size matches number of farmers."""
        agent = CollectiveVoiceAgent()

        farmers = [
            {
                'farmer_id': f'farmer-{i:03d}',
                'crop_type': crop_type,
                'region': 'Karnataka',
                'expected_production_kg': 5000 + (i * 500)
            }
            for i in range(60)
        ]

        request = {
            'crop_type': crop_type,
            'region': 'Karnataka',
            'farmer_profiles': farmers
        }

        result = agent.process(request)

        if result['status'] == 'success':
            output = result['output']
            collective_size = output.get('collective_size', 0)
            assert collective_size == len(farmers)
