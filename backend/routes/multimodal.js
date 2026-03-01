/**
 * Multimodal API Routes
 * Handles image, audio, and video analysis endpoints
 */

import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import multimodalService from '../services/multimodalService.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'audio/wav',
      'audio/ogg',
      'audio/mpeg',
      'video/mp4',
      'video/webm',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`))
    }
  },
})

/**
 * POST /api/multimodal/crop-health
 * Analyze crop health from image
 */
router.post('/crop-health', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const result = await multimodalService.analyzeCropHealth(req.file)
    res.json(result)
  } catch (error) {
    console.error('Crop health analysis error:', error)
    res.status(500).json({ message: error.message || 'Analysis failed' })
  }
})

/**
 * POST /api/multimodal/field-irrigation
 * Analyze field irrigation from image
 */
router.post('/field-irrigation', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const result = await multimodalService.analyzeFieldIrrigation(req.file)
    res.json(result)
  } catch (error) {
    console.error('Field irrigation analysis error:', error)
    res.status(500).json({ message: error.message || 'Analysis failed' })
  }
})

/**
 * POST /api/multimodal/sky-weather
 * Analyze sky and weather from image
 */
router.post('/sky-weather', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const result = await multimodalService.analyzeSkyWeather(req.file)
    res.json(result)
  } catch (error) {
    console.error('Sky weather analysis error:', error)
    res.status(500).json({ message: error.message || 'Analysis failed' })
  }
})

/**
 * POST /api/multimodal/voice-query
 * Process voice query from audio
 */
router.post('/voice-query', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' })
    }

    const result = await multimodalService.processVoiceQuery(req.file)
    res.json(result)
  } catch (error) {
    console.error('Voice query processing error:', error)
    res.status(500).json({ message: error.message || 'Processing failed' })
  }
})

/**
 * POST /api/multimodal/video-scan
 * Analyze video scan
 */
router.post('/video-scan', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' })
    }

    const result = await multimodalService.analyzeVideoScan(req.file)
    res.json(result)
  } catch (error) {
    console.error('Video scan analysis error:', error)
    res.status(500).json({ message: error.message || 'Analysis failed' })
  }
})

/**
 * GET /api/multimodal/scans/:farmerId
 * Get recent scans for a farmer
 */
router.get('/scans/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params
    const { limit = 5 } = req.query

    const scans = await multimodalService.getRecentScans(farmerId, parseInt(limit))
    res.json(scans)
  } catch (error) {
    console.error('Get scans error:', error)
    res.status(500).json({ message: error.message || 'Failed to retrieve scans' })
  }
})

/**
 * GET /api/multimodal/scan/:scanId
 * Get scan details
 */
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params

    const scan = await multimodalService.getScanDetails(scanId)
    res.json(scan)
  } catch (error) {
    console.error('Get scan details error:', error)
    res.status(500).json({ message: error.message || 'Failed to retrieve scan' })
  }
})

export default router
