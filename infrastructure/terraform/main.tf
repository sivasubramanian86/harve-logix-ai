# HarveLogix AI - Terraform Infrastructure as Code
# Main configuration for AWS resources

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "harvelogix-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "HarveLogix"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "harvelogix"
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# KMS Key for encryption
resource "aws_kms_key" "harvelogix" {
  description             = "KMS key for HarveLogix encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name = "${var.app_name}-key-${var.environment}"
  }
}

resource "aws_kms_alias" "harvelogix" {
  name          = "alias/${var.app_name}-${var.environment}"
  target_key_id = aws_kms_key.harvelogix.key_id
}

# DynamoDB Tables
resource "aws_dynamodb_table" "farmers" {
  name           = "${var.app_name}-farmers-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "farmer_id"
  range_key      = "timestamp"

  attribute {
    name = "farmer_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "crop_type"
    type = "S"
  }

  global_secondary_index {
    name            = "crop_type-timestamp-index"
    hash_key        = "crop_type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.harvelogix.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.app_name}-farmers-${var.environment}"
  }
}

resource "aws_dynamodb_table" "agent_decisions" {
  name           = "${var.app_name}-agent-decisions-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "farmer_id"
  range_key      = "decision_timestamp"

  attribute {
    name = "farmer_id"
    type = "S"
  }

  attribute {
    name = "decision_timestamp"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.harvelogix.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.app_name}-agent-decisions-${var.environment}"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "models" {
  bucket = "${var.app_name}-models-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.app_name}-models-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "models" {
  bucket = aws_s3_bucket.models.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.harvelogix.arn
    }
  }
}

resource "aws_s3_bucket" "images" {
  bucket = "${var.app_name}-images-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.app_name}-images-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.harvelogix.arn
    }
  }
}

# Lambda Execution Role
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-lambda-role-${var.environment}"

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
}

# Lambda Policy
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.app_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.farmers.arn,
          aws_dynamodb_table.agent_decisions.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "rekognition:DetectLabels",
          "rekognition:DetectText"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.models.arn}/*",
          "${aws_s3_bucket.images.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.harvelogix.arn
      }
    ]
  })
}

# EventBridge Event Bus
resource "aws_cloudwatch_event_bus" "harvelogix" {
  name = "${var.app_name}-events-${var.environment}"

  tags = {
    Name = "${var.app_name}-events-${var.environment}"
  }
}

# EventBridge Dead Letter Queue
resource "aws_sqs_queue" "dlq" {
  name                      = "${var.app_name}-dlq-${var.environment}"
  message_retention_seconds = 1209600  # 14 days
  kms_master_key_id         = aws_kms_key.harvelogix.id

  tags = {
    Name = "${var.app_name}-dlq-${var.environment}"
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "farmers" {
  name = "${var.app_name}-farmers-${var.environment}"

  password_policy {
    minimum_length    = 8
    require_uppercase = false
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
  }

  schema {
    name              = "email"
    attribute_data_type = "String"
    required          = false
    mutable           = true
  }

  schema {
    name              = "phone_number"
    attribute_data_type = "String"
    required          = true
    mutable           = true
  }

  auto_verified_attributes = ["email"]

  tags = {
    Name = "${var.app_name}-farmers-${var.environment}"
  }
}

resource "aws_cognito_user_pool_client" "farmers" {
  name                = "${var.app_name}-app-${var.environment}"
  user_pool_id        = aws_cognito_user_pool.farmers.id
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

# Outputs
output "dynamodb_farmers_table" {
  value       = aws_dynamodb_table.farmers.name
  description = "DynamoDB farmers table name"
}

output "dynamodb_decisions_table" {
  value       = aws_dynamodb_table.agent_decisions.name
  description = "DynamoDB agent decisions table name"
}

output "s3_models_bucket" {
  value       = aws_s3_bucket.models.id
  description = "S3 models bucket name"
}

output "s3_images_bucket" {
  value       = aws_s3_bucket.images.id
  description = "S3 images bucket name"
}

output "lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "Lambda execution role ARN"
}

output "event_bus_name" {
  value       = aws_cloudwatch_event_bus.harvelogix.name
  description = "EventBridge event bus name"
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.farmers.id
  description = "Cognito user pool ID"
}

output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.farmers.id
  description = "Cognito client ID"
}
