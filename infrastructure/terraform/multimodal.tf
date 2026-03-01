# HarveLogix AI - Multimodal AI Scanner Infrastructure
# Terraform configuration for all multimodal services
# Cost Analysis: See COST_ANALYSIS.md for detailed breakdown

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ============================================================================
# VARIABLES
# ============================================================================

variable "enable_multimodal_services" {
  description = "Enable multimodal AI services (set to false to disable invocations)"
  type        = bool
  default     = false  # DISABLED BY DEFAULT - Enable after approval
}

variable "bedrock_model_id" {
  description = "Bedrock model ID for Claude Sonnet"
  type        = string
  default     = "anthropic.claude-sonnet-4-20250514"
}

variable "max_concurrent_executions" {
  description = "Max concurrent Lambda executions"
  type        = number
  default     = 10
}

variable "lambda_timeout_seconds" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_mb" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 512
}

# ============================================================================
# S3 BUCKET FOR MULTIMODAL MEDIA
# ============================================================================

resource "aws_s3_bucket" "multimodal_media" {
  bucket = "${var.app_name}-multimodal-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "${var.app_name}-multimodal-media-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_s3_bucket_versioning" "multimodal_media" {
  bucket = aws_s3_bucket.multimodal_media.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "multimodal_media" {
  bucket = aws_s3_bucket.multimodal_media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.harvelogix.arn
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "multimodal_media" {
  bucket = aws_s3_bucket.multimodal_media.id

  rule {
    id     = "delete-old-scans"
    status = "Enabled"

    expiration {
      days = 90  # Delete scans after 90 days
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_public_access_block" "multimodal_media" {
  bucket = aws_s3_bucket.multimodal_media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ============================================================================
# DYNAMODB TABLE FOR MULTIMODAL SCANS
# ============================================================================

resource "aws_dynamodb_table" "multimodal_scans" {
  name           = "${var.app_name}-multimodal-scans-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "scan_id"
  range_key      = "timestamp"

  attribute {
    name = "scan_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "farmer_id"
    type = "S"
  }

  attribute {
    name = "scan_type"
    type = "S"
  }

  # Global Secondary Index for farmer queries
  global_secondary_index {
    name            = "farmer_id-timestamp-index"
    hash_key        = "farmer_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Global Secondary Index for scan type queries
  global_secondary_index {
    name            = "scan_type-timestamp-index"
    hash_key        = "scan_type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # TTL for automatic cleanup
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  # Encryption
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.harvelogix.arn
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Streaming for real-time processing
  stream_specification {
    stream_view_type = "NEW_AND_OLD_IMAGES"
  }

  tags = {
    Name        = "${var.app_name}-multimodal-scans-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_dynamodb_table" "scan_aggregations" {
  name           = "${var.app_name}-scan-aggregations-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "aggregation_id"
  range_key      = "date"

  attribute {
    name = "aggregation_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "region"
    type = "S"
  }

  # Global Secondary Index for regional queries
  global_secondary_index {
    name            = "region-date-index"
    hash_key        = "region"
    range_key       = "date"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.harvelogix.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.app_name}-scan-aggregations-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

# ============================================================================
# LAMBDA FUNCTIONS FOR MULTIMODAL ANALYSIS
# ============================================================================

# Lambda function for crop health analysis
resource "aws_lambda_function" "crop_health_analyzer" {
  filename      = "lambda_functions/crop_health_analyzer.zip"
  function_name = "${var.app_name}-crop-health-analyzer-${var.environment}"
  role          = aws_iam_role.lambda_multimodal_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  environment {
    variables = {
      BEDROCK_MODEL_ID           = var.bedrock_model_id
      MULTIMODAL_SCANS_TABLE     = aws_dynamodb_table.multimodal_scans.name
      S3_BUCKET                  = aws_s3_bucket.multimodal_media.id
      ENABLE_INVOCATION          = var.enable_multimodal_services ? "true" : "false"
      ENVIRONMENT                = var.environment
    }
  }

  reserved_concurrent_executions = var.enable_multimodal_services ? var.max_concurrent_executions : 0

  tags = {
    Name        = "${var.app_name}-crop-health-analyzer-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }

  depends_on = [
    aws_iam_role_policy.lambda_multimodal_policy,
    aws_cloudwatch_log_group.lambda_crop_health
  ]
}

# Lambda function for irrigation analysis
resource "aws_lambda_function" "irrigation_analyzer" {
  filename      = "lambda_functions/irrigation_analyzer.zip"
  function_name = "${var.app_name}-irrigation-analyzer-${var.environment}"
  role          = aws_iam_role.lambda_multimodal_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  environment {
    variables = {
      BEDROCK_MODEL_ID           = var.bedrock_model_id
      MULTIMODAL_SCANS_TABLE     = aws_dynamodb_table.multimodal_scans.name
      S3_BUCKET                  = aws_s3_bucket.multimodal_media.id
      ENABLE_INVOCATION          = var.enable_multimodal_services ? "true" : "false"
      ENVIRONMENT                = var.environment
    }
  }

  reserved_concurrent_executions = var.enable_multimodal_services ? var.max_concurrent_executions : 0

  tags = {
    Name        = "${var.app_name}-irrigation-analyzer-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }

  depends_on = [
    aws_iam_role_policy.lambda_multimodal_policy,
    aws_cloudwatch_log_group.lambda_irrigation
  ]
}

# Lambda function for weather analysis
resource "aws_lambda_function" "weather_analyzer" {
  filename      = "lambda_functions/weather_analyzer.zip"
  function_name = "${var.app_name}-weather-analyzer-${var.environment}"
  role          = aws_iam_role.lambda_multimodal_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  environment {
    variables = {
      BEDROCK_MODEL_ID           = var.bedrock_model_id
      MULTIMODAL_SCANS_TABLE     = aws_dynamodb_table.multimodal_scans.name
      S3_BUCKET                  = aws_s3_bucket.multimodal_media.id
      ENABLE_INVOCATION          = var.enable_multimodal_services ? "true" : "false"
      ENVIRONMENT                = var.environment
    }
  }

  reserved_concurrent_executions = var.enable_multimodal_services ? var.max_concurrent_executions : 0

  tags = {
    Name        = "${var.app_name}-weather-analyzer-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }

  depends_on = [
    aws_iam_role_policy.lambda_multimodal_policy,
    aws_cloudwatch_log_group.lambda_weather
  ]
}

# Lambda function for voice query processing
resource "aws_lambda_function" "voice_query_processor" {
  filename      = "lambda_functions/voice_query_processor.zip"
  function_name = "${var.app_name}-voice-query-processor-${var.environment}"
  role          = aws_iam_role.lambda_multimodal_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  environment {
    variables = {
      BEDROCK_MODEL_ID           = var.bedrock_model_id
      MULTIMODAL_SCANS_TABLE     = aws_dynamodb_table.multimodal_scans.name
      S3_BUCKET                  = aws_s3_bucket.multimodal_media.id
      ENABLE_INVOCATION          = var.enable_multimodal_services ? "true" : "false"
      ENVIRONMENT                = var.environment
    }
  }

  reserved_concurrent_executions = var.enable_multimodal_services ? var.max_concurrent_executions : 0

  tags = {
    Name        = "${var.app_name}-voice-query-processor-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }

  depends_on = [
    aws_iam_role_policy.lambda_multimodal_policy,
    aws_cloudwatch_log_group.lambda_voice_query
  ]
}

# Lambda function for video analysis
resource "aws_lambda_function" "video_analyzer" {
  filename      = "lambda_functions/video_analyzer.zip"
  function_name = "${var.app_name}-video-analyzer-${var.environment}"
  role          = aws_iam_role.lambda_multimodal_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 300  # 5 minutes for video processing
  memory_size   = 1024  # More memory for video processing

  environment {
    variables = {
      BEDROCK_MODEL_ID           = var.bedrock_model_id
      MULTIMODAL_SCANS_TABLE     = aws_dynamodb_table.multimodal_scans.name
      S3_BUCKET                  = aws_s3_bucket.multimodal_media.id
      ENABLE_INVOCATION          = var.enable_multimodal_services ? "true" : "false"
      ENVIRONMENT                = var.environment
    }
  }

  reserved_concurrent_executions = var.enable_multimodal_services ? 5 : 0  # Lower concurrency for video

  tags = {
    Name        = "${var.app_name}-video-analyzer-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }

  depends_on = [
    aws_iam_role_policy.lambda_multimodal_policy,
    aws_cloudwatch_log_group.lambda_video
  ]
}

# ============================================================================
# IAM ROLE FOR LAMBDA MULTIMODAL FUNCTIONS
# ============================================================================

resource "aws_iam_role" "lambda_multimodal_role" {
  name = "${var.app_name}-lambda-multimodal-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-lambda-multimodal-role-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_iam_role_policy" "lambda_multimodal_policy" {
  name = "${var.app_name}-lambda-multimodal-policy-${var.environment}"
  role = aws_iam_role.lambda_multimodal_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Sid    = "DynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.multimodal_scans.arn,
          aws_dynamodb_table.scan_aggregations.arn,
          "${aws_dynamodb_table.multimodal_scans.arn}/index/*",
          "${aws_dynamodb_table.scan_aggregations.arn}/index/*"
        ]
      },
      {
        Sid    = "BedrockAccess"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "*"
      },
      {
        Sid    = "RekognitionAccess"
        Effect = "Allow"
        Action = [
          "rekognition:DetectLabels",
          "rekognition:DetectText",
          "rekognition:DetectFaces"
        ]
        Resource = "*"
      },
      {
        Sid    = "TranscribeAccess"
        Effect = "Allow"
        Action = [
          "transcribe:StartTranscriptionJob",
          "transcribe:GetTranscriptionJob"
        ]
        Resource = "*"
      },
      {
        Sid    = "S3Access"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.multimodal_media.arn}/*"
      },
      {
        Sid    = "KMSAccess"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.harvelogix.arn
      },
      {
        Sid    = "EventBridgeAccess"
        Effect = "Allow"
        Action = [
          "events:PutEvents"
        ]
        Resource = aws_cloudwatch_event_bus.harvelogix.arn
      }
    ]
  })
}

# ============================================================================
# API GATEWAY FOR MULTIMODAL ENDPOINTS
# ============================================================================

resource "aws_apigatewayv2_api" "multimodal_api" {
  name          = "${var.app_name}-multimodal-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
  }

  tags = {
    Name        = "${var.app_name}-multimodal-api-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_apigatewayv2_stage" "multimodal_api_stage" {
  api_id      = aws_apigatewayv2_api.multimodal_api.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = {
    Name        = "${var.app_name}-multimodal-api-stage-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

# ============================================================================
# CLOUDWATCH LOG GROUPS
# ============================================================================

resource "aws_cloudwatch_log_group" "lambda_crop_health" {
  name              = "/aws/lambda/${var.app_name}-crop-health-analyzer-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-crop-health-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_log_group" "lambda_irrigation" {
  name              = "/aws/lambda/${var.app_name}-irrigation-analyzer-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-irrigation-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_log_group" "lambda_weather" {
  name              = "/aws/lambda/${var.app_name}-weather-analyzer-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-weather-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_log_group" "lambda_voice_query" {
  name              = "/aws/lambda/${var.app_name}-voice-query-processor-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-voice-query-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_log_group" "lambda_video" {
  name              = "/aws/lambda/${var.app_name}-video-analyzer-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-video-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.app_name}-multimodal-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.app_name}-api-gateway-logs-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

# ============================================================================
# CLOUDWATCH ALARMS FOR MONITORING
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.app_name}-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Alert when Lambda functions have errors"
  treat_missing_data  = "notBreaching"

  tags = {
    Name        = "${var.app_name}-lambda-errors-alarm-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_throttling" {
  alarm_name          = "${var.app_name}-dynamodb-throttling-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ConsumedWriteCapacityUnits"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1000"
  alarm_description   = "Alert when DynamoDB is throttled"
  treat_missing_data  = "notBreaching"

  tags = {
    Name        = "${var.app_name}-dynamodb-throttling-alarm-${var.environment}"
    Service     = "Multimodal"
    CostCenter  = "Multimodal-AI"
  }
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "multimodal_s3_bucket" {
  value       = aws_s3_bucket.multimodal_media.id
  description = "S3 bucket for multimodal media storage"
}

output "multimodal_scans_table" {
  value       = aws_dynamodb_table.multimodal_scans.name
  description = "DynamoDB table for multimodal scans"
}

output "scan_aggregations_table" {
  value       = aws_dynamodb_table.scan_aggregations.name
  description = "DynamoDB table for scan aggregations"
}

output "crop_health_lambda_arn" {
  value       = aws_lambda_function.crop_health_analyzer.arn
  description = "ARN of crop health analyzer Lambda function"
}

output "irrigation_lambda_arn" {
  value       = aws_lambda_function.irrigation_analyzer.arn
  description = "ARN of irrigation analyzer Lambda function"
}

output "weather_lambda_arn" {
  value       = aws_lambda_function.weather_analyzer.arn
  description = "ARN of weather analyzer Lambda function"
}

output "voice_query_lambda_arn" {
  value       = aws_lambda_function.voice_query_processor.arn
  description = "ARN of voice query processor Lambda function"
}

output "video_analyzer_lambda_arn" {
  value       = aws_lambda_function.video_analyzer.arn
  description = "ARN of video analyzer Lambda function"
}

output "multimodal_api_endpoint" {
  value       = aws_apigatewayv2_api.multimodal_api.api_endpoint
  description = "API Gateway endpoint for multimodal services"
}

output "enable_multimodal_services" {
  value       = var.enable_multimodal_services
  description = "Whether multimodal services are enabled for invocation"
}
