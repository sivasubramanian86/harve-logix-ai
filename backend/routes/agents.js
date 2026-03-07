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
    const pythonProcess = spawn('python', [
      '-c',
      `
import sys
import json
sys.path.insert(0, '/app/backend')
from agents.${agentModule} import ${agentModule.replace(/_/g, ' ').split().map(w => w.capitalize()).join()}
agent = ${agentModule.replace(/_/g, ' ').split().map(w => w.capitalize()).join()}()
result = agent.process(${JSON.stringify(requestData).replace(/"/g, '\\"')})
print(json.dumps(result))
      `
    ], {
      cwd: '/app/backend',
      timeout: 30000
    })

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
router.post('/harvest-ready', async (req, res) => {
  try {
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
    console.error('HarvestReady agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'harvest-ready',
      message: error.message,
    })
  }
})

/**
 * POST /api/agents/storage-scout
 * Invoke StorageScout agent for storage recommendations
 */
router.post('/storage-scout', async (req, res) => {
  try {
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
    console.error('StorageScout agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'storage-scout',
      message: error.message,
    })
  }
})

/**
 * POST /api/agents/supply-match
 * Invoke SupplyMatch agent for farmer-processor matching
 */
router.post('/supply-match', async (req, res) => {
  try {
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
    console.error('SupplyMatch agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'supply-match',
      message: error.message,
    })
  }
})

/**
 * POST /api/agents/water-wise
 * Invoke WaterWise agent for water optimization
 */
router.post('/water-wise', async (req, res) => {
  try {
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
    console.error('WaterWise agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'water-wise',
      message: error.message,
    })
  }
})

/**
 * POST /api/agents/quality-hub
 * Invoke QualityHub agent for quality assessment
 */
router.post('/quality-hub', async (req, res) => {
  try {
    const { farmerId, cropType, imageS3Uri } = req.body

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
    })

    res.json(result)
  } catch (error) {
    console.error('QualityHub agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'quality-hub',
      message: error.message,
    })
  }
})

/**
 * POST /api/agents/collective-voice
 * Invoke CollectiveVoice agent for farmer aggregation
 */
router.post('/collective-voice', async (req, res) => {
  try {
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
    console.error('CollectiveVoice agent error:', error)
    res.status(500).json({
      status: 'error',
      agent: 'collective-voice',
      message: error.message,
    })
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
        test: true
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

export default router
