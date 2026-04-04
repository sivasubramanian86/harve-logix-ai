#!/bin/bash
set -e

# Install Node.js 22 LTS (pre-compiled binary - no glibc constraints on AL2)
NODE_VER="v22.14.0"
NODE_DIR="/usr/local"
curl -fsSL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-linux-x64.tar.xz" -o /tmp/node.tar.xz
tar -xf /tmp/node.tar.xz -C ${NODE_DIR} --strip-components=1
echo "Node version: $(${NODE_DIR}/bin/node --version)"
echo "NPM version: $(${NODE_DIR}/bin/npm --version)"

# Install PM2 globally using explicit path
${NODE_DIR}/bin/npm install -g pm2

# Create app dir and download backend
mkdir -p /opt/harvelogix/backend
cd /opt/harvelogix/backend
aws s3 cp s3://harvelogix-020513638290-multimodal-dev-020513638290/deploy/backend.zip . --region ap-south-2
unzip -o backend.zip

# Write production .env file
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://harvelogix_admin:HarveLogixRDS2026!@harvelogix-db.czmqyayg8zg4.ap-south-2.rds.amazonaws.com:5432/harvelogix
S3_BUCKET_NAME=harvelogix-020513638290-multimodal-dev-020513638290
AWS_REGION=ap-south-1
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://d2autvkcn7doq.cloudfront.net,http://localhost:3000
ENVEOF

echo "=== .env contents ==="
cat .env

# Install Node dependencies
${NODE_DIR}/bin/npm install --production

# Generate Prisma client
${NODE_DIR}/bin/npx prisma generate

# Start server with PM2
${NODE_DIR}/bin/pm2 delete harvelogix-backend || true
${NODE_DIR}/bin/pm2 start server.js --name harvelogix-backend --interpreter ${NODE_DIR}/bin/node
${NODE_DIR}/bin/pm2 save
${NODE_DIR}/bin/pm2 status
echo "=== Bootstrap complete! ==="
