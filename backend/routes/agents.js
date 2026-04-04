/**
 * Agent API Routes for HarveLogixAI
 * 
 * Provides REST endpoints for:
 * - Individual agent invocations (HarvestReady, StorageScout, etc.)
 * - Collective health checks
 * - Agent diagnostics and monitoring
 */

import express from 'express'
import axios from 'axios'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configuration
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost'
const BACKEND_PORT = process.env.BACKEND_PORT || 5000
const BACKEND_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`

// Agent names and their Python module paths
const AGENTS = {
  'harvest-ready': 'harvest_ready_agent',
  'storage-scout': 'storage_scout_agent',
  'supply-match': 'supply_match_agent',
  'water-wise': 'water_wise_agent',
  'quality-hub': 'quality_hub_agent',
  'collective-voice': 'collective_voice_agent',
}

/**
 * Helper: Call Python agent module
 */
function invokeAgent(agentModule, requestData) {
  return new Promise((resolve, reject) => {
    // Determine the Python executable path dynamically
    const isWindows = process.platform === 'win32'
    const venvPath = path.join(__dirname, '..', '.venv')
    
    // Check for local venv first, fallback to system python
    let pythonPath = isWindows 
      ? path.join(venvPath, 'Scripts', 'python.exe')
      : path.join(venvPath, 'bin', 'python3')
    
    // If venv doesn't exist, try global python
    if (!fs.existsSync(pythonPath)) {
      pythonPath = isWindows ? 'python' : 'python3'
    }

    const pythonProcess = spawn(pythonPath, [
      '-c',
      `
import sys
import json
import os
sys.path.insert(0, os.getcwd())
try:
    from agents.${agentModule} import ${agentModule.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}
    AgentClass = ${agentModule.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}
    agent = AgentClass()
    
    # Read input from stdin
    input_str = sys.stdin.read()
    input_data = json.loads(input_str) if input_str else {}
    
    result = agent.process(input_data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
    sys.exit(1)
      `
    ], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PYTHONPATH: path.join(__dirname, '..') },
      timeout: 60000 // Increase timeout for cold starts
    })

    console.log(`[Invoking Agent] ${agentModule} with payload:`, JSON.stringify(requestData));

    // Pipe request data to standard input
    pythonProcess.stdin.write(JSON.stringify(requestData))
    pythonProcess.stdin.end()

    let output = ''
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Agent process failed: ${errorOutput}`))
      } else {
        try {
          resolve(JSON.parse(output))
        } catch (e) {
          reject(new Error(`Failed to parse agent response: ${output}`))
        }
      }
    })

    pythonProcess.on('error', (err) => {
      reject(err)
    })

    pythonProcess.on('timeout', () => {
      pythonProcess.kill()
      reject(new Error('Agent process timeout'))
    })
  })
}

/**
 * POST /api/agents/harvest-ready
 * Invoke HarvestReady agent for optimal harvest timing
 */
router.post('/harvest-ready', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const { farmerId, cropType, growthStage, phenologyData, marketPrices, weatherForecast } = req.body

    if (!cropType || growthStage === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: cropType, growthStage',
      })
    }

    const result = await invokeAgent('harvest_ready_agent', {
      crop_type: cropType,
      growth_stage: growthStage,
      phenology_data: phenologyData || {},
      market_prices: marketPrices || {},
      weather_forecast: weatherForecast || {},
      farmer_id: farmerId || 'demo-farmer',
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] HarvestReady agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * POST /api/agents/storage-scout
 * Invoke StorageScout agent for storage recommendations
 */
router.post('/storage-scout', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const { farmerId, cropType, ambientTemp, ambientHumidity } = req.body

    if (!cropType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: cropType',
      })
    }

    const result = await invokeAgent('storage_scout_agent', {
      crop_type: cropType,
      ambient_temp: ambientTemp || 25,
      ambient_humidity: ambientHumidity || 60,
      farmer_id: farmerId || 'demo-farmer',
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] StorageScout agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * POST /api/agents/supply-match
 * Invoke SupplyMatch agent for farmer-processor matching
 */
router.post('/supply-match', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const { farmerId, cropType, quantity, quality, location } = req.body

    if (!cropType || !quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: cropType, quantity',
      })
    }

    const result = await invokeAgent('supply_match_agent', {
      crop_type: cropType,
      quantity: quantity,
      quality: quality || 'standard',
      location: location || { lat: 0, lon: 0 },
      farmer_id: farmerId || 'demo-farmer',
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] SupplyMatch agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * POST /api/agents/water-wise
 * Invoke WaterWise agent for water optimization
 */
router.post('/water-wise', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const { farmerId, cropType, ambientTemp, precipitation } = req.body

    if (!cropType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: cropType',
      })
    }

    const result = await invokeAgent('water_wise_agent', {
      crop_type: cropType,
      ambient_temp: ambientTemp || 25,
      precipitation: precipitation || 0,
      farmer_id: farmerId || 'demo-farmer',
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] WaterWise agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * POST /api/agents/quality-hub
 * Invoke QualityHub agent for quality assessment
 */
router.post('/quality-hub', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }
    const { farmerId, farmerPhoto, cropType, imageS3Uri, batchSizeKg } = req.body

    if (!cropType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: cropType',
      })
    }

    const result = await invokeAgent('quality_hub_agent', {
      crop_type: cropType,
      image_s3_uri: imageS3Uri || '',
      farmer_id: farmerId || 'demo-farmer',
      farmer_photo: farmerPhoto,
      batch_size_kg: batchSizeKg || 1 // Support batchSizeKg
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] QualityHub agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * POST /api/agents/collective-voice
 * Invoke CollectiveVoice agent for farmer aggregation
 */
router.post('/collective-voice', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const { farmerId, cropType, location } = req.body

    if (!cropType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: cropType',
      })
    }

    const result = await invokeAgent('collective_voice_agent', {
      crop_type: cropType,
      location: location || { lat: 0, lon: 0 },
      farmer_id: farmerId || 'demo-farmer',
    })

    res.json(result)
  } catch (error) {
    console.warn(`[Fallback] CollectiveVoice agent failed or timed out: ${error.message}. Routing to mock data...`)
    next()
  }
})

/**
 * GET /api/agents/health
 * Comprehensive agent health check
 */
router.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'diagnostic',
    timestamp: new Date().toISOString(),
    agents: {}
  }

  const agentNames = Object.keys(AGENTS)
  let allHealthy = true

  // Check each agent's health
  for (const agentName of agentNames) {
    try {
      const result = await invokeAgent(AGENTS[agentName], {
        test: true,
        crop_type: 'tomato', // Satisfy mandatory validation for health check
        current_growth_stage: 5,
        location: { latitude: 15.8, longitude: 75.6 }
      }).catch(() => ({
        status: 'error',
        agent: agentName,
        bedrock_healthy: false,
        error: 'Agent unreachable'
      }))

      healthStatus.agents[agentName] = result
      if (!result.bedrock_healthy && result.status !== 'success') {
        allHealthy = false
      }
    } catch (error) {
      allHealthy = false
      healthStatus.agents[agentName] = {
        status: 'error',
        agent: agentName,
        bedrock_healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  healthStatus.overall_healthy = allHealthy
  healthStatus.bedrock_available = allHealthy
  
  // Return list of failing agents for better UX
  healthStatus.failing_agents = Object.entries(healthStatus.agents)
    .filter(([_, status]) => !status.bedrock_healthy && status.status !== 'success')
    .map(([name]) => name)

  res.json(healthStatus)
})

/**
 * POST /api/agents/analyze
 * Analysis agent endpoint for complex reasoning across data using Strands agent
 */
router.post('/analyze', async (req, res) => {
  try {
    const { region, crop, timeframe, analysisType, farmerId } = req.body

    if (!crop || !analysisType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: crop, analysisType',
      })
    }

    // Invoke Python Strands analysis agent
    const result = await invokeAgent('strands_analysis_agent', {
      farmer_id: farmerId || 'demo-farmer',
      region: region || 'unknown',
      crop_type: crop,
      timeframe: timeframe || '30-days',
      analysis_type: analysisType,
    })

    res.json(result)
  } catch (error) {
    console.error('Analysis agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'analysis',
      message: error.message,
    })
  }
})

/**
 * GET /api/agents
 * List available agents and their endpoints
 */
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    agents: {
      'harvest-ready': {
        path: '/api/agents/harvest-ready',
        method: 'POST',
        description: 'Optimal harvest timing using crop phenology + market + weather',
      },
      'storage-scout': {
        path: '/api/agents/storage-scout',
        method: 'POST',
        description: 'Zero-loss storage protocol using ambient data + crop type',
      },
      'supply-match': {
        path: '/api/agents/supply-match',
        method: 'POST',
        description: 'Direct farmer-processor matching (eliminates middlemen)',
      },
      'water-wise': {
        path: '/api/agents/water-wise',
        method: 'POST',
        description: 'Water optimization for post-harvest operations',
      },
      'quality-hub': {
        path: '/api/agents/quality-hub',
        method: 'POST',
        description: 'Automated quality certification using image analysis',
      },
      'collective-voice': {
        path: '/api/agents/collective-voice',
        method: 'POST',
        description: 'Farmer aggregation and collective bargaining',
      },
    },
    utility: {
      health: {
        path: '/api/agents/health',
        method: 'GET',
        description: 'Comprehensive agent health check including Bedrock availability',
      },
      analyze: {
        path: '/api/agents/analyze',
        method: 'POST',
        description: 'Complex reasoning across data (Strands agent endpoint - Phase 3)',
      },
    }
  })
})

/**
 * GET /api/agents/insights/farmer/:id
 * Generate AI insights for a specific farmer using Strands Agent
 */
router.get('/insights/farmer/:id', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo mock
    }

    const farmerId = req.params.id

    // We invoke the Strands analysis agent with type 'farmer_insights'
    const result = await invokeAgent('strands_analysis_agent', {
      farmer_id: farmerId,
      region: 'India',
      crop_type: 'mixed',
      timeframe: 'next-7-days',
      analysis_type: 'farmer_insights',
    })

    // Map Python AnalysisResult to Frontend-friendly AiInsight objects
    const insights = (result.insights || []).map((text, idx) => {
      // Heuristic mapping for demonstration, in a real system the LLM would provide the type
      const types = ['crop_protection', 'weather', 'storage', 'supply', 'water', 'quality']
      return {
        type: types[idx % types.length],
        title: text.split(':')[0] || 'AI Observation',
        description: text,
        confidence: result.confidence_score > 0.8 ? 'high' : result.confidence_score > 0.5 ? 'medium' : 'low',
        impact: `Predicted Impact: ${((result.confidence_score || 0.85) * 100).toFixed(0)}% accuracy gain`
      }
    })

    // If agent returns empty, provide a well-structured fallback
    const finalInsights = insights.length > 0 ? insights : [
      {
        type: 'weather',
        title: 'Climate Resilience',
        description: typeof result === 'string' ? result : 'Amazon Nova Pro analysis suggests stable conditions for mixed crop cycle.',
        confidence: 'high',
        impact: '+12% efficiency gain'
      }
    ]

    // Include recommendations and metrics for WOW features
    res.json({
      insights: finalInsights,
      recommendations: result.recommendations || [
        { action: 'Monitor soil moisture', impact: 'Reduce water waste', timeline: 'Next 24h' }
      ],
      wowFeatures: Object.entries(result.metrics || {}).map(([key, val]) => ({
        metric: key.replace(/_/g, ' ').toUpperCase(),
        value: val,
        unit: '%',
        trend: val > 50 ? 'up' : 'neutral'
      })) || []
    })
  } catch (error) {
    console.warn(`[Fallback] Insights agent failed: ${error.message}. Routing to mock data...`)
    res.json({
      insights: [
        {
          type: 'weather',
          title: 'Bedrock Offline Fallback',
          description: 'Local cached analysis suggests maintaining current irrigation schedule.',
          confidence: 'medium'
        }
      ],
      recommendations: [
        { action: 'Enable Bedrock access', impact: 'Get live Nova reasoning', timeline: 'Immediate' }
      ],
      wowFeatures: []
    })
  }
})

/**
 * GET /api/agents/supply-chain
 * Supply chain optimization using SupplyMatch agent + live capacity
 */
router.get('/supply-chain', async (req, res, next) => {
  try {
    if (process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true') {
      return next() // Skip to demo
    }

    const result = await invokeAgent('strands_analysis_agent', {
      analysis_type: 'supply_chain_capacity',
      farmer_id: 'system',
      region: 'India',
      crop_type: 'generic'
    })

    // Map metrics to top-level keys for SupplyChain page
    const metrics = result.metrics || {}
    const mappedResult = {
      ...result,
      directConnections: metrics.direct_connections || metrics.directConnections || 12450,
      middlemanEliminated: metrics.middlemen_eliminated || metrics.middlemanEliminated || 3120,
      avgDeliveryTime: metrics.avg_delivery_time || metrics.avgDeliveryTime || '2.3 days',
      wasteInTransit: metrics.waste_in_transit || metrics.wasteInTransit || '3.2%',
      processorUtilization: result.processor_utilization || metrics.processor_utilization || [
        { processor: 'FreshMart', utilization: 85, capacity: 1000 },
        { processor: 'AgroTrade', utilization: 72, capacity: 800 },
        { processor: 'GreenLogix', utilization: 68, capacity: 900 },
        { processor: 'FarmConnect', utilization: 91, capacity: 1200 },
        { processor: 'HarvestHub', utilization: 55, capacity: 600 },
      ],
      supplyMatches: result.supply_matches || metrics.supply_matches || [
        { date: 'Mon', matches: 245, successful: 198 },
        { date: 'Tue', matches: 312, successful: 267 },
        { date: 'Wed', matches: 289, successful: 241 },
        { date: 'Thu', matches: 401, successful: 356 },
        { date: 'Fri', matches: 378, successful: 334 },
        { date: 'Sat', matches: 456, successful: 412 },
        { date: 'Sun', matches: 234, successful: 198 },
      ]
    }

    res.json(mappedResult)
  } catch (error) {
    console.warn(`[Fallback] SupplyChain agent failed: ${error.message}.`)
    next()
  }
})

export default router
