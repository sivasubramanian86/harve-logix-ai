# Deploy AWS Bedrock Agent Stack

# Deploy to us-east-1 (Bedrock Agents only available here)
aws cloudformation create-stack \
  --region us-east-1 \
  --stack-name harvelogix-bedrock-agent \
  --template-body file://infrastructure/cloudformation/bedrock-agent-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM

# Check deployment status
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name harvelogix-bedrock-agent \
  --query 'Stacks[0].StackStatus'

# Get outputs after deployment
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name harvelogix-bedrock-agent \
  --query 'Stacks[0].Outputs'
