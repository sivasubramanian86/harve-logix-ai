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
        """Get tool as JSON schema for Claude/Nova."""
        # Nova and Bedrock use inputSchema, Claude directly accepts input_schema depending on API.
        # But boto3 Bedrock Converse/Nova uses inputSchema with json format.
        return {
            'name': self.name,
            'description': self.description,
            'inputSchema': {
                'json': {
                    'type': 'object',
                    'properties': self.parameters.get('properties', {}),
                    'required': self.parameters.get('required', [])
                }
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
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data for the agent.
        Map JSON input to AnalysisContext and perform analysis.
        """
        context = AnalysisContext(
            farmer_id=input_data.get('farmer_id', 'demo-farmer'),
            region=input_data.get('region', 'India'),
            crop_type=input_data.get('crop_type', 'mixed'),
            timeframe=input_data.get('timeframe', 'next-7-days'),
            analysis_type=input_data.get('analysis_type', 'farmer_insights'),
            custom_params=input_data
        )
        result = self.analyze(context)
        return result.to_dict()
    
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

Output format: You MUST return a valid JSON object as the final response.
The JSON must have the following keys:
- "insights": A list of 3-5 concise, observational strings.
- "recommendations": A list of dicts with "action", "impact", and "timeline".
- "metrics": A dict of numeric key-value pairs (e.g., "predicted_yield_increase": 15.5).
- "confidence_score": A float between 0 and 1.
- "reasoning": A brief explanation of the synthesis.

Example:
{{
  "insights": ["Soil nitrogen is optimal", "Upcoming rain in 3 days"],
  "recommendations": [{{"action": "Wait for rain", "impact": "Save water", "timeline": "Next 72h"}}],
  "metrics": {{"yield_impact": 12.5}},
  "confidence_score": 0.9,
  "reasoning": "Data synthesized from weather and soil sensors."
}}

Do not include any conversational text before or after the JSON.
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
            Tuple of (response_text, all_executed_tools)
        """
        system_prompt = self._build_system_prompt()
        all_tool_results = []
        
        # In Nova, history needs to be maintained per execution
        conversation = self.conversation_history.copy()
        
        try:
            # We get schemas for all tools
            tools = ToolExecutor.get_all_tools_schema()
            current_prompt = user_message
            
            # Allow up to 5 tool-use iterations to prevent infinite loops
            for i in range(5):
                response = self.bedrock_client.invoke_model(
                    prompt=current_prompt,
                    system_prompt=system_prompt,
                    tools=tools,
                    messages=conversation
                )
                
                # If we passed a prompt this turn, appending it locally for our loop history
                if current_prompt:
                    conversation.append({
                        'role': 'user',
                        'content': [{'text': current_prompt}]
                    })
                    current_prompt = "" # We don't send the prompt again in this loop
                
                # If response is a dict, it means tool use was requested
                if isinstance(response, dict) and response.get('type') == 'tool_use':
                    assistant_message = response.get('message')
                    tool_uses = response.get('tools', [])
                    
                    # Add assistant's tool-use message to conversation history
                    conversation.append(assistant_message)
                    
                    # Execute all tools requested by the model
                    tool_results_content = []
                    for tool_use in tool_uses:
                        tool_use_id = tool_use['toolUseId']
                        tool_name = tool_use['name']
                        tool_input = tool_use['input']
                        
                        self.logger.info(f"Executing tool {tool_name} requested by Bedrock")
                        result = ToolExecutor.execute(tool_name, tool_input)
                        all_tool_results.append({'tool': tool_name, 'input': tool_input, 'result': result})
                        
                        tool_results_content.append({
                            'toolResult': {
                                'toolUseId': tool_use_id,
                                'content': [{'text': json.dumps(result)}]
                            }
                        })
                    
                    # Send tool results back to Bedrock as the user
                    conversation.append({
                        'role': 'user',
                        'content': tool_results_content
                    })
                    
                else:
                    # Final text response
                    self.conversation_history.append({'role': 'user', 'content': user_message})
                    self.conversation_history.append({'role': 'assistant', 'content': response})
                    return response, all_tool_results
                    
            return "Analysis incomplete due to exceeding tool call limits.", all_tool_results
            
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


class StrandsAnalysisAgent(StrandsAgent):
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
            response, tool_history = self._invoke_bedrock_with_tools(prompt)
            
            if tool_history:
                self.logger.info(f"Executed {len(tool_history)} tools")
            
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
- 3-5 key insights (strings)
- 2-3 actionable recommendations (objects: {{"action": string, "impact": string, "timeline": string}})
- Relevant metrics (dictionary of string to float/int)
- confidence_score (float 0-1)

Focus on {context.analysis_type} implications for {context.crop_type} in {context.region}.

IMPORTANT: Return ONLY a raw JSON object with keys: "insights", "recommendations", "metrics", "confidence_score". No preamble, no conversational filler.
"""
    
    def _extract_insights(
        self,
        response: str,
        context: AnalysisContext
    ) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, float], float]:
        """
        Extract insights from Bedrock response.
        Attempt to parse JSON, falling back to defaults if parsing fails.
        """
        try:
            # Attempt to extract JSON from the text using a more robust regex
            import re
            json_match = re.search(r'(\{.*\})', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                parsed = json.loads(json_str)
                # Ensure all required keys exist
                insights = parsed.get('insights', [])
                recommendations = parsed.get('recommendations', [])
                metrics = parsed.get('metrics', {})
                confidence = parsed.get('confidence_score', 0.8)
                return insights, recommendations, metrics, confidence
        except Exception as e:
            self.logger.warning(f"Failed to parse structured JSON from agent response. Error: {e}")
            self.logger.debug(f"Raw response: {response}")
            # Print to stdout so it appears in Node.js logs for debugging
            print(f"DEBUG_AGENT_RAW_RESPONSE: {response}")

        # Fallback if the agent didn't return perfect JSON
        insights = [
            f"Agent provided unstructured analysis for {context.crop_type} in {context.region}.",
            "See reasoning for full details."
        ]
        
        recommendations = [
            {
                'action': 'Review full analysis',
                'impact': 'Ensure all details are captured',
                'timeline': 'Immediate'
            }
        ]
        
        metrics = {
            'parsing_success': 0.0
        }
        
        confidence = 0.5
        
        return insights, recommendations, metrics, confidence
