/**
 * Lambda Proxy Function for HarveLogix API Gateway
 * Proxies requests to the backend running on EC2
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = process.env.BACKEND_URL || 'http://18.60.216.34:5000';

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.rawPath || event.path || '/';
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const headers = event.headers || {};
  
  // Remove host header to avoid conflicts
  delete headers.host;
  
  let body = event.body;
  if (event.isBase64Encoded && body) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    
    // Add query parameters
    if (event.rawQueryString) {
      url.search = event.rawQueryString;
    }

    const options = {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };

    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody,
          isBase64Encoded: false,
        });
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve({
        statusCode: 502,
        body: JSON.stringify({ error: 'Bad Gateway', message: error.message }),
      });
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
};
