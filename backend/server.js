import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// Mock data generators
const generateMetrics = () => ({
  totalFarmers: 45230,
  activeUsers: 12450,
  totalIncome: 2340000,
  wasteReduction: 28.5,
  incomeGrowth: [
    { month: 'Jan', income: 1200000 },
    { month: 'Feb', income: 1450000 },
    { month: 'Mar', income: 1680000 },
    { month: 'Apr', income: 1920000 },
    { month: 'May', income: 2150000 },
    { month: 'Jun', income: 2340000 },
  ],
  agentUsage: [
    { name: 'HarvestReady', value: 8500 },
    { name: 'SupplyMatch', value: 6200 },
    { name: 'StorageScout', value: 5100 },
    { name: 'QualityHub', value: 4300 },
  ],
  topCrops: [
    { crop: 'Tomato', farmers: 12450, income: 850000 },
    { crop: 'Onion', farmers: 9800, income: 720000 },
    { crop: 'Potato', farmers: 8200, income: 580000 },
    { crop: 'Pepper', farmers: 6800, income: 450000 },
  ]
})

const generateWelfareData = () => ({
  incomeDistribution: [
    { range: '₹0-50K', farmers: 8500, percentage: 18.8 },
    { range: '₹50-100K', farmers: 12300, percentage: 27.2 },
    { range: '₹100-150K', farmers: 15600, percentage: 34.5 },
    { range: '₹150K+', farmers: 8830, percentage: 19.5 },
  ],
  incomeGrowthByRegion: [
    { region: 'Karnataka', growth: 32.5 },
    { region: 'Maharashtra', growth: 28.3 },
    { region: 'Tamil Nadu', growth: 25.8 },
    { region: 'Telangana', growth: 22.1 },
    { region: 'Andhra Pradesh', growth: 19.7 },
  ],
  schemeEligibility: [
    { scheme: 'PM-KISAN', eligible: 38500, enrolled: 32100 },
    { scheme: 'Crop Insurance', eligible: 42100, enrolled: 28900 },
    { scheme: 'Soil Health Card', eligible: 35200, enrolled: 24500 },
    { scheme: 'Subsidy Schemes', eligible: 28900, enrolled: 18700 },
  ]
})

const generateSupplyData = () => ({
  processorUtilization: [
    { processor: 'FreshMart', utilization: 85, capacity: 1000 },
    { processor: 'AgroTrade', utilization: 72, capacity: 800 },
    { processor: 'GreenLogix', utilization: 68, capacity: 900 },
    { processor: 'FarmConnect', utilization: 91, capacity: 1200 },
    { processor: 'HarvestHub', utilization: 55, capacity: 600 },
  ],
  supplyMatches: [
    { date: 'Mon', matches: 245, successful: 198 },
    { date: 'Tue', matches: 312, successful: 267 },
    { date: 'Wed', matches: 289, successful: 241 },
    { date: 'Thu', matches: 401, successful: 356 },
    { date: 'Fri', matches: 378, successful: 334 },
    { date: 'Sat', matches: 456, successful: 412 },
    { date: 'Sun', matches: 234, successful: 198 },
  ],
  directConnections: 12450,
  middlemanEliminated: 3120,
  avgDeliveryTime: '2.3 days',
  wasteInTransit: '3.2%'
})

const generateAnalytics = () => ({
  agentPerformance: [
    { agent: 'HarvestReady', accuracy: 94.2, usage: 8500 },
    { agent: 'StorageScout', accuracy: 91.8, usage: 5100 },
    { agent: 'SupplyMatch', accuracy: 96.5, usage: 6200 },
    { agent: 'WaterWise', accuracy: 88.3, usage: 3200 },
    { agent: 'QualityHub', accuracy: 95.2, usage: 4300 },
    { agent: 'CollectiveVoice', accuracy: 89.7, usage: 2100 },
  ],
  monthlyTrends: [
    { month: 'Jan', farmers: 8200, income: 1200000, waste: 35.2 },
    { month: 'Feb', farmers: 15400, income: 1450000, waste: 32.8 },
    { month: 'Mar', farmers: 22100, income: 1680000, waste: 30.5 },
    { month: 'Apr', farmers: 31200, income: 1920000, waste: 29.1 },
    { month: 'May', farmers: 38500, income: 2150000, waste: 27.8 },
    { month: 'Jun', farmers: 45230, income: 2340000, waste: 26.2 },
  ],
  agentAccuracy: [
    { month: 'Week 1', accuracy: 88.5 },
    { month: 'Week 2', accuracy: 90.2 },
    { month: 'Week 3', accuracy: 91.8 },
    { month: 'Week 4', accuracy: 93.1 },
    { month: 'Week 5', accuracy: 94.2 },
    { month: 'Week 6', accuracy: 95.1 },
  ]
})

// API Routes
app.get('/metrics', (req, res) => {
  res.json(generateMetrics())
})

app.get('/welfare', (req, res) => {
  res.json(generateWelfareData())
})

app.get('/supply-chain', (req, res) => {
  res.json(generateSupplyData())
})

app.get('/analytics', (req, res) => {
  res.json(generateAnalytics())
})

// Agent endpoints
app.post('/agents/harvest-ready', (req, res) => {
  const { crop_type, current_growth_stage, location } = req.body
  res.json({
    status: 'success',
    output: {
      harvest_date: '2026-02-15',
      harvest_time: '05:00',
      expected_income_gain_rupees: 4500,
      confidence_score: 0.94,
      reasoning: `Optimal harvest timing for ${crop_type} at stage ${current_growth_stage}`
    }
  })
})

app.post('/agents/storage-scout', (req, res) => {
  const { crop_type, storage_duration_days } = req.body
  res.json({
    status: 'success',
    output: {
      storage_method: 'shade_storage',
      temperature_setpoint_celsius: 22,
      humidity_setpoint_percent: 65,
      waste_reduction_percent: 25,
      shelf_life_extension_days: 7
    }
  })
})

app.post('/agents/supply-match', (req, res) => {
  const { crop_type, quantity_kg, quality_grade } = req.body
  res.json({
    status: 'success',
    output: {
      top_3_buyer_matches: [
        {
          processor_id: 'proc-001',
          name: 'FreshMart Cooperative',
          match_score: 92.5,
          price_per_kg: 48,
          direct_connection_link: 'https://harvelogix.app/connect/uuid-123'
        }
      ],
      no_middleman_flag: true,
      estimated_income_rupees: quantity_kg * 48
    }
  })
})

app.post('/agents/water-wise', (req, res) => {
  const { crop_type } = req.body
  res.json({
    status: 'success',
    output: {
      water_optimized_protocol: {
        washing: 'Use drip irrigation and recirculation systems',
        cooling: 'Use evaporative cooling with water recycling'
      },
      water_savings_liters: 700,
      cost_savings_rupees: 1050,
      environmental_impact_co2_kg: 0.35
    }
  })
})

app.post('/agents/quality-hub', (req, res) => {
  const { crop_type, batch_size_kg } = req.body
  res.json({
    status: 'success',
    output: {
      quality_grade: 'A',
      defect_percent: 2.5,
      market_price_premium_percent: 15,
      certification_json: {
        certification_id: 'CERT-20260128143000',
        crop_type: crop_type,
        quality_grade: 'A',
        defect_percentage: 2.5,
        certification_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  })
})

app.post('/agents/collective-voice', (req, res) => {
  const { crop_type, region } = req.body
  res.json({
    status: 'success',
    output: {
      aggregation_proposal: {
        collective_id: 'uuid-123',
        crop_type: crop_type,
        farmer_count: 60,
        bulk_discount_percent: 15
      },
      collective_size: 60,
      expected_discount_percent: 15,
      shared_logistics_plan: {
        transport_plan: 'Shared truck for 60 farmers',
        storage_plan: 'Collective cold storage facility'
      }
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 HarveLogix AI Backend Server`)
  console.log(`📍 Running on http://localhost:${PORT}`)
  console.log(`\n📊 Available endpoints:`)
  console.log(`   GET  /metrics`)
  console.log(`   GET  /welfare`)
  console.log(`   GET  /supply-chain`)
  console.log(`   GET  /analytics`)
  console.log(`   POST /agents/harvest-ready`)
  console.log(`   POST /agents/storage-scout`)
  console.log(`   POST /agents/supply-match`)
  console.log(`   POST /agents/water-wise`)
  console.log(`   POST /agents/quality-hub`)
  console.log(`   POST /agents/collective-voice`)
  console.log(`   GET  /health\n`)
})
