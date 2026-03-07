"""
Model Context Protocol (MCP) Tools Service for HarveLogixAI

Defines and manages MCP tool definitions and execution for agent data access.

This module provides:
- Tool schema definitions compatible with Claude's tool-use feature
- Tool executors that query HarveLogix data sources
- Integration with Strands agents
"""

import json
import logging
from typing import Any, Dict, List, Optional, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta

import boto3
from botocore.exceptions import ClientError

from config import AWS_REGION, FARMERS_TABLE, AGENT_DECISIONS_TABLE
from utils.errors import DataAccessException

logger = logging.getLogger(__name__)


@dataclass
class MCPToolDefinition:
    """Definition of an MCP tool."""
    
    name: str
    description: str
    handler: Callable
    parameters: Dict[str, Any]
    
    def to_tool_schema(self) -> Dict[str, Any]:
        """Convert to Claude tool-use schema."""
        return {
            'name': self.name,
            'description': self.description,
            'input_schema': {
                'type': 'object',
                'properties': self.parameters.get('properties', {}),
                'required': self.parameters.get('required', [])
            }
        }


class MCPToolsService:
    """Manages MCP tools for agent data access."""
    
    def __init__(self, region: str = AWS_REGION):
        """Initialize MCP tools service."""
        self.region = region
        self.dynamodb = boto3.resource('dynamodb', region_name=region)
        self.s3 = boto3.client('s3', region_name=region)
        self.logger = logging.getLogger(__name__)
        
        # Initialize tool definitions
        self._init_tools()
    
    def _init_tools(self) -> None:
        """Initialize tool definitions."""
        self.tools: Dict[str, MCPToolDefinition] = {
            'query_crop_yield': MCPToolDefinition(
                name='query_crop_yield',
                description='Query historical crop yield data for a region and crop type',
                handler=self.query_crop_yield,
                parameters={
                    'properties': {
                        'crop_type': {
                            'type': 'string',
                            'description': 'Type of crop (e.g., wheat, rice, tomato)'
                        },
                        'region': {
                            'type': 'string',
                            'description': 'Region name or code'
                        },
                        'years_back': {
                            'type': 'integer',
                            'description': 'Number of years to look back (default: 5)',
                            'default': 5
                        }
                    },
                    'required': ['crop_type', 'region']
                }
            ),
            'query_weather_trends': MCPToolDefinition(
                name='query_weather_trends',
                description='Query weather trends and patterns for a region',
                handler=self.query_weather_trends,
                parameters={
                    'properties': {
                        'region': {
                            'type': 'string',
                            'description': 'Region name'
                        },
                        'metric': {
                            'type': 'string',
                            'enum': ['temperature', 'rainfall', 'humidity', 'wind'],
                            'description': 'Weather metric to query'
                        },
                        'months_back': {
                            'type': 'integer',
                            'description': 'Months of history (default: 12)',
                            'default': 12
                        }
                    },
                    'required': ['region', 'metric']
                }
            ),
            'query_market_prices': MCPToolDefinition(
                name='query_market_prices',
                description='Query current and historical market prices for crops',
                handler=self.query_market_prices,
                parameters={
                    'properties': {
                        'crop_type': {
                            'type': 'string',
                            'description': 'Type of crop'
                        },
                        'region': {
                            'type': 'string',
                            'description': 'Region for market price (optional)'
                        },
                        'days_back': {
                            'type': 'integer',
                            'description': 'Days of price history (default: 30)',
                            'default': 30
                        }
                    },
                    'required': ['crop_type']
                }
            ),
            'query_soil_health': MCPToolDefinition(
                name='query_soil_health',
                description='Query soil health metrics and recommendations',
                handler=self.query_soil_health,
                parameters={
                    'properties': {
                        'region': {
                            'type': 'string',
                            'description': 'Region name'
                        },
                        'crop_type': {
                            'type': 'string',
                            'description': 'Crop type for soil recommendations'
                        }
                    },
                    'required': ['region']
                }
            ),
            'query_farmer_demographics': MCPToolDefinition(
                name='query_farmer_demographics',
                description='Query farmer demographics and adoption patterns in a region',
                handler=self.query_farmer_demographics,
                parameters={
                    'properties': {
                        'region': {
                            'type': 'string',
                            'description': 'Region name'
                        },
                        'crop_type': {
                            'type': 'string',
                            'description': 'Filter by crop type (optional)'
                        }
                    },
                    'required': ['region']
                }
            ),
            'query_agent_recommendations': MCPToolDefinition(
                name='query_agent_recommendations',
                description='Query previous agent recommendations and their outcomes',
                handler=self.query_agent_recommendations,
                parameters={
                    'properties': {
                        'agent_type': {
                            'type': 'string',
                            'enum': [
                                'harvest-ready', 'storage-scout', 'supply-match',
                                'water-wise', 'quality-hub', 'collective-voice'
                            ],
                            'description': 'Type of agent'
                        },
                        'region': {
                            'type': 'string',
                            'description': 'Region to query'
                        },
                        'crop_type': {
                            'type': 'string',
                            'description': 'Crop type to query'
                        },
                        'days_back': {
                            'type': 'integer',
                            'description': 'Days to look back (default: 30)',
                            'default': 30
                        }
                    },
                    'required': ['agent_type']
                }
            ),
            'get_farmer_profile': MCPToolDefinition(
                name='get_farmer_profile',
                description='Get farmer profile and history',
                handler=self.get_farmer_profile,
                parameters={
                    'properties': {
                        'farmer_id': {
                            'type': 'string',
                            'description': 'Farmer ID'
                        }
                    },
                    'required': ['farmer_id']
                }
            ),
        }
    
    def get_tool_schema(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get schema for a tool."""
        if tool_name in self.tools:
            return self.tools[tool_name].to_tool_schema()
        return None
    
    def get_all_tools_schema(self) -> List[Dict[str, Any]]:
        """Get schemas for all tools."""
        return [tool.to_tool_schema() for tool in self.tools.values()]
    
    def execute_tool(self, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool.
        
        Args:
            tool_name: Name of the tool
            tool_input: Tool input parameters
            
        Returns:
            Tool result
        """
        if tool_name not in self.tools:
            return {'success': False, 'error': f'Unknown tool: {tool_name}'}
        
        try:
            tool = self.tools[tool_name]
            result = tool.handler(**tool_input)
            return {'success': True, 'data': result}
        except Exception as e:
            self.logger.error(f"Tool execution failed for {tool_name}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # Tool implementation methods
    
    def query_crop_yield(
        self,
        crop_type: str,
        region: str,
        years_back: int = 5
    ) -> Dict[str, Any]:
        """Query crop yield trends."""
        self.logger.info(f"Querying crop yield: {crop_type} in {region}")
        
        # Mock implementation for Phase 3
        # In Phase 4, this queries RDS/Aurora
        return {
            'crop_type': crop_type,
            'region': region,
            'avg_yield_tonnage_per_hectare': 4.2,
            'trend': 'increasing',
            'yield_improvement_percent': 8.5,
            'years_analyzed': years_back,
            'data_points': [
                {'year': 2021, 'yield': 3.8},
                {'year': 2022, 'yield': 3.95},
                {'year': 2023, 'yield': 4.15},
                {'year': 2024, 'yield': 4.3},
                {'year': 2025, 'yield': 4.5},
            ]
        }
    
    def query_weather_trends(
        self,
        region: str,
        metric: str,
        months_back: int = 12
    ) -> Dict[str, Any]:
        """Query weather trends."""
        self.logger.info(f"Querying weather: {metric} in {region}")
        
        # Mock implementation
        metric_units = {
            'temperature': '°C',
            'rainfall': 'mm',
            'humidity': '%',
            'wind': 'km/h'
        }
        
        return {
            'region': region,
            'metric': metric,
            'unit': metric_units.get(metric, 'unit'),
            'current_value': 28.5,
            'monthly_average': 27.8,
            'trend': 'stable',
            'deviation_from_normal': '+1.2',
            'months_analyzed': months_back,
            'forecast_7_days': [28.1, 28.9, 29.2, 28.6, 27.4, 26.8, 27.5]
        }
    
    def query_market_prices(
        self,
        crop_type: str,
        region: Optional[str] = None,
        days_back: int = 30
    ) -> Dict[str, Any]:
        """Query market prices."""
        self.logger.info(f"Querying market prices: {crop_type}")
        
        # Mock implementation
        return {
            'crop_type': crop_type,
            'region': region or 'national_average',
            'current_price_per_kg': 2350,
            'average_price': 2280,
            'min_price': 2100,
            'max_price': 2500,
            'trend': 'stable',
            'volatility': 'low',
            'price_change_percent': 2.3,
            'days_analyzed': days_back
        }
    
    def query_soil_health(
        self,
        region: str,
        crop_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Query soil health."""
        self.logger.info(f"Querying soil health for {region}")
        
        # Mock implementation
        return {
            'region': region,
            'crop_type': crop_type,
            'soil_ph': 6.8,
            'nitrogen_level': 'adequate',
            'phosphorus_level': 'adequate',
            'potassium_level': 'deficient',
            'organic_matter_percent': 2.2,
            'health_score': 0.75,
            'recommendations': [
                'Apply potassium fertilizer',
                'Increase crop rotation frequency',
                'Monitor soil moisture'
            ]
        }
    
    def query_farmer_demographics(
        self,
        region: str,
        crop_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Query farmer demographics."""
        self.logger.info(f"Querying farmer demographics for {region}")
        
        # Mock implementation
        return {
            'region': region,
            'total_farmers': 15000,
            'avg_farm_size_hectares': 2.3,
            'primary_crops': ['wheat', 'rice', 'cotton'],
            'improved_seeds_adoption_rate': 0.65,
            'organic_farming_percent': 0.12,
            'irrigation_facility_percent': 0.58,
            'literacy_rate_percent': 0.45
        }
    
    def query_agent_recommendations(
        self,
        agent_type: str,
        region: Optional[str] = None,
        crop_type: Optional[str] = None,
        days_back: int = 30
    ) -> Dict[str, Any]:
        """Query previous agent recommendations and outcomes."""
        self.logger.info(f"Querying recommendations: {agent_type} in {region}")
        
        # Mock implementation
        return {
            'agent_type': agent_type,
            'region': region,
            'crop_type': crop_type,
            'recommendations_issued': 1250,
            'adoption_rate': 0.68,
            'avg_effectiveness': 0.82,
            'common_recommendations': [
                'Harvest immediately',
                'Optimize water usage',
                'Store in cool, dry conditions'
            ],
            'period_days': days_back
        }
    
    def get_farmer_profile(self, farmer_id: str) -> Dict[str, Any]:
        """Get farmer profile."""
        self.logger.info(f"Getting farmer profile: {farmer_id}")
        
        # Would query DynamoDB in production
        return {
            'farmer_id': farmer_id,
            'name': 'Unknown Farmer',
            'region': 'Unknown Region',
            'primary_crops': ['wheat', 'rice'],
            'farm_size_hectares': 2.5,
            'recommendations_received': 42,
            'adoption_rate': 0.71,
            'avg_income_impact': 0.15
        }


# Singleton instance
_service_instance = None


def get_mcp_tools_service(region: str = AWS_REGION) -> MCPToolsService:
    """Get or create MCP tools service instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = MCPToolsService(region=region)
    return _service_instance
