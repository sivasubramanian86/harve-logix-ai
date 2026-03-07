#!/bin/bash
sudo su -
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs gcc-c++ make unzip
npm install -y -g pm2
mkdir -p /opt/harvelogix/backend
cd /opt/harvelogix/backend
aws s3 cp s3://harvelogix-020513638290-multimodal-dev-020513638290/deploy/backend.zip . --region ap-south-2
unzip -o backend.zip
npm install
npx prisma generate
pm2 start server.js --name harvelogix-backend
pm2 save
pm2 startup | tail -n 1 | bash
