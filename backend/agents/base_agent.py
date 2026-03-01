"""
Base agent class for HarveLogix AI agents.

Provides common functionality for all agents including Bedrock integration,
error handling, and logging.
"""

import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, List
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

# RAG imports (optional, with fallback)
try:
    from services.retrieverService import retrieve_context, build_rag_prompt
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    retrieve_context = None
    build_rag_prompt = None

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

    def invoke_bedrock_with_rag(
        self,
        query: str,
        system_prompt: Optional[str] = None,
        k: int = 3,
        use_rag: bool = True
    ) -> str:
        """
        Invoke Bedrock with RAG (Retrieval-Augmented Generation) support.

        Args:
            query: User query
            system_prompt: Optional system prompt
            k: Number of documents to retrieve
            use_rag: Whether to use RAG (default True)

        Returns:
            Model response text
        """
        try:
            if not use_rag or not RAG_AVAILABLE or retrieve_context is None or build_rag_prompt is None:
                self.logger.info("RAG not enabled or available, using standard invoke")
                return self.invoke_bedrock(query, system_prompt)

            # Retrieve relevant documents
            documents = retrieve_context(query=query, k=k)
            self.logger.info(f"Retrieved {len(documents)} documents for RAG")

            # Build augmented prompt
            rag_prompts = build_rag_prompt(query, documents, system_prompt)

            # Invoke Bedrock with augmented prompt
            return self.invoke_bedrock(
                prompt=rag_prompts['user_prompt'],
                system_prompt=rag_prompts['system_prompt']
            )

        except Exception as e:
            self.logger.warning(f"RAG invocation error: {e}, falling back to standard invoke")
            return self.invoke_bedrock(query, system_prompt)

    def retrieve_context_for_query(
        self,
        query: str,
        k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Retrieve context documents for a query (without invoking Bedrock).

        Args:
            query: Query text
            k: Number of documents to retrieve

        Returns:
            List of retrieved documents
        """
        try:
            if not RAG_AVAILABLE or retrieve_context is None:
                self.logger.warning("RAG not available")
                return []

            documents = retrieve_context(query=query, k=k)
            return documents

        except Exception as e:
            self.logger.error(f"Context retrieval error: {e}")
            return []
