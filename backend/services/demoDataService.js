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
        explanation: 'The crop appears vigorous and well-maintained with no visible signs of pathogen activity.',
        detected_issues: [],
        recommended_actions: [
          { action: 'Maintain schedule', urgency: 'low', details: 'Continue current watering and monitoring schedule.' },
          { action: 'Apply fertilizer', urgency: 'low', details: 'Apply balanced fertilizer in approximately 2 weeks.' },
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
        explanation: 'Early indicators of stress detected. Immediate moisture management and nutrient boost required to prevent yield loss.',
        detected_issues: [
          { type: 'Leaf Spot', severity: 'medium', description: 'Early signs of fungal leaf spot disease detected on lower leaves.' },
          { type: 'Nitrogen Deficiency', severity: 'low', description: 'Slight yellowing indicates emerging nitrogen deficiency.' },
        ],
        recommended_actions: [
          { action: 'Fungicide spray', urgency: 'medium', details: 'Apply protective fungicide spray within 48 hours.' },
          { action: 'Nitrogen boost', urgency: 'medium', details: 'Increase nitrogen fertilizer application by 20%.' },
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
        explanation: 'Critical infection levels found. Significant intervention needed immediately to salvage the crop and prevent further spread.',
        detected_issues: [
          { type: 'Powdery Mildew', severity: 'high', description: 'Advanced powdery mildew infection spreading rapidly across the field.' },
          { type: 'Severe Deficiency', severity: 'high', description: 'Plants showing signs of acute multi-nutrient deficiency.' },
        ],
        recommended_actions: [
          { action: 'Systemic treatment', urgency: 'high', details: 'Apply systemic fungicide immediately to contain spread.' },
          { action: 'Emergency irrigation', urgency: 'high', details: 'Increase frequency to mitigate plant stress.' },
          { action: 'Consult Expert', urgency: 'high', details: 'Contact local agri-extension office for quarantine advice.' }
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
        explanation: 'Soil moisture levels are balanced and well within the target range for the current growth stage.',
        recommended_actions: [
          { action: 'Early watering', urgency: 'low', details: 'Maintain morning watering for maximum absorption.' },
          { action: 'Moisture check', urgency: 'low', details: 'Daily manual soil check at 2-inch depth.' }
        ],
        risk_notes: [],
        water_saving_tips: [
          'Use drip irrigation to reduce water loss by 30%',
          'Mulch around plants to retain moisture',
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
        explanation: 'Visible signs of water stress. The crop requires an immediate increase in irrigation to avoid permanent wilting.',
        recommended_actions: [
          { action: 'Increase frequency', urgency: 'medium', details: 'Increase irrigation frequency by 25% immediately.' },
          { action: 'Leak detection', urgency: 'medium', details: 'Audit system for potential line pressure drops.' }
        ],
        risk_notes: [
          'Soil moisture below optimal threshold',
        ],
        water_saving_tips: [
          'Install soil moisture sensors for precision',
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
        explanation: 'Excessive water accumulation detected. Oxygen deprivation in roots is a significant threat; stop irrigation immediately.',
        recommended_actions: [
          { action: 'Stop irrigation', urgency: 'high', details: 'Cease all water application immediately.' },
          { action: 'Drainage repair', urgency: 'high', details: 'Clear existing drainage channels or dig new ones.' }
        ],
        risk_notes: [
          'Excessive soil moisture: High root rot risk',
        ],
        water_saving_tips: [
          'Switch to raised beds for better gravity drainage',
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
        harvest_window_advice: 'Excellent conditions. Proceed with harvest.',
        recommended_actions: [
          { action: 'Proceed with Harvest', urgency: 'low', details: 'Weather is ideal for large scale grain harvesting.' }
        ],
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
        harvest_window_advice: 'Moderate risk. Harvest today if possible.',
        recommended_actions: [
          { action: 'Accelerate Harvest', urgency: 'medium', details: 'Move up harvest schedule due to incoming rain.' }
        ],
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
        forecast_summary: 'Heavy rain and thunderstorms within 12 hours',
        rainfall_probability: 85,
        temperature_range: '18-24°C',
        wind_speed: '25-35 km/h',
        harvest_window_advice: 'High risk. Delay harvesting immediately.',
        recommended_actions: [
          { action: 'Secure Equipment', urgency: 'high', details: 'Move portable pumps and tools to higher ground.' },
          { action: 'Delay Harvest', urgency: 'high', details: 'Significant risk of grain damage from storm.' }
        ],
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
      explanation: 'Overall crop health is good with 85% of plants showing healthy growth. Minor issues detected in specific field sectors.',
      aggregated_insights: [
        'Overall crop health is good with 85% of plants showing healthy growth',
        'Detected minor pest activity in 12% of field area',
        'Irrigation coverage is uniform across field',
        'Weed pressure is low (< 5% coverage)',
        'Soil condition appears optimal for current growth stage',
      ],
      detected_issues: [
        { type: 'Patch Disease', severity: 'low', description: 'Small patch of potential disease in northeast corner (2% of field)' },
        { type: 'Nutrient Deficiency', severity: 'low', description: 'Minor nutrient deficiency visible in 8% of plants' },
        { type: 'Water Stress', severity: 'medium', description: 'Slight water stress in elevated areas' },
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
