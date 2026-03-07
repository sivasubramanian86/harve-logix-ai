"""
Centralized Bedrock client module for HarveLogixAI.

Provides unified interface for all Bedrock interactions including:
- Model invocation with error handling and retries
- Health checking for Bedrock availability
- Support for standard, multimodal, and embedding models
- Structured logging and monitoring
"""

import json
import logging
from typing import Any, Dict, Optional, Union
from datetime import datetime
from enum import Enum

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from config import (
    AWS_REGION,
    BEDROCK_MODEL_ID,
    BEDROCK_MAX_TOKENS,
    BEDROCK_TEMPERATURE,
    BEDROCK_MODEL_TYPE,
)
from utils.retry import retry_with_backoff
from utils.errors import BedrockException

logger = logging.getLogger(__name__)


class BedrockModelType(Enum):
    """Bedrock model types supported by HarveLogix."""
    STANDARD = "standard"  # Claude reasoning models
    MULTIMODAL = "multimodal"  # Claude with image/video support
    EMBEDDING = "embedding"  # Text embedding models


class BedrockConfig:
    """Configuration container for Bedrock models."""
    
    # Standard reasoning models (ap-south-2 available)
    CLAUDE_OPUS_4_5 = "anthropic.claude-opus-4-5-20251101-v1:0"
    CLAUDE_HAIKU_4_5 = "anthropic.claude-haiku-4-5-20251001-v1:0"
    CLAUDE_OPUS_4_6 = "anthropic.claude-opus-4-6-v1"
    
    # Embedding models
    TITAN_EMBED_TEXT_V2 = "amazon.titan-embed-text-v2:0"
    
    # Model parameters
    DEFAULT_MAX_TOKENS = 1024
    DEFAULT_TEMPERATURE = 0.7
    MULTIMODAL_MAX_TOKENS = 2048
    EMBEDDING_DIMENSION = 1024


class BedrockClient:
    """
    Unified Bedrock client for HarveLogixAI agents.
    
    Handles:
    - Client initialization and lifecycle
    - Model invocation with retry logic
    - Error handling and structured exceptions
    - Health monitoring
    - Logging and telemetry
    """
    
    def __init__(
        self,
        model_id: str = BEDROCK_MODEL_ID,
        region: str = AWS_REGION,
        max_tokens: int = BEDROCK_MAX_TOKENS,
        temperature: float = BEDROCK_TEMPERATURE,
        model_type: str = BEDROCK_MODEL_TYPE,
    ):
        """
        Initialize Bedrock client.
        
        Args:
            model_id: Bedrock model ID to use
            region: AWS region
            max_tokens: Maximum tokens in response
            temperature: Model temperature (0-1)
            model_type: Model type ('nova' or 'claude')
        """
        self.model_id = model_id
        self.region = region
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.model_type = model_type
        # Route inference profiles to their respective regions
        # ARNs contain region info: arn:aws:bedrock:REGION:ACCOUNT:application-inference-profile/ID
        region_to_use = region
        if model_id.lower().startswith('arn:aws:bedrock:'):
            # Extract region from ARN
            arn_parts = model_id.split(':')
            if len(arn_parts) >= 4:
                region_to_use = arn_parts[3]
        self.client = boto3.client('bedrock-runtime', region_name=region_to_use)
        self.logger = logging.getLogger(__name__)
        self._health_check_cache = {'healthy': None, 'last_check': None}
        
        self.logger.info(
            f"Bedrock client initialized with model: {model_id}, region: {region}, type: {model_type}"
        )
    
    @retry_with_backoff(exceptions=(ClientError, BotoCoreError))
    def invoke_model(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model_id: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[list] = None,
        messages: Optional[list] = None,
    ) -> Union[str, Dict[str, Any]]:
        """
        Invoke a Bedrock model for text reasoning.
        Supports both direct model IDs and inference profile ARNs.
        
        Args:
            prompt: User input prompt
            system_prompt: Optional system prompt for context
            model_id: Optional override of default model
            max_tokens: Optional override of default max_tokens
            temperature: Optional override of default temperature
            tools: Optional lists of tools to provide to the model
            messages: Optional list of previous conversation messages (to support tool loop)
            
        Returns:
            Model response text or a dict containing toolUse objects
            
        Raises:
            BedrockException: If invocation fails after retries
        """
        model_to_use = model_id or self.model_id
        tokens = max_tokens or self.max_tokens
        temp = temperature or self.temperature
        
        try:
            request_body = self._build_request_body(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=tokens,
                temperature=temp,
                model_id=model_to_use,
                tools=tools,
                messages=messages,
            )
            
            # For inference profile ARNs, use modelId directly
            # The ARN format handles the routing automatically
            response = self.client.invoke_model(
                modelId=model_to_use,
                contentType='application/json',
                accept='application/json',
                body=json.dumps(request_body),
            )
            
            response_body = json.loads(response['body'].read())
            
            # Parse response based on model type
            if self.model_type.lower() == 'nova':
                # Amazon Nova response format
                message = response_body.get('output', {}).get('message', {})
                content_blocks = message.get('content', [{}])
                
                # Check for toolUse
                tool_uses = []
                text_content = ""
                for block in content_blocks:
                    if 'toolUse' in block:
                        tool_uses.append(block['toolUse'])
                    if 'text' in block:
                        text_content += block['text']
                        
                if tool_uses:
                    self.logger.info(f"Bedrock returned {len(tool_uses)} tool calls")
                    return {'type': 'tool_use', 'tools': tool_uses, 'text': text_content, 'message': message}
                
                content = text_content
            else:
                # Claude response format
                content = response_body['content'][0]['text']
            
            self.logger.info(
                f"Bedrock model invocation successful. Model: {model_to_use}, "
                f"Output tokens: {response_body.get('usage', {}).get('output_tokens', 'unknown')}"
            )
            return content
            
        except (ClientError, BotoCoreError, KeyError, json.JSONDecodeError) as e:
            self.logger.error(f"Bedrock invocation failed: {str(e)}", exc_info=True)
            raise BedrockException(
                f"Bedrock model invocation failed: {str(e)}",
                {
                    'model_id': model_to_use,
                    'region': self.region,
                    'error_type': type(e).__name__,
                }
            )
    
    def invoke_model_multimodal(
        self,
        prompt: str,
        image_data: Optional[Union[str, bytes]] = None,
        image_format: str = "image/jpeg",
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        Invoke Bedrock for multimodal analysis (image + text).
        
        Args:
            prompt: Text prompt
            image_data: Image as base64 string or bytes
            image_format: Image MIME type (image/jpeg, image/png, etc.)
            system_prompt: Optional system context
            
        Returns:
            Model response text
            
        Raises:
            BedrockException: If invocation fails
        """
        if not image_data:
            raise BedrockException("Image data required for multimodal invocation", {})
        
        # Convert bytes to base64 if needed
        if isinstance(image_data, bytes):
            import base64
            image_data = base64.b64encode(image_data).decode('utf-8')
        
        try:
            request_body = {
                'anthropic_version': 'bedrock-2023-06-01',
                'max_tokens': BEDROCK_MAX_TOKENS,
                'temperature': self.temperature,
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {
                                'type': 'image',
                                'source': {
                                    'type': 'base64',
                                    'media_type': image_format,
                                    'data': image_data,
                                }
                            },
                            {
                                'type': 'text',
                                'text': prompt
                            }
                        ]
                    }
                ]
            }
            
            if system_prompt:
                request_body['system'] = system_prompt
            
            response = self.client.invoke_model(
                modelId=BedrockConfig.CLAUDE_SONNET_4_6,
                contentType='application/json',
                accept='application/json',
                body=json.dumps(request_body),
            )
            
            response_body = json.loads(response['body'].read())
            content = response_body['content'][0]['text']
            
            self.logger.info("Bedrock multimodal invocation successful")
            return content
            
        except (ClientError, BotoCoreError, KeyError, json.JSONDecodeError) as e:
            self.logger.error(f"Bedrock multimodal invocation failed: {str(e)}", exc_info=True)
            raise BedrockException(
                f"Bedrock multimodal invocation failed: {str(e)}",
                {'image_format': image_format, 'error_type': type(e).__name__}
            )
    
    def generate_embedding(
        self,
        text: str,
        model_id: str = BedrockConfig.TITAN_EMBED_TEXT_V2,
    ) -> list:
        """
        Generate text embeddings using Bedrock.
        
        Args:
            text: Text to embed
            model_id: Embedding model to use
            
        Returns:
            Vector embedding as list of floats
            
        Raises:
            BedrockException: If embedding generation fails
        """
        try:
            response = self.client.invoke_model(
                modelId=model_id,
                contentType='application/json',
                accept='application/json',
                body=json.dumps({'inputText': text}),
            )
            
            response_body = json.loads(response['body'].read())
            embedding = response_body.get('embedding', [])
            
            self.logger.info(
                f"Embedding generated successfully. Text length: {len(text)}, "
                f"Embedding dimension: {len(embedding)}"
            )
            return embedding
            
        except (ClientError, BotoCoreError, KeyError, json.JSONDecodeError) as e:
            self.logger.error(f"Embedding generation failed: {str(e)}", exc_info=True)
            raise BedrockException(
                f"Embedding generation failed: {str(e)}",
                {'model_id': model_id, 'text_length': len(text)}
            )
    
    @retry_with_backoff(exceptions=(ClientError, BotoCoreError), max_retries=2)
    def health_check(self, use_cache: bool = True) -> Dict[str, Any]:
        """
        Check Bedrock service health with a simple model invocation.
        
        Args:
            use_cache: Use cached result if available (cache valid for 5 min)
            
        Returns:
            Health status dictionary with keys:
            - healthy: Boolean indicating service availability
            - model_id: Model used for health check
            - region: AWS region
            - timestamp: Check timestamp
            - error: Error message if not healthy
        """
        if use_cache and self._health_check_cache['healthy'] is not None:
            from datetime import timedelta
            last_check = self._health_check_cache['last_check']
            if (datetime.utcnow() - last_check) < timedelta(minutes=5):
                return {
                    'healthy': self._health_check_cache['healthy'],
                    'model_id': self.model_id,
                    'region': self.region,
                    'timestamp': datetime.utcnow().isoformat(),
                    'cached': True,
                }
        
        try:
            # Simple test invocation
            response = self.invoke_model(
                prompt="Respond with 'OK' to confirm service is operational.",
                max_tokens=10,
            )
            
            is_healthy = response is not None and len(response) > 0
            
            self._health_check_cache['healthy'] = is_healthy
            self._health_check_cache['last_check'] = datetime.utcnow()
            
            self.logger.info(f"Bedrock health check passed: {is_healthy}")
            
            return {
                'healthy': is_healthy,
                'model_id': self.model_id,
                'region': self.region,
                'timestamp': datetime.utcnow().isoformat(),
                'cached': False,
            }
            
        except BedrockException as e:
            self._health_check_cache['healthy'] = False
            self._health_check_cache['last_check'] = datetime.utcnow()
            
            self.logger.warning(f"Bedrock health check failed: {str(e)}")
            
            return {
                'healthy': False,
                'model_id': self.model_id,
                'region': self.region,
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e),
                'cached': False,
            }
    
    def _build_request_body(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = BEDROCK_MAX_TOKENS,
        temperature: float = BEDROCK_TEMPERATURE,
        model_id: Optional[str] = None,
        tools: Optional[list] = None,
        messages: Optional[list] = None,
    ) -> Dict[str, Any]:
        """
        Build Bedrock API request body.
        Automatically handles Claude and Amazon Nova formats based on model_type.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            max_tokens: Max tokens
            temperature: Temperature
            model_id: Model ID (unused, kept for compatibility)
            tools: Optional tool definitions
            messages: Optional conversation history
            
        Returns:
            Request body dictionary
        """
        # Maintain history if provided, otherwise create single turn
        conv_messages = messages if messages else []
        if prompt:
            # Append the prompt to conversation messages
            conv_messages.append({
                'role': 'user',
                'content': [{'text': prompt}] if self.model_type.lower() == 'nova' else prompt
            })
            
        # Use configured model type to determine format
        if self.model_type.lower() == 'nova':
            # Amazon Nova format: content as array with text objects
            body = {
                'messages': conv_messages,
                'inferenceConfig': {
                    'maxTokens': max_tokens,
                    'temperature': temperature
                }
            }
            if system_prompt:
                body['system'] = [{'text': system_prompt}]
            
            if tools:
                # Format tools for Nova: tools list with toolSpec
                nova_tools = []
                for tool in tools:
                    nova_tools.append({
                        'toolSpec': tool
                    })
                body['toolConfig'] = {'tools': nova_tools}
                
        else:
            # Claude and other Anthropic models
            body = {
                'anthropic_version': 'bedrock-2023-06-01',
                'max_tokens': max_tokens,
                'temperature': temperature,
                'messages': conv_messages
            }
            if system_prompt:
                body['system'] = system_prompt
        
        return body
    
    def clear_health_cache(self) -> None:
        """Clear the health check cache."""
        self._health_check_cache = {'healthy': None, 'last_check': None}
        self.logger.info("Health check cache cleared")


# Default singleton instance
_default_client = None


def get_bedrock_client(
    model_id: str = BEDROCK_MODEL_ID,
    region: str = AWS_REGION,
) -> BedrockClient:
    """
    Get or create default Bedrock client.
    
    Args:
        model_id: Model ID (uses default if not specified)
        region: AWS region (uses default if not specified)
        
    Returns:
        BedrockClient instance
    """
    global _default_client
    if _default_client is None:
        _default_client = BedrockClient(model_id=model_id, region=region)
    return _default_client
