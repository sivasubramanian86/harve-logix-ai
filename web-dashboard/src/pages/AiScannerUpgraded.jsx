import React, { useState, useEffect } from 'react'
import {
  Leaf,
  Droplet,
  Cloud,
  Mic,
  Video,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import axios from '../config/axios'
import { useI18n } from '../context/I18nProvider'
import { Card, CardHeader, CardBody } from '../components/Card'
import ImageCapture from '../components/multimodal/ImageCapture'
import AudioCapture from '../components/multimodal/AudioCapture'
import VideoCapture from '../components/multimodal/VideoCapture'
import ScanResultsDisplay from '../components/multimodal/ScanResultsDisplay'

/**
 * AI Scanner Page - Multimodal Analysis
 * Provides 5 scan types: Crop Health, Field Irrigation, Sky & Weather, Voice Query, Video Scan
 * Supports demo and live modes via environment variable
 */
export default function AiScannerUpgraded() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('crop-health')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [useDemo, setUseDemo] = useState(import.meta.env.VITE_USE_DEMO_DATA === 'true')

  const scanTypes = [
    {
      id: 'crop-health',
      name: t('multimodal.cropHealthScan'),
      icon: Leaf,
      color: 'primary',
      description: 'Analyze crop health from image',
      component: ImageCapture,
    },
    {
      id: 'field-irrigation',
      name: t('multimodal.fieldIrrigationScan'),
      icon: Droplet,
      color: 'info',
      description: 'Assess irrigation status',
      component: ImageCapture,
    },
    {
      id: 'sky-weather',
      name: t('multimodal.skyWeatherScan'),
      icon: Cloud,
      color: 'warning',
      description: 'Analyze sky and weather conditions',
      component: ImageCapture,
    },
    {
      id: 'voice-query',
      name: t('multimodal.voiceAssistant'),
      icon: Mic,
      color: 'secondary',
      description: 'Ask questions via voice',
      component: AudioCapture,
    },
    {
      id: 'video-scan',
      name: t('multimodal.videoScan'),
      icon: Video,
      color: 'accent',
      description: 'Analyze video footage',
      component: VideoCapture,
    },
  ]

  const currentScan = scanTypes.find((s) => s.id === activeTab)
  const CaptureComponent = currentScan?.component

  const handleAnalyze = async (media) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('media', media)

      const endpoint = `/api/multimodal/${activeTab}`
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setResults(null)
    setError(null)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{t('multimodal.aiScanner')}</h1>
        <p className="text-neutral-600 mt-2">
          Multimodal AI analysis for crop health, irrigation, weather, and voice queries
        </p>
      </div>

      {/* Demo/Live Mode Toggle */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useDemo}
            onChange={(e) => setUseDemo(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300"
          />
          <span className="text-sm font-medium text-neutral-700">
            {useDemo ? t('common.demoData') : t('common.liveData')}
          </span>
        </label>
      </div>

      {/* Scan Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {scanTypes.map((scan) => {
          const Icon = scan.icon
          const isActive = activeTab === scan.id
          return (
            <button
              key={scan.id}
              onClick={() => {
                setActiveTab(scan.id)
                handleClear()
              }}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap
                transition-all duration-200
                ${
                  isActive
                    ? `bg-${scan.color}-500 text-white shadow-lg`
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }
              `}
            >
              <Icon size={18} />
              {scan.name}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Capture Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{currentScan?.name}</h2>
                  <p className="text-sm text-neutral-600 mt-1">{currentScan?.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Capture Component */}
              {CaptureComponent && (
                <CaptureComponent
                  onCapture={handleAnalyze}
                  disabled={loading}
                  scanType={activeTab}
                />
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-neutral-600">{t('multimodal.analyzing')}</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">{t('multimodal.analysisError')}</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Results Display */}
              {results && !loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                    <CheckCircle size={18} />
                    <span className="font-medium">{t('multimodal.analysisComplete')}</span>
                  </div>
                  <ScanResultsDisplay results={results} scanType={activeTab} />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Scan Info Card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-neutral-900">About This Scan</h3>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              {activeTab === 'crop-health' && (
                <>
                  <p className="text-neutral-600">
                    Upload a photo of your crop to get instant health assessment including disease detection and
                    treatment recommendations.
                  </p>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium text-neutral-900 mb-2">What we analyze:</p>
                    <ul className="space-y-1 text-neutral-600">
                      <li>• Leaf color and texture</li>
                      <li>• Disease symptoms</li>
                      <li>• Nutrient deficiencies</li>
                      <li>• Overall plant vigor</li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'field-irrigation' && (
                <>
                  <p className="text-neutral-600">
                    Analyze soil moisture and irrigation status from field images to optimize water usage and prevent
                    waterlogging.
                  </p>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium text-neutral-900 mb-2">What we analyze:</p>
                    <ul className="space-y-1 text-neutral-600">
                      <li>• Soil moisture level</li>
                      <li>• Water stress indicators</li>
                      <li>• Drainage conditions</li>
                      <li>• Irrigation recommendations</li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'sky-weather' && (
                <>
                  <p className="text-neutral-600">
                    Capture sky conditions to get weather forecasts and harvest timing recommendations.
                  </p>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium text-neutral-900 mb-2">What we analyze:</p>
                    <ul className="space-y-1 text-neutral-600">
                      <li>• Cloud cover and type</li>
                      <li>• Weather patterns</li>
                      <li>• Rainfall probability</li>
                      <li>• Harvest window advice</li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'voice-query' && (
                <>
                  <p className="text-neutral-600">
                    Ask questions about your farm in your local language. Get instant answers from our AI agents.
                  </p>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium text-neutral-900 mb-2">Example questions:</p>
                    <ul className="space-y-1 text-neutral-600">
                      <li>• When should I harvest?</li>
                      <li>• How much water do I need?</li>
                      <li>• What's the market price?</li>
                      <li>• Which processor should I contact?</li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'video-scan' && (
                <>
                  <p className="text-neutral-600">
                    Upload field video for comprehensive analysis of crop conditions and field health.
                  </p>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium text-neutral-900 mb-2">Requirements:</p>
                    <ul className="space-y-1 text-neutral-600">
                      <li>• Max 5 minutes duration</li>
                      <li>• Max 100MB file size</li>
                      <li>• MP4 or WebM format</li>
                      <li>• Good lighting recommended</li>
                    </ul>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Recent Scans Card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-neutral-900">{t('multimodal.recentScans')}</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">Crop Health</p>
                    <p className="text-xs text-neutral-600">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplet size={18} className="text-info-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">Irrigation</p>
                    <p className="text-xs text-neutral-600">Yesterday</p>
                  </div>
                </div>

                <button className="w-full text-center py-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All Scans
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
