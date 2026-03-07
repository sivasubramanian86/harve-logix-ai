#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "🚀 Deploying HarveLogix Dashboard to AWS Amplify..."

# Use npx for better Windows compatibility
AMPLIFY="npx @aws-amplify/cli@latest"

# Check if amplify is initialized
if [ ! -d amplify ]; then
  echo "⚙️  Initializing Amplify project..."
  $AMPLIFY init \
    --app harvelogix-dashboard \
    --envName dev \
    --frontend javascript \
    --framework react \
    --sourceDir web-dashboard \
    --distributionDir web-dashboard/dist \
    --buildCommand "npm run build" \
    --startCommand "npm run start" \
    --yes

  echo "🌐 Adding Amplify Hosting..."
  $AMPLIFY add hosting \
    --yes || echo "Note: Hosting may already be configured"
fi

echo "📤 Publishing to Amplify..."
$AMPLIFY publish --yes

echo ""
echo "✅ Deployment complete!"
echo "🌍 Your app is now live on Amplify!"
echo ""
echo "To view your app in the Amplify Console:"
echo "  https://console.aws.amazon.com/amplify/apps"
echo ""
echo "To configure GitHub CI/CD:"
echo "  1. Open the Amplify Console"
echo "  2. Select your app → Connect repository"
echo "  3. Authorize GitHub and select main branch"
