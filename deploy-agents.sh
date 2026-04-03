#!/bin/bash
curl -o /opt/harvelogix/backend/routes/agents.js "https://amplify-harvelogixai-dev-9d00d-deployment.s3.ap-south-2.amazonaws.com/agents.js?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQJRVVI6JND3VLGVH%2F20260403%2Fap-south-2%2Fs3%2Faws4_request&X-Amz-Date=20260403T183519Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0eb1ba16c6a773ddadec90cc8c00fda2770ed77e76b4676a07ed7dddcddd3f07f"
pm2 restart harvelogix-backend
