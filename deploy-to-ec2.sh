#!/bin/bash
# Deployment script for HarveLogix backend to EC2

set -e

INSTANCE_IP="18.60.216.34"
INSTANCE_USER="ec2-user"
BACKEND_DIR="/opt/harvelogix/backend"

echo "Deploying backend to EC2 instance..."

# SSH into the instance and pull latest code
ssh -i ~/.ssh/harvelogix-key.pem ${INSTANCE_USER}@${INSTANCE_IP} << 'EOF'
  cd ${BACKEND_DIR}
  git pull origin main
  npm install
  pm2 restart harvelogix-backend || pm2 start server.js --name harvelogix-backend
  echo "Backend restarted successfully"
EOF

echo "Deployment complete!"
