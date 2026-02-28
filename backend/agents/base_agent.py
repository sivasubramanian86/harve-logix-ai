"""
Base agent class for HarveLogix AI agents.

Provides common functionality for all agents including Bedrock integration,
error handling, and logging.
"""

import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

from config import (
    BEDROCK_MODEL_ID,
    BEDROCK_MAX_TOKENS,
    BEDROCK_TEMPERATURE,
    AWS_REGION,
)
from utils.errors import BedrockException, DataAccessException
from utils.retry import retry_with_backoff

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all HarveLogix AI agents."""

    def __init__(self, agent_name: str):
        """
        Initialize base agent.

        Args:
            agent_name: Name of the agent
        """
        self.agent_name = agent_name
        self.model_id = BEDROCK_MODEL_ID
        self.bedrock_client = boto3.client('bedrock-runtime', region_name=AWS_REGION)
        self.dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        self.logger = logging.getLogger(f"{__name__}.{agent_name}")

    @abstractmethod
    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process request and return agent output.

        Args:
            request_data: Request data

        Returns:
            Agent output
        """
        pass

    @retry_with_backoff(exceptions=(ClientError,))
    def invoke_bedrock(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Invoke Bedrock Claude model for reasoning.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Model response text
        """
        try:
            messages = [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]

            kwargs = {
                'modelId': self.model_id,
                'contentType': 'application/json',
                'accept': 'application/json',
                'body': json.dumps({
                    'anthropic_version': 'bedrock-2023-06-01',
                    'max_tokens': BEDROCK_MAX_TOKENS,
                    'temperature': BEDROCK_TEMPERATURE,
                    'messages': messages
                })
            }

            if system_prompt:
                kwargs['body'] = json.dumps({
                    'anthropic_version': 'bedrock-2023-06-01',
                    'max_tokens': BEDROCK_MAX_TOKENS,
                    'temperature': BEDROCK_TEMPERATURE,
                    'system': system_prompt,
                    'messages': messages
                })

            response = self.bedrock_client.invoke_model(**kwargs)
            response_body = json.loads(response['body'].read())
            content = response_body['content'][0]['text']

            self.logger.info(f"Bedrock invocation successful for {self.agent_name}")
            return content

        except ClientError as e:
            self.logger.error(f"Bedrock invocation failed: {str(e)}")
            raise BedrockException(f"Bedrock invocation failed: {str(e)}", {'agent': self.agent_name})

    def extract_json_from_response(self, response_text: str) -> Dict[str, Any]:
        """
        Extract JSON from Bedrock response text.

        Args:
            response_text: Response text from Bedrock

        Returns:
            Extracted JSON as dictionary
        """
        try:
            # Try direct JSON parsing first
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

            self.logger.warning(f"Could not extract JSON from response: {response_text[:100]}")
            return {}

    def get_dynamodb_table(self, table_name: str):
        """
        Get DynamoDB table resource.

        Args:
            table_name: Name of the table

        Returns:
            DynamoDB table resource
        """
        try:
            return self.dynamodb.Table(table_name)
        except ClientError as e:
            self.logger.error(f"Error accessing DynamoDB table {table_name}: {str(e)}")
            raise DataAccessException(f"Error accessing DynamoDB table {table_name}: {str(e)}")

    def create_response(
        self,
        status: str,
        output: Optional[Dict[str, Any]] = None,
        confidence_score: float = 0.0,
        reasoning: str = '',
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create standardized agent response.

        Args:
            status: Response status (success, error)
            output: Agent output data
            confidence_score: Confidence score (0-1)
            reasoning: Reasoning explanation
            error: Error message if status is error

        Returns:
            Standardized response
        """
        response = {
            'status': status,
            'agent': self.agent_name,
            'timestamp': datetime.utcnow().isoformat(),
        }

        if status == 'success':
            response['output'] = output or {}
            response['confidence_score'] = confidence_score
            response['reasoning'] = reasoning
        else:
            response['error'] = error

        return response

    def log_execution(self, farmer_id: str, request_data: Dict[str, Any], response: Dict[str, Any]) -> None:
        """
        Log agent execution for monitoring.

        Args:
            farmer_id: Farmer ID
            request_data: Request data
            response: Response data
        """
        self.logger.info(
            f"Agent execution: {self.agent_name}",
            extra={
                'farmer_id': farmer_id,
                'status': response.get('status'),
                'confidence_score': response.get('confidence_score'),
                'timestamp': response.get('timestamp')
            }
        )
