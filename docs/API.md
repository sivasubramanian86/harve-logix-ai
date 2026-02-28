# HarveLogix AI - API Documentation

## Overview

HarveLogix AI provides a RESTful API for accessing the 6 autonomous agents and a WebSocket API for real-time notifications. All endpoints are secured with AWS Cognito authentication and rate-limited to 100 requests/second per farmer.

## Base URL

```
https://api.harvelogix.ai/v1
```

## Authentication

All API requests require an `Authorization` header with a valid Cognito access token:

```
Authorization: Bearer <access_token>
```

### Obtaining Access Token

1. **Register/Login via Cognito:**
   ```bash
   POST /cognito/login
   Content-Type: application/json
   
   {
     "phone": "+91-9876543210",
     "password": "your_password"
   }
   ```

2. **Response:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expires_in": 3600
   }
   ```

3. **Refresh Token:**
   ```bash
   POST /cognito/refresh
   Content-Type: application/json
   
   {
     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

## REST Endpoints

### 1. HarvestReady Agent

Get optimal harvest timing based on crop phenology, weather, and market conditions.

**Endpoint:**
```
GET /api/harvest-ready
```

**Request Parameters:**
```json
{
  "crop_type": "tomato",
  "current_growth_stage": 8,
  "location": {
    "latitude": 15.8,
    "longitude": 75.6
  }
}
```

**Response:**
```json
{
  "harvest_date": "2026-01-28",
  "harvest_time": "5:00 PM",
  "expected_income_gain_rupees": 4500,
  "confidence_score": 0.94,
  "reasoning": "ripeness 87% + no rain 48hrs + market peak on day-4",
  "optimal_time_window": {
    "start": "2026-01-28T04:00:00Z",
    "end": "2026-01-28T18:00:00Z"
  },
  "market_price_forecast": {
    "current": 48,
    "forecast_date": 52,
    "trend": "up_8%"
  }
}
```

**Status Codes:**
- `200 OK` - Successful response
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing/invalid token
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### 2. StorageScout Agent

Get storage recommendations to minimize post-harvest loss.

**Endpoint:**
```
GET /api/storage-scout
```

**Request Parameters:**
```json
{
  "crop_type": "tomato",
  "storage_duration_days": 14,
  "ambient_conditions": {
    "temperature_celsius": 28,
    "humidity_percent": 65,
    "light_level": "indirect"
  }
}
```

**Response:**
```json
{
  "storage_method": "shade_storage",
  "temperature_setpoint_celsius": 22,
  "humidity_setpoint_percent": 65,
  "waste_reduction_percent": 25,
  "estimated_shelf_life_days": 18,
  "confidence_score": 0.91,
  "recommendations": [
    "Store in well-ventilated area",
    "Maintain temperature between 20-24°C",
    "Keep humidity at 60-70%",
    "Check for ripeness daily"
  ],
  "cost_savings_rupees": 7500
}
```

---

### 3. SupplyMatch Agent

Find direct buyer matches for your produce.

**Endpoint:**
```
GET /api/supply-match
```

**Request Parameters:**
```json
{
  "crop_type": "tomato",
  "quantity_kg": 500,
  "quality_grade": "A",
  "location": {
    "latitude": 15.8,
    "longitude": 75.6
  },
  "harvest_date": "2026-01-28"
}
```

**Response:**
```json
{
  "top_3_matches": [
    {
      "buyer_id": "proc-789",
      "buyer_name": "FreshMart Cooperative",
      "location": "Bengaluru",
      "distance_km": 45,
      "price_per_kg": 48,
      "total_value_rupees": 24000,
      "match_score": 0.95,
      "reliability_rating": 0.98,
      "payment_terms": "same_day_cash",
      "transport_available": true
    },
    {
      "buyer_id": "proc-456",
      "buyer_name": "BigBasket Supplier",
      "location": "Bengaluru",
      "distance_km": 52,
      "price_per_kg": 46,
      "total_value_rupees": 23000,
      "match_score": 0.87,
      "reliability_rating": 0.95,
      "payment_terms": "2_days",
      "transport_available": true
    },
    {
      "buyer_id": "proc-123",
      "buyer_name": "Local Cooperative",
      "location": "Belgaum",
      "distance_km": 12,
      "price_per_kg": 45,
      "total_value_rupees": 22500,
      "match_score": 0.82,
      "reliability_rating": 0.92,
      "payment_terms": "same_day_cash",
      "transport_available": false
    }
  ],
  "direct_connection_link": "https://harvelogix.ai/connect/proc-789",
  "no_middleman_flag": true,
  "estimated_income_increase_rupees": 20000
}
```

---

### 4. WaterWise Agent

Optimize water usage for post-harvest operations.

**Endpoint:**
```
GET /api/water-wise
```

**Request Parameters:**
```json
{
  "crop_type": "tomato",
  "post_harvest_operations": ["washing", "cooling"],
  "climate_data": {
    "temperature_celsius": 28,
    "humidity_percent": 65,
    "rainfall_mm": 0
  },
  "cost_per_liter_rupees": 2.5
}
```

**Response:**
```json
{
  "water_optimized_protocol": {
    "washing": {
      "water_liters": 100,
      "temperature_celsius": 20,
      "duration_minutes": 15,
      "method": "drip_wash"
    },
    "cooling": {
      "water_liters": 50,
      "temperature_celsius": 15,
      "duration_minutes": 30,
      "method": "evaporative_cooling"
    }
  },
  "water_savings_liters": 75,
  "water_savings_percent": 30,
  "cost_savings_rupees": 187.50,
  "environmental_impact": {
    "co2_saved_kg": 0.15,
    "water_conservation_liters": 75
  },
  "confidence_score": 0.89
}
```

---

### 5. QualityHub Agent

Assess crop quality using image analysis.

**Endpoint:**
```
POST /api/quality-assessment
```

**Request (multipart/form-data):**
```
Content-Type: multipart/form-data

crop_type: "tomato"
batch_size_kg: 500
image: <binary_image_file>
```

**Response:**
```json
{
  "quality_grade": "A",
  "defect_percent": 2.5,
  "market_price_premium_percent": 15,
  "certification_json": {
    "grade": "A",
    "defects": [
      {
        "type": "minor_blemish",
        "severity": "low",
        "percent": 2.5
      }
    ],
    "ripeness_percent": 87,
    "color_uniformity": 0.92,
    "size_uniformity": 0.88,
    "issued_date": "2026-01-25T14:30:00Z",
    "valid_until": "2026-01-28T14:30:00Z"
  },
  "confidence_score": 0.952,
  "estimated_price_per_kg": 55.20,
  "estimated_total_value_rupees": 27600
}
```

---

### 6. CollectiveVoice Agent

Join a farmer collective for bulk discounts and shared logistics.

**Endpoint:**
```
GET /api/collective-voice
```

**Request Parameters:**
```json
{
  "crop_type": "tomato",
  "region": "Karnataka",
  "farmer_id": "uuid-123"
}
```

**Response:**
```json
{
  "aggregation_proposal": {
    "collective_id": "coll-456",
    "collective_name": "Belgaum Tomato Farmers Collective",
    "region": "Karnataka",
    "crop_type": "tomato",
    "formation_date": "2026-01-25"
  },
  "collective_size": 52,
  "expected_discount_percent": 12,
  "shared_logistics_plan": {
    "transport_method": "shared_truck",
    "cost_per_farmer_rupees": 500,
    "pickup_date": "2026-01-28",
    "delivery_location": "Bengaluru Mandi"
  },
  "estimated_income_increase_rupees": 3000,
  "confidence_score": 0.88,
  "join_link": "https://harvelogix.ai/collective/coll-456/join"
}
```

---

## WebSocket Endpoint

Real-time notifications for supply matches, payments, and alerts.

**Endpoint:**
```
wss://api.harvelogix.ai/ws/notifications
```

### Connection

```javascript
const ws = new WebSocket('wss://api.harvelogix.ai/ws/notifications');

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_access_token'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Notification:', message);
};
```

### Message Types

#### Supply Match Found
```json
{
  "type": "supply_match_found",
  "data": {
    "buyer_id": "proc-789",
    "buyer_name": "FreshMart Cooperative",
    "price_per_kg": 48,
    "total_value_rupees": 24000,
    "match_score": 0.95
  },
  "timestamp": "2026-01-25T14:30:00Z"
}
```

#### Payment Received
```json
{
  "type": "payment_received",
  "data": {
    "transaction_id": "txn-123",
    "amount_rupees": 24000,
    "buyer_name": "FreshMart Cooperative",
    "status": "completed"
  },
  "timestamp": "2026-01-25T14:30:00Z"
}
```

#### Scheme Eligibility
```json
{
  "type": "scheme_eligibility",
  "data": {
    "scheme_id": "scheme-456",
    "scheme_name": "PM-KISAN",
    "subsidy_amount_rupees": 6000,
    "eligibility_status": "eligible",
    "documents_required": ["Aadhaar", "Bank Account"]
  },
  "timestamp": "2026-01-25T14:30:00Z"
}
```

#### Weather Alert
```json
{
  "type": "weather_alert",
  "data": {
    "alert_type": "heavy_rain",
    "severity": "high",
    "forecast": "Heavy rain expected in next 48 hours",
    "recommendation": "Harvest immediately to avoid crop damage"
  },
  "timestamp": "2026-01-25T14:30:00Z"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_CROP_TYPE",
    "message": "The provided crop type is not supported",
    "details": {
      "provided": "xyz",
      "supported": ["tomato", "onion", "potato", "capsicum"]
    }
  },
  "timestamp": "2026-01-25T14:30:00Z",
  "request_id": "req-123456"
}
```

### Common Error Codes
- `INVALID_PARAMETERS` - Invalid request parameters
- `INVALID_CROP_TYPE` - Unsupported crop type
- `INVALID_LOCATION` - Invalid location coordinates
- `INSUFFICIENT_DATA` - Not enough data for recommendation
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `UNAUTHORIZED` - Missing/invalid authentication
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

- **Limit:** 100 requests/second per farmer
- **Headers:**
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1643116200
  ```
- **Exceeded:** Returns `429 Too Many Requests`

---

## Pagination

For endpoints returning lists:

```
GET /api/endpoint?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Versioning

API versions are specified in the URL:
- `v1` - Current version
- `v2` - Future version (when available)

---

## SDKs

### Python
```bash
pip install harvelogix-sdk
```

```python
from harvelogix import HarveLogixClient

client = HarveLogixClient(access_token='your_token')
result = client.harvest_ready(crop_type='tomato', growth_stage=8)
```

### JavaScript
```bash
npm install harvelogix-sdk
```

```javascript
import { HarveLogixClient } from 'harvelogix-sdk';

const client = new HarveLogixClient({ accessToken: 'your_token' });
const result = await client.harvestReady({ cropType: 'tomato', growthStage: 8 });
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Get harvest timing
curl -X GET https://api.harvelogix.ai/v1/api/harvest-ready \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "current_growth_stage": 8,
    "location": {"latitude": 15.8, "longitude": 75.6}
  }'

# 2. Get storage recommendations
curl -X GET https://api.harvelogix.ai/v1/api/storage-scout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "storage_duration_days": 14,
    "ambient_conditions": {"temperature_celsius": 28, "humidity_percent": 65}
  }'

# 3. Find buyers
curl -X GET https://api.harvelogix.ai/v1/api/supply-match \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "quantity_kg": 500,
    "quality_grade": "A",
    "location": {"latitude": 15.8, "longitude": 75.6},
    "harvest_date": "2026-01-28"
  }'

# 4. Assess quality
curl -X POST https://api.harvelogix.ai/v1/api/quality-assessment \
  -H "Authorization: Bearer $TOKEN" \
  -F "crop_type=tomato" \
  -F "batch_size_kg=500" \
  -F "image=@crop_photo.jpg"

# 5. Join collective
curl -X GET https://api.harvelogix.ai/v1/api/collective-voice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "region": "Karnataka",
    "farmer_id": "uuid-123"
  }'
```

---

**Last Updated:** 2026-01-25  
**API Version:** 1.0  
**Status:** Active
