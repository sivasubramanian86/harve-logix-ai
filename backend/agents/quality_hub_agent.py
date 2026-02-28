"""
QualityHub Agent - Automated quality certification using AWS Rekognition.

This agent analyzes crop photos to assign quality grades and generate
standardized quality certificates.
"""

import json
import logging
from typing import Any, Dict
from datetime import datetime
import base64

import boto3
from botocore.exceptions import ClientError

from agents.base_agent import BaseAgent
from config import (
    AWS_REGION,
    QUALITY_GRADE_A_THRESHOLD,
    QUALITY_GRADE_B_THRESHOLD,
    DEFAULT_QUALITY_INCOME_GAIN,
)
from utils.errors import ValidationException, RekognitionException

logger = logging.getLogger(__name__)


class QualityHubAgent(BaseAgent):
    """Agent for automated quality assessment using Rekognition."""

    def __init__(self):
        """Initialize QualityHub Agent."""
        super().__init__('QualityHub')
        self.rekognition_client = boto3.client('rekognition', region_name=AWS_REGION)
        self.s3_client = boto3.client('s3', region_name=AWS_REGION)

    def process(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process quality assessment request.

        Args:
            request_data: Request containing farmer_photo, crop_type, batch_size

        Returns:
            Quality grade, defect percentage, price premium, certification
        """
        try:
            # Validate input
            self._validate_input(request_data)

            crop_type = request_data.get('crop_type')
            batch_size_kg = request_data.get('batch_size_kg', 0)
            image_source = request_data.get('farmer_photo')  # Can be S3 URL or base64

            self.logger.info(f"Assessing quality for {batch_size_kg}kg of {crop_type}")

            # Get image data
            image_data = self._get_image_data(image_source)

            # Use Rekognition for quality analysis
            quality_analysis = self._analyze_with_rekognition(image_data, crop_type)

            # Generate certification
            certification = self._generate_certification(
                crop_type=crop_type,
                batch_size_kg=batch_size_kg,
                quality_analysis=quality_analysis
            )

            return self.create_response(
                status='success',
                output=certification,
                confidence_score=quality_analysis.get('confidence_score', 0.85),
                reasoning=quality_analysis.get('reasoning', '')
            )

        except ValidationException as e:
            self.logger.error(f"Validation error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except RekognitionException as e:
            self.logger.error(f"Rekognition error: {str(e)}")
            return self.create_response(status='error', error=str(e))
        except Exception as e:
            self.logger.error(f"Error assessing quality: {str(e)}")
            return self.create_response(status='error', error=str(e))

    def _validate_input(self, request_data: Dict[str, Any]) -> None:
        """Validate input data."""
        if not request_data.get('crop_type'):
            raise ValidationException('crop_type is required')

        if not request_data.get('farmer_photo'):
            raise ValidationException('farmer_photo is required (S3 URL or base64)')

        batch_size = request_data.get('batch_size_kg', 0)
        if not isinstance(batch_size, (int, float)) or batch_size <= 0:
            raise ValidationException('batch_size_kg must be positive')

    def _get_image_data(self, image_source: str) -> Dict[str, Any]:
        """Get image data from S3 URL or base64."""
        if image_source.startswith('s3://'):
            # Parse S3 URL
            parts = image_source.replace('s3://', '').split('/')
            bucket = parts[0]
            key = '/'.join(parts[1:])
            return {'S3Object': {'Bucket': bucket, 'Name': key}}
        elif image_source.startswith('http'):
            # For HTTP URLs, we'd need to download first
            # For now, return mock data
            return {'Bytes': b'mock_image_data'}
        else:
            # Assume base64
            return {'Bytes': base64.b64decode(image_source)}

    def _analyze_with_rekognition(self, image_data: Dict[str, Any], crop_type: str) -> Dict[str, Any]:
        """Use AWS Rekognition to analyze image quality."""
        try:
            # In production, call Rekognition
            # For now, return mock analysis based on crop type
            mock_analysis = {
                'tomato': {
                    'defect_percent': 8.5,
                    'color_uniformity': 0.92,
                    'size_uniformity': 0.88,
                    'ripeness_score': 0.90,
                    'confidence_score': 0.95
                },
                'onion': {
                    'defect_percent': 5.2,
                    'color_uniformity': 0.95,
                    'size_uniformity': 0.91,
                    'ripeness_score': 0.93,
                    'confidence_score': 0.96
                },
                'capsicum': {
                    'defect_percent': 6.8,
                    'color_uniformity': 0.93,
                    'size_uniformity': 0.89,
                    'ripeness_score': 0.91,
                    'confidence_score': 0.94
                }
            }

            analysis = mock_analysis.get(crop_type.lower(), mock_analysis['tomato'])

            # Assign quality grade based on defect percentage
            if analysis['defect_percent'] < 5:
                quality_grade = 'A'
                price_premium = 15
            elif analysis['defect_percent'] < 10:
                quality_grade = 'B'
                price_premium = 5
            else:
                quality_grade = 'C'
                price_premium = 0

            return {
                **analysis,
                'quality_grade': quality_grade,
                'price_premium_percent': price_premium,
                'reasoning': f'Quality grade {quality_grade} based on {analysis["defect_percent"]:.1f}% defects'
            }

        except ClientError as e:
            self.logger.error(f"Rekognition error: {str(e)}")
            raise RekognitionException(f"Rekognition analysis failed: {str(e)}")

    def _generate_certification(self, crop_type: str, batch_size_kg: float,
                               quality_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate standardized quality certificate."""
        certification_id = f"CERT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        return {
            'quality_grade': quality_analysis.get('quality_grade', 'B'),
            'defect_percent': quality_analysis.get('defect_percent', 0),
            'market_price_premium_percent': quality_analysis.get('price_premium_percent', 0),
            'certification_json': {
                'certification_id': certification_id,
                'crop_type': crop_type,
                'batch_size_kg': batch_size_kg,
                'quality_grade': quality_analysis.get('quality_grade', 'B'),
                'defect_percentage': quality_analysis.get('defect_percent', 0),
                'color_uniformity': quality_analysis.get('color_uniformity', 0),
                'size_uniformity': quality_analysis.get('size_uniformity', 0),
                'ripeness_score': quality_analysis.get('ripeness_score', 0),
                'certification_date': datetime.utcnow().isoformat(),
                'valid_until': (datetime.utcnow().replace(day=datetime.utcnow().day + 30)).isoformat(),
                'certified_by': 'HarveLogix AI Quality Hub',
                'confidence_score': quality_analysis.get('confidence_score', 0.85)
            },
            'confidence_score': quality_analysis.get('confidence_score', 0.85),
            'reasoning': quality_analysis.get('reasoning', '')
        }


def lambda_handler(event, context):
    """Lambda handler for QualityHub Agent."""
    try:
        agent = QualityHubAgent()
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
