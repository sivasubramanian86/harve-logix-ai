"""
Bedrock Agent Core - Central orchestration and reasoning engine for HarveLogix AI.

This module implements the central orchestration logic that routes farmer requests
to appropriate agents and maintains farmer session state.
"""

import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

import boto3
from botocore.exceptions import ClientError

from config import (
    AWS_REGION,
    FARMERS_TABLE,
    AGENT_DECISIONS_TABLE,
    EVENTBRIDGE_BUS_NAME,
)
from utils.logger import get_logger
from utils.errors import DataAccessException

logger = get_logger(__name__)

# AWS Clients
bedrock_client = boto3.client('bedrock-runtime', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
lambda_client = boto3.client('lambda', region_name=AWS_REGION)
eventbridge_client = boto3.client('events', region_name=AWS_REGION)


class BedrockOrchestrator:
    """Central orchestration engine for HarveLogix AI agents."""

    def __init__(self):
        """Initialize Bedrock Orchestrator."""
        self.model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"
        self.farmers_table = dynamodb.Table(FARMERS_TABLE)
        self.decisions_table = dynamodb.Table(AGENT_DECISIONS_TABLE)
        self.logger = get_logger(__name__)

    def route_request(self, farmer_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route farmer request to appropriate agent(s).

        Args:
            farmer_id: Unique farmer identifier
            request_data: Request containing crop_type, growth_stage, etc.

        Returns:
            Orchestrated response from appropriate agent(s)
        """
        try:
            # Get farmer context
            farmer_context = self._get_farmer_context(farmer_id)

            # Determine which agent(s) to invoke
            agents_to_invoke = self._determine_agents(request_data, farmer_context)

            # Invoke agents
            results = self._invoke_agents(agents_to_invoke, request_data, farmer_context)

            # Update farmer state
            self._update_farmer_state(farmer_id, request_data, results)

            # Publish events to EventBridge
            self._publish_events(farmer_id, results)

            return {
                'status': 'success',
                'farmer_id': farmer_id,
                'agents_invoked': agents_to_invoke,
                'results': results,
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Error routing request for farmer {farmer_id}: {str(e)}")
            return {
                'status': 'error',
                'farmer_id': farmer_id,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def _get_farmer_context(self, farmer_id: str) -> Dict[str, Any]:
        """
        Get farmer context from DynamoDB.

        Args:
            farmer_id: Unique farmer identifier

        Returns:
            Farmer context including decisions_made, pending_decisions
        """
        try:
            response = self.farmers_table.get_item(Key={'farmer_id': farmer_id})
            if 'Item' in response:
                return response['Item']
            else:
                # Create new farmer record
                return {
                    'farmer_id': farmer_id,
                    'decisions_made': {},
                    'pending_decisions': []
                }
        except ClientError as e:
            self.logger.error(f"Error getting farmer context: {str(e)}")
            return {}

    def _determine_agents(self, request_data: Dict[str, Any], farmer_context: Dict[str, Any]) -> List[str]:
        """
        Determine which agents to invoke based on request.

        Args:
            request_data: Request data
            farmer_context: Farmer context

        Returns:
            List of agent names to invoke
        """
        agents = []

        # Check request type
        request_type = request_data.get('request_type', 'all')

        agent_map = {
            'harvest_ready': 'harvest_ready',
            'storage_scout': 'storage_scout',
            'supply_match': 'supply_match',
            'water_wise': 'water_wise',
            'quality_hub': 'quality_hub',
            'collective_voice': 'collective_voice'
        }

        if request_type == 'all':
            agents = list(agent_map.values())
        elif request_type in agent_map:
            agents = [agent_map[request_type]]

        return agents

    def _invoke_agents(self, agents: List[str], request_data: Dict[str, Any], 
                      farmer_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Invoke specified agents.

        Args:
            agents: List of agent names
            request_data: Request data
            farmer_context: Farmer context

        Returns:
            Results from all invoked agents
        """
        results = {}

        for agent in agents:
            try:
                # Map agent name to Lambda function
                function_name = f"harvelogix-{agent}-agent"

                # Prepare payload
                payload = {
                    'farmer_id': farmer_context.get('farmer_id'),
                    'request_data': request_data,
                    'farmer_context': farmer_context
                }

                # Invoke Lambda function
                response = lambda_client.invoke(
                    FunctionName=function_name,
                    InvocationType='RequestResponse',
                    Payload=json.dumps(payload)
                )

                # Parse response
                response_payload = json.loads(response['Payload'].read())
                results[agent] = response_payload

                self.logger.info(f"Agent {agent} invoked successfully")

            except ClientError as e:
                self.logger.error(f"Error invoking agent {agent}: {str(e)}")
                results[agent] = {'status': 'error', 'error': str(e)}

        return results

    def _update_farmer_state(self, farmer_id: str, request_data: Dict[str, Any], 
                            results: Dict[str, Any]) -> None:
        """
        Update farmer state in DynamoDB.

        Args:
            farmer_id: Unique farmer identifier
            request_data: Request data
            results: Results from agents
        """
        try:
            timestamp = datetime.utcnow().isoformat()

            # Update farmer record
            self.farmers_table.update_item(
                Key={'farmer_id': farmer_id, 'timestamp': timestamp},
                UpdateExpression='SET decisions_made = :decisions, last_updated = :updated',
                ExpressionAttributeValues={
                    ':decisions': results,
                    ':updated': timestamp
                }
            )

            # Store decision details
            for agent, result in results.items():
                if result.get('status') == 'success':
                    self.decisions_table.put_item(
                        Item={
                            'farmer_id': farmer_id,
                            'decision_timestamp': timestamp,
                            'agent_name': agent,
                            'decision_output': result.get('output', {}),
                            'reasoning': result.get('reasoning', ''),
                            'confidence_score': result.get('confidence_score', 0),
                            'ttl': int(datetime.utcnow().timestamp()) + (90 * 24 * 60 * 60)  # 90 days
                        }
                    )

            self.logger.info(f"Farmer state updated for {farmer_id}")

        except ClientError as e:
            self.logger.error(f"Error updating farmer state: {str(e)}")

    def _publish_events(self, farmer_id: str, results: Dict[str, Any]) -> None:
        """
        Publish events to EventBridge for orchestration.

        Args:
            farmer_id: Farmer ID
            results: Agent results
        """
        try:
            for agent, result in results.items():
                if result.get('status') == 'success':
                    # Map agent to event type
                    event_type_map = {
                        'harvest_ready': 'harvest_ready',
                        'storage_scout': 'storage_recommended',
                        'supply_match': 'supply_matched',
                        'water_wise': 'water_optimized',
                        'quality_hub': 'quality_certified',
                        'collective_voice': 'collective_proposed'
                    }

                    event_type = event_type_map.get(agent, f'{agent}_completed')

                    # Publish to EventBridge
                    eventbridge_client.put_events(
                        Entries=[
                            {
                                'Source': 'harvelogix.agents',
                                'DetailType': event_type,
                                'Detail': json.dumps({
                                    'farmer_id': farmer_id,
                                    'agent': agent,
                                    'output': result.get('output', {}),
                                    'timestamp': datetime.utcnow().isoformat()
                                }),
                                'EventBusName': EVENTBRIDGE_BUS_NAME
                            }
                        ]
                    )

                    self.logger.info(f"Event published: {event_type} for farmer {farmer_id}")

        except ClientError as e:
            self.logger.error(f"Error publishing events: {str(e)}")

    def get_farmer_decisions(self, farmer_id: str) -> List[Dict[str, Any]]:
        """
        Get all decisions for a farmer.

        Args:
            farmer_id: Unique farmer identifier

        Returns:
            List of farmer decisions
        """
        try:
            response = self.decisions_table.query(
                KeyConditionExpression='farmer_id = :farmer_id',
                ExpressionAttributeValues={':farmer_id': farmer_id},
                ScanIndexForward=False,  # Most recent first
                Limit=100
            )
            return response.get('Items', [])
        except ClientError as e:
            self.logger.error(f"Error getting farmer decisions: {str(e)}")
            return []

    def get_farmer_profile(self, farmer_id: str) -> Dict[str, Any]:
        """
        Get farmer profile and decision history.

        Args:
            farmer_id: Unique farmer identifier

        Returns:
            Farmer profile with decision history
        """
        try:
            # Get farmer context
            farmer_context = self._get_farmer_context(farmer_id)

            # Get decision history
            decisions = self.get_farmer_decisions(farmer_id)

            return {
                'farmer_id': farmer_id,
                'profile': farmer_context,
                'decision_history': decisions,
                'total_decisions': len(decisions)
            }
        except Exception as e:
            self.logger.error(f"Error getting farmer profile: {str(e)}")
            return {}


def lambda_handler(event, context):
    """
    Lambda handler for Bedrock Orchestrator.

    Args:
        event: Lambda event
        context: Lambda context

    Returns:
        Response from orchestrator
    """
    try:
        orchestrator = BedrockOrchestrator()

        # Extract parameters
        farmer_id = event.get('farmer_id')
        request_data = event.get('request_data', {})

        if not farmer_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'farmer_id is required'})
            }

        # Route request
        result = orchestrator.route_request(farmer_id, request_data)

        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }

    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
