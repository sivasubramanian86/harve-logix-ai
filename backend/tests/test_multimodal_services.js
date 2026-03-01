/**
 * Unit tests for multimodal services
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import multimodalService from '../services/multimodalService.js'

describe('Multimodal Services', () => {
  describe('analyzeCropHealth', () => {
    it('should return crop health analysis in demo mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      }

      const result = await multimodalService.analyzeCropHealth(mockFile)

      expect(result).toHaveProperty('scan_id')
      expect(result).toHaveProperty('scan_type', 'crop-health')
      expect(result).toHaveProperty('health_status')
      expect(result).toHaveProperty('detected_issues')
      expect(result).toHaveProperty('recommended_actions')
    })
  })

  describe('analyzeFieldIrrigation', () => {
    it('should return irrigation analysis in demo mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      }

      const result = await multimodalService.analyzeFieldIrrigation(mockFile)

      expect(result).toHaveProperty('scan_id')
      expect(result).toHaveProperty('scan_type', 'field-irrigation')
      expect(result).toHaveProperty('irrigation_status')
    })
  })

  describe('analyzeSkyWeather', () => {
    it('should return weather analysis in demo mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      }

      const result = await multimodalService.analyzeSkyWeather(mockFile)

      expect(result).toHaveProperty('scan_id')
      expect(result).toHaveProperty('scan_type', 'sky-weather')
      expect(result).toHaveProperty('sky_description')
    })
  })

  describe('processVoiceQuery', () => {
    it('should return voice query response in demo mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'audio/wav',
        originalname: 'test.wav',
      }

      const result = await multimodalService.processVoiceQuery(mockFile)

      expect(result).toHaveProperty('scan_id')
      expect(result).toHaveProperty('scan_type', 'voice-query')
      expect(result).toHaveProperty('transcript')
      expect(result).toHaveProperty('response')
    })
  })

  describe('analyzeVideoScan', () => {
    it('should return video analysis in demo mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'video/mp4',
        originalname: 'test.mp4',
      }

      const result = await multimodalService.analyzeVideoScan(mockFile)

      expect(result).toHaveProperty('scan_id')
      expect(result).toHaveProperty('scan_type', 'video-scan')
    })
  })
})
