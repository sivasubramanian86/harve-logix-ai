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
from core.bedrock_client import BedrockClient, get_bedrock_client

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

    def __init__(self, agent_name: str, model_id: Optional[str] = None):
        """
        Initialize base agent.

        Args:
            agent_name: Name of the agent
            model_id: Optional override for Bedrock model ID
        """
        self.agent_name = agent_name
        self.model_id = model_id or BEDROCK_MODEL_ID
        
        # Use centralized Bedrock client
        self.bedrock_client = get_bedrock_client(
            model_id=self.model_id,
            region=AWS_REGION
        )
        
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
    def invoke_bedrock(self, prompt: str, system_prompt: Optional[str] = None, language: str = 'en') -> str:
        """
        Invoke Bedrock Claude model for reasoning.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            language: Language code for response (e.g., 'hi', 'ta', 'en')

        Returns:
            Model response text
            
        Raises:
            BedrockException: If invocation fails
        """
        # Prepend language directive for Indian languages
        language_map = {
            'hi': 'Hindi',
            'ta': 'Tamil',
            'mr': 'Marathi',
            'te': 'Telugu',
            'kn': 'Kannada',
            'gu': 'Gujarati',
            'ml': 'Malayalam',
            'en': 'English'
        }
        lang_name = language_map.get(language, 'English')
        lang_directive = f"IMPORTANT: You MUST respond EXCLUSIVELY in {lang_name}."
        
        final_system_prompt = f"{lang_directive}\n\n{system_prompt}" if system_prompt else lang_directive

        try:
            return self.bedrock_client.invoke_model(
                prompt=prompt,
                system_prompt=final_system_prompt,
                model_id=self.model_id,
            )
        except BedrockException:
            # Re-raise Bedrock exceptions as-is
            raise
        except Exception as e:
            self.logger.error(f"Bedrock invocation failed: {str(e)}")
            raise BedrockException(
                f"Bedrock invocation failed: {str(e)}",
                {'agent': self.agent_name}
            )

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

    def health_check(self) -> Dict[str, Any]:
        """
        Perform agent health check including Bedrock availability.

        Returns:
            Health status dictionary with keys:
            - agent: Agent name
            - healthy: Boolean indicating health
            - bedrock_healthy: Bedrock service availability
            - timestamp: Check timestamp
            - error: Error message if not healthy
        """
        try:
            # Check Bedrock health
            bedrock_health = self.bedrock_client.health_check()
            
            status = {
                'agent': self.agent_name,
                'healthy': bedrock_health['healthy'],
                'bedrock_healthy': bedrock_health['healthy'],
                'timestamp': datetime.utcnow().isoformat(),
            }
            
            if not bedrock_health['healthy']:
                status['error'] = bedrock_health.get('error', 'Bedrock service unavailable')
            
            self.logger.info(f"Health check for {self.agent_name}: {status['healthy']}")
            return status
            
        except Exception as e:
            self.logger.error(f"Health check failed for {self.agent_name}: {str(e)}")
            return {
                'agent': self.agent_name,
                'healthy': False,
                'bedrock_healthy': False,
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e),
            }

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
