"""
Strands Agentic Framework Integration for HarveLogixAI

This module provides Strands-based agents that leverage:
- Amazon Bedrock models for reasoning
- Model Context Protocol (MCP) for data tool access
- Multi-turn conversations for complex analysis

Architecture:
    StrandsAgent (base class)
        ├─ HarveLogixAnalysisAgent (extends StrandsAgent)
        │   ├─ Uses Claude for reasoning
        │   └─ Accesses data via MCP tools
        └─ [Future custom agents]
"""

import json
import logging
from typing import Any, Dict, Optional, List, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from abc import ABC, abstractmethod

import boto3
from botocore.exceptions import ClientError

from config import AWS_REGION, BEDROCK_MODEL_ID
from core.bedrock_client import BedrockClient, get_bedrock_client
from utils.errors import BedrockException
from utils.retry import retry_with_backoff

logger = logging.getLogger(__name__)


@dataclass
class AnalysisContext:
    """Context for analysis operations."""
    farmer_id: str
    region: str
    crop_type: str
    timeframe: str
    analysis_type: str
    custom_params: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AnalysisResult:
    """Structured result from analysis."""
    status: str
    agent: str
    timestamp: str
    insights: List[str]
    recommendations: List[Dict[str, Any]]
    metrics: Dict[str, float]
    confidence_score: float
    reasoning: str = ""
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


class MCPTool:
    """Represents a Model Context Protocol tool."""
    
    def __init__(self, name: str, description: str, parameters: Dict[str, Any]):
        """
        Initialize MCP tool definition.
        
        Args:
            name: Tool name (e.g., 'query_crop_yield')
            description: Human-readable description
            parameters: JSON schema for tool parameters
        """
        self.name = name
        self.description = description
        self.parameters = parameters
    
    def to_schema(self) -> Dict[str, Any]:
        """Get tool as JSON schema for Claude."""
        return {
            'name': self.name,
            'description': self.description,
            'input_schema': {
                'type': 'object',
                'properties': self.parameters.get('properties', {}),
                'required': self.parameters.get('required', [])
            }
        }


class ToolExecutor:
    """Executes MCP tool calls."""
    
    # Registry of available tools
    TOOLS = {
        'query_crop_yield': MCPTool(
            name='query_crop_yield',
            description='Query historical crop yield data for a region',
            parameters={
                'properties': {
                    'region': {'type': 'string', 'description': 'Region name'},
                    'crop_type': {'type': 'string', 'description': 'Crop type'},
                    'years_back': {'type': 'integer', 'description': 'Number of years to query'}
                },
                'required': ['region', 'crop_type']
            }
        ),
        'query_weather_trends': MCPTool(
            name='query_weather_trends',
            description='Query weather trends for a region',
            parameters={
                'properties': {
                    'region': {'type': 'string', 'description': 'Region name'},
                    'metric': {'type': 'string', 'description': 'Weather metric (temp, rainfall, humidity)'},
                    'months_back': {'type': 'integer', 'description': 'Months of history'}
                },
                'required': ['region', 'metric']
            }
        ),
        'query_market_prices': MCPTool(
            name='query_market_prices',
            description='Query current market prices for crops',
            parameters={
                'properties': {
                    'crop_type': {'type': 'string', 'description': 'Crop type'},
                    'region': {'type': 'string', 'description': 'Region for market price'},
                    'days_back': {'type': 'integer', 'description': 'Days of price history'}
                },
                'required': ['crop_type']
            }
        ),
        'query_soil_health': MCPTool(
            name='query_soil_health',
            description='Query soil health metrics for a region',
            parameters={
                'properties': {
                    'region': {'type': 'string', 'description': 'Region name'},
                    'crop_type': {'type': 'string', 'description': 'Crop type'}
                },
                'required': ['region']
            }
        ),
        'query_farmer_demographics': MCPTool(
            name='query_farmer_demographics',
            description='Query demographics and profiles of farmers in a region',
            parameters={
                'properties': {
                    'region': {'type': 'string', 'description': 'Region name'},
                    'crop_type': {'type': 'string', 'description': 'Filter by crop type'}
                },
                'required': ['region']
            }
        ),
    }
    
    @classmethod
    def execute(cls, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool and return mock results (Phase 3 placeholder).
        
        Args:
            tool_name: Name of the tool
            tool_input: Input parameters for the tool
            
        Returns:
            Tool output (mock data in Phase 3)
        """
        try:
            logger.info(f"Executing tool: {tool_name} with input: {tool_input}")
            
            # Mock tool implementations
            if tool_name == 'query_crop_yield':
                return {
                    'success': True,
                    'data': {
                        'crop_type': tool_input.get('crop_type'),
                        'region': tool_input.get('region'),
                        'avg_yield': 4.5,  # tons/hectare (mock)
                        'trend': 'increasing',
                        'years_analyzed': tool_input.get('years_back', 5)
                    }
                }
            
            elif tool_name == 'query_weather_trends':
                return {
                    'success': True,
                    'data': {
                        'region': tool_input.get('region'),
                        'metric': tool_input.get('metric'),
                        'current_value': 28.5,
                        'average_value': 27.2,
                        'trend': 'stable',
                        'months_analyzed': tool_input.get('months_back', 12)
                    }
                }
            
            elif tool_name == 'query_market_prices':
                return {
                    'success': True,
                    'data': {
                        'crop_type': tool_input.get('crop_type'),
                        'current_price': 2250,  # rupees/kg (mock)
                        'average_price': 2180,
                        'price_trend': 'stable',
                        'volatility': 'low'
                    }
                }
            
            elif tool_name == 'query_soil_health':
                return {
                    'success': True,
                    'data': {
                        'region': tool_input.get('region'),
                        'soil_ph': 6.8,
                        'nitrogen_level': 'adequate',
                        'phosphorus_level': 'adequate',
                        'potassium_level': 'deficient',
                        'recommendation': 'Apply potassium fertilizer'
                    }
                }
            
            elif tool_name == 'query_farmer_demographics':
                return {
                    'success': True,
                    'data': {
                        'region': tool_input.get('region'),
                        'total_farmers': 15000,
                        'avg_landholding': 2.3,
                        'primary_crops': ['wheat', 'rice', 'cotton'],
                        'adoption_rate_improved_seeds': 0.65
                    }
                }
            
            else:
                return {
                    'success': False,
                    'error': f'Unknown tool: {tool_name}'
                }
                
        except Exception as e:
            logger.error(f"Tool execution failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def get_tool_schema(cls, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get schema for a specific tool."""
        if tool_name in cls.TOOLS:
            return cls.TOOLS[tool_name].to_schema()
        return None
    
    @classmethod
    def get_all_tools_schema(cls) -> List[Dict[str, Any]]:
        """Get schemas for all available tools."""
        return [tool.to_schema() for tool in cls.TOOLS.values()]


class StrandsAgent(ABC):
    """
    Base class for Strands agents in HarveLogixAI.
    
    These agents use:
    - Bedrock models for reasoning
    - MCP tools for data access
    - Multi-turn conversations
    """
    
    def __init__(self, agent_name: str, model_id: str = BEDROCK_MODEL_ID):
        """
        Initialize Strands agent.
        
        Args:
            agent_name: Name of the agent
            model_id: Bedrock model ID
        """
        self.agent_name = agent_name
        self.model_id = model_id
        self.bedrock_client = get_bedrock_client(model_id=model_id)
        self.logger = logging.getLogger(f"{__name__}.{agent_name}")
        self.conversation_history: List[Dict[str, str]] = []
        
        self.logger.info(f"Initialized Strands agent: {agent_name}")
    
    @abstractmethod
    def analyze(self, context: AnalysisContext) -> AnalysisResult:
        """
        Perform analysis based on context.
        
        Args:
            context: Analysis context
            
        Returns:
            Analysis result with insights and recommendations
        """
        pass
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for the agent."""
        tools_desc = "\n".join([
            f"- {tool.name}: {tool.description}"
            for tool in ToolExecutor.TOOLS.values()
        ])
        
        return f"""You are {self.agent_name}, a specialized agricultural intelligence agent.

Your capabilities:
- Analyze agricultural data and trends
- Provide data-driven recommendations
- Use available tools to query real-time data
- Explain reasoning and confidence levels

Available tools (via Model Context Protocol):
{tools_desc}

When analyzing, use these tools to gather data, then synthesize insights.
Always provide:
1. Key insights discovered
2. Actionable recommendations
3. Confidence score (0-1)
4. Reasoning explanation

Output format: JSON with keys: insights, recommendations, metrics, confidence_score
"""
    
    def _invoke_bedrock_with_tools(
        self,
        user_message: str,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Invoke Bedrock with tool-use capability.
        
        Args:
            user_message: User message
            
        Returns:
            Tuple of (response_text, tool_calls)
        """
        # Add user message to history
        self.conversation_history.append({
            'role': 'user',
            'content': user_message
        })
        
        try:
            # Build request with tools
            system_prompt = self._build_system_prompt()
            
            # Prepare messages for Bedrock
            response = self.bedrock_client.invoke_model(
                prompt=user_message,
                system_prompt=system_prompt,
            )
            
            # Add assistant response to history
            self.conversation_history.append({
                'role': 'assistant',
                'content': response
            })
            
            # Parse for tool calls (basic parsing)
            tool_calls = self._extract_tool_calls(response)
            
            return response, tool_calls
            
        except BedrockException as e:
            self.logger.error(f"Bedrock invocation failed: {str(e)}")
            raise
    
    def _extract_tool_calls(self, response: str) -> List[Dict[str, Any]]:
        """
        Extract tool calls from Bedrock response.
        
        In a real implementation, this would parse Claude's tool-use XML.
        For Phase 3, we use a simplified approach.
        
        Args:
            response: Bedrock response
            
        Returns:
            List of tool calls
        """
        # Placeholder: would extract <tool_use> blocks from Claude's response
        # For now, return empty list
        return []
    
    def _process_tool_results(
        self,
        tool_calls: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Process tool calls and collect results.
        
        Args:
            tool_calls: List of tool calls
            
        Returns:
            List of tool results
        """
        results = []
        for tool_call in tool_calls:
            tool_name = tool_call.get('name')
            tool_input = tool_call.get('input', {})
            
            # Execute tool
            result = ToolExecutor.execute(tool_name, tool_input)
            results.append({
                'tool': tool_name,
                'result': result
            })
        
        return results
    
    def reset_conversation(self) -> None:
        """Reset conversation history."""
        self.conversation_history = []
        self.logger.info(f"Conversation history reset for {self.agent_name}")


class HarveLogixAnalysisAgent(StrandsAgent):
    """
    Strands-based analysis agent for HarveLogixAI.
    
    Analyzes agricultural data across:
    - Crop yield trends
    - Weather patterns
    - Market prices
    - Soil health
    - Farmer demographics
    
    Uses MCP tools to query real-time data and Bedrock for reasoning.
    """
    
    def __init__(self, model_id: str = BEDROCK_MODEL_ID):
        """Initialize HarveLogix analysis agent."""
        super().__init__(
            agent_name='HarveLogixAnalysisAgent',
            model_id=model_id
        )
    
    @retry_with_backoff(exceptions=(BedrockException,))
    def analyze(self, context: AnalysisContext) -> AnalysisResult:
        """
        Perform comprehensive agricultural analysis.
        
        Args:
            context: Analysis context with farmer, region, crop, etc.
            
        Returns:
            Structured analysis result
        """
        try:
            self.logger.info(f"Starting analysis for context: {context.to_dict()}")
            
            # Build analysis prompt
            prompt = self._build_analysis_prompt(context)
            
            # Get Bedrock analysis
            response, tool_calls = self._invoke_bedrock_with_tools(prompt)
            
            # Process any tool calls
            if tool_calls:
                tool_results = self._process_tool_results(tool_calls)
                self.logger.info(f"Executed {len(tool_results)} tools")
            
            # Extract structured insights
            insights, recommendations, metrics, confidence = self._extract_insights(
                response, context
            )
            
            result = AnalysisResult(
                status='success',
                agent=self.agent_name,
                timestamp=datetime.utcnow().isoformat(),
                insights=insights,
                recommendations=recommendations,
                metrics=metrics,
                confidence_score=confidence,
                reasoning=response
            )
            
            self.logger.info(f"Analysis complete with {len(insights)} insights")
            return result
            
        except Exception as e:
            self.logger.error(f"Analysis failed: {str(e)}")
            return AnalysisResult(
                status='error',
                agent=self.agent_name,
                timestamp=datetime.utcnow().isoformat(),
                insights=[],
                recommendations=[],
                metrics={},
                confidence_score=0.0,
                error=str(e)
            )
    
    def _build_analysis_prompt(self, context: AnalysisContext) -> str:
        """Build analysis prompt based on context."""
        return f"""
Analyze agricultural data for:
- Farmer: {context.farmer_id}
- Region: {context.region}
- Crop: {context.crop_type}
- Timeframe: {context.timeframe}
- Analysis Type: {context.analysis_type}

Use available tools to:
1. Query crop yield trends in {context.region} for {context.crop_type}
2. Check weather patterns and trends
3. Analyze current market prices
4. Assess soil health status
5. Review farmer demographics and patterns

Then provide:
- 3-5 key insights
- 2-3 actionable recommendations
- Relevant metrics
- Confidence assessment

Focus on {context.analysis_type} implications for {context.crop_type} in {context.region}.
"""
    
    def _extract_insights(
        self,
        response: str,
        context: AnalysisContext
    ) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, float], float]:
        """
        Extract insights from Bedrock response.
        
        In Phase 3, this is a simple extraction. 
        In Phase 4, use structured output parsing.
        """
        # Placeholder insights
        insights = [
            f"{context.crop_type} yield trends show improvement in {context.region}",
            f"Weather patterns favorable for {context.crop_type} in next {context.timeframe}",
            "Market prices stable with slight upward trend"
        ]
        
        recommendations = [
            {
                'action': 'Optimize irrigation timing',
                'impact': 'Save 15-20% water',
                'timeline': 'Implement within 2 weeks'
            },
            {
                'action': 'Harvest at recommended stage',
                'impact': 'Maximize yield quality and income',
                'timeline': 'Monitor growth stage weekly'
            }
        ]
        
        metrics = {
            'yield_trend': 0.12,  # 12% improvement
            'water_efficiency': 0.85,
            'market_stability': 0.90,
            'soil_health_score': 0.75
        }
        
        confidence = 0.87
        
        return insights, recommendations, metrics, confidence
