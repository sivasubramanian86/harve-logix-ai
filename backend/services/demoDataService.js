/**
 * Demo Data Service
 * Provides fixture data for all scan types without AWS calls
 * Used for local development and testing
 */

/**
 * Get demo crop health response
 */
function getCropHealthResponse(scanId) {
  const responses = [
    {
      scan_id: scanId,
      scan_type: 'crop-health',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        health_status: 'healthy',
        detected_issues: [],
        recommended_actions: [
          'Continue current watering schedule',
          'Monitor for pest activity',
          'Apply balanced fertilizer in 2 weeks',
        ],
        confidence_score: 0.94,
      },
      processing_time_ms: 1200,
    },
    {
      scan_id: scanId,
      scan_type: 'crop-health',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        health_status: 'at_risk',
        detected_issues: [
          'Early signs of leaf spot disease',
          'Slight nitrogen deficiency',
          'Minor pest damage on lower leaves',
        ],
        recommended_actions: [
          'Apply fungicide spray within 48 hours',
          'Increase nitrogen fertilizer by 20%',
          'Monitor pest population daily',
          'Improve air circulation in field',
        ],
        confidence_score: 0.87,
      },
      processing_time_ms: 1450,
    },
    {
      scan_id: scanId,
      scan_type: 'crop-health',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        health_status: 'diseased',
        detected_issues: [
          'Advanced powdery mildew infection',
          'Severe nutrient deficiency',
          'Heavy pest infestation',
        ],
        recommended_actions: [
          'Apply systemic fungicide immediately',
          'Increase irrigation frequency',
          'Apply complete fertilizer with micronutrients',
          'Consider crop rotation after harvest',
          'Consult local agricultural extension office',
        ],
        confidence_score: 0.91,
      },
      processing_time_ms: 1680,
    },
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get demo field irrigation response
 */
function getIrrigationResponse(scanId) {
  const responses = [
    {
      scan_id: scanId,
      scan_type: 'field-irrigation',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        irrigation_status: 'optimal',
        recommendations: [
          'Maintain current irrigation schedule',
          'Water early morning for best results',
          'Monitor soil moisture daily',
        ],
        risk_notes: [],
        water_saving_tips: [
          'Use drip irrigation to reduce water loss by 30%',
          'Mulch around plants to retain moisture',
          'Water during cooler hours to minimize evaporation',
        ],
      },
      processing_time_ms: 980,
    },
    {
      scan_id: scanId,
      scan_type: 'field-irrigation',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        irrigation_status: 'under_watered',
        recommendations: [
          'Increase irrigation frequency by 25%',
          'Water for longer duration each session',
          'Check for irrigation system leaks',
          'Increase irrigation to 2x daily during peak heat',
        ],
        risk_notes: [
          'Soil moisture below optimal threshold',
          'Risk of crop stress and reduced yield',
          'Potential for heat damage to plants',
        ],
        water_saving_tips: [
          'Install soil moisture sensors for precise watering',
          'Use mulch to reduce evaporation',
          'Water during early morning hours',
        ],
      },
      processing_time_ms: 1120,
    },
    {
      scan_id: scanId,
      scan_type: 'field-irrigation',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        irrigation_status: 'waterlogging',
        recommendations: [
          'Stop irrigation immediately',
          'Improve field drainage',
          'Install drainage channels if not present',
          'Consider raised bed cultivation for future seasons',
        ],
        risk_notes: [
          'Excessive soil moisture detected',
          'High risk of root rot and fungal diseases',
          'Potential for significant yield loss',
          'Soil compaction risk from waterlogging',
        ],
        water_saving_tips: [
          'Implement proper drainage system',
          'Use raised beds to improve drainage',
          'Avoid irrigation during rainy season',
        ],
      },
      processing_time_ms: 1340,
    },
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get demo sky and weather response
 */
function getWeatherResponse(scanId) {
  const responses = [
    {
      scan_id: scanId,
      scan_type: 'sky-weather',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        sky_description: 'Clear blue sky with scattered clouds',
        forecast_summary: 'Sunny weather expected for next 3 days',
        rainfall_probability: 5,
        temperature_range: '28-35°C',
        wind_speed: '8-12 km/h',
        harvest_window_advice: 'Excellent conditions for harvesting. Proceed with harvest operations.',
        risk_level: 'LOW',
      },
      processing_time_ms: 850,
    },
    {
      scan_id: scanId,
      scan_type: 'sky-weather',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        sky_description: 'Overcast with medium cloud cover',
        forecast_summary: '40% chance of rain in next 24 hours',
        rainfall_probability: 40,
        temperature_range: '22-28°C',
        wind_speed: '12-18 km/h',
        harvest_window_advice: 'Moderate risk. Consider harvesting today if possible. Rain expected tomorrow.',
        risk_level: 'MEDIUM',
      },
      processing_time_ms: 920,
    },
    {
      scan_id: scanId,
      scan_type: 'sky-weather',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        sky_description: 'Dark clouds with strong wind patterns',
        forecast_summary: 'Heavy rain and thunderstorms expected within 12 hours',
        rainfall_probability: 85,
        temperature_range: '18-24°C',
        wind_speed: '25-35 km/h',
        harvest_window_advice: 'High risk. Delay harvesting. Secure crops and equipment. Storm approaching.',
        risk_level: 'HIGH',
      },
      processing_time_ms: 1050,
    },
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get demo voice query response
 */
function getVoiceQueryResponse(scanId) {
  const responses = [
    {
      scan_id: scanId,
      scan_type: 'voice-query',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        transcript: 'When should I harvest my wheat crop?',
        language_detected: 'en',
        ai_response:
          'Based on current weather conditions and crop maturity indicators, your wheat is ready for harvest. The grain moisture content is optimal at 12-14%. Harvest within the next 2-3 days for best results. Current weather forecast shows clear skies, making it an ideal time to proceed.',
        confidence_score: 0.92,
      },
      processing_time_ms: 2100,
    },
    {
      scan_id: scanId,
      scan_type: 'voice-query',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        transcript: 'मुझे अपनी फसल के लिए कितना पानी देना चाहिए?',
        language_detected: 'hi',
        ai_response:
          'आपकी मिट्टी की नमी के आधार पर, आपको सप्ताह में 2-3 बार सिंचाई करनी चाहिए। प्रत्येक सिंचाई में 25-30 मिमी पानी दें। गर्मी के मौसम में सिंचाई की आवृत्ति बढ़ाएं। सुबह जल्दी या शाम को पानी देना सबसे अच्छा है।',
        confidence_score: 0.88,
      },
      processing_time_ms: 1950,
    },
    {
      scan_id: scanId,
      scan_type: 'voice-query',
      timestamp: new Date().toISOString(),
      status: 'completed',
      data: {
        transcript: 'Which processor should I contact for my rice?',
        language_detected: 'en',
        ai_response:
          'Based on your location and rice quality, I recommend contacting: 1) Premium Rice Mills (15km away, offers 12% premium for Grade A), 2) Valley Processing (8km away, bulk discount available), 3) Organic Certified Processors (20km away, specializes in organic rice). Premium Rice Mills offers the best price for your quality grade.',
        confidence_score: 0.85,
      },
      processing_time_ms: 2340,
    },
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get demo video scan response
 */
function getVideoScanResponse(scanId) {
  return {
    scan_id: scanId,
    scan_type: 'video-scan',
    timestamp: new Date().toISOString(),
    status: 'completed',
    data: {
      duration_seconds: 180,
      frames_analyzed: 45,
      aggregated_insights: [
        'Overall crop health is good with 85% of plants showing healthy growth',
        'Detected minor pest activity in 12% of field area',
        'Irrigation coverage is uniform across field',
        'Weed pressure is low (< 5% coverage)',
        'Soil condition appears optimal for current growth stage',
      ],
      detected_issues: [
        'Small patch of potential disease in northeast corner (2% of field)',
        'Minor nutrient deficiency visible in 8% of plants',
        'Slight water stress in elevated areas',
      ],
      overall_health_score: 0.84,
    },
    processing_time_ms: 4200,
  }
}

export default {
  getCropHealthResponse,
  getIrrigationResponse,
  getWeatherResponse,
  getVoiceQueryResponse,
  getVideoScanResponse,
}
