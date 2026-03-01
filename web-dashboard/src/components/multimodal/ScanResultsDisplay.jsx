import React, { useState } from 'react'
import { ChevronDown, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useI18n } from '../../context/I18nProvider'

export default function ScanResultsDisplay({ results, isLoading, error, onRetry }) {
  const { t } = useI18n()
  const [expandedIssue, setExpandedIssue] = useState(null)

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="inline-block">
          <div
            className="w-8 h-8 border-4 border-transparent rounded-full animate-spin"
            style={{ borderTopColor: 'var(--color-info)' }}
          />
        </div>
        <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
          {t('multimodal.analyzing')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-lg border-l-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--color-error)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
          <div className="flex-1">
            <p className="font-semibold" style={{ color: 'var(--color-error)' }}>
              {t('multimodal.analysisError')}
            </p>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'white',
                }}
              >
                {t('multimodal.retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
      case 'AT_RISK':
        return <AlertTriangle size={24} style={{ color: 'var(--color-warning)' }} />
      case 'DISEASED':
        return <AlertCircle size={24} style={{ color: 'var(--color-error)' }} />
      default:
        return <CheckCircle size={24} style={{ color: 'var(--color-info)' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'var(--color-success)'
      case 'AT_RISK':
        return 'var(--color-warning)'
      case 'DISEASED':
        return 'var(--color-error)'
      default:
        return 'var(--color-info)'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'var(--color-error)'
      case 'medium':
        return 'var(--color-warning)'
      case 'low':
        return 'var(--color-success)'
      default:
        return 'var(--color-info)'
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div
        className="p-6 rounded-lg border-l-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: getStatusColor(results.health_status || results.irrigation_status || results.sky_description),
        }}
      >
        <div className="flex items-start gap-4">
          <div>{getStatusIcon(results.health_status || results.irrigation_status)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">
              {results.health_status || results.irrigation_status || t('multimodal.analysisComplete')}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {results.explanation || results.sky_description || results.harvest_window_advice}
            </p>
            {results.processing_time_ms && (
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-2">
                ⏱️ {t('multimodal.processingTime')}: {(results.processing_time_ms / 1000).toFixed(2)}s
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detected Issues */}
      {results.detected_issues && results.detected_issues.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">{t('multimodal.detectedIssues')}</h4>
          <div className="space-y-2">
            {results.detected_issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
                onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{issue.type}</span>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: getUrgencyColor(issue.severity),
                          color: 'white',
                        }}
                      >
                        {issue.severity}
                      </span>
                      {issue.confidence && (
                        <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
                          {Math.round(issue.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                      {issue.description}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: expandedIssue === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {results.recommended_actions && results.recommended_actions.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">{t('multimodal.recommendedActions')}</h4>
          <div className="space-y-3">
            {results.recommended_actions.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: getUrgencyColor(action.urgency),
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold">{action.action}</h5>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: getUrgencyColor(action.urgency),
                      color: 'white',
                    }}
                  >
                    {action.urgency}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
                  {action.details}
                </p>
                {action.estimated_cost_rupees && (
                  <p style={{ color: 'var(--color-info)' }} className="text-xs font-medium">
                    💰 {t('multimodal.estimatedCost')}: ₹{action.estimated_cost_rupees}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water Saving Recommendations */}
      {results.water_saving_recommendations && results.water_saving_recommendations.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">💧 {t('multimodal.waterSavingTips')}</h4>
          <ul className="space-y-2">
            {results.water_saving_recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span style={{ color: 'var(--color-info)' }}>✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Forecast Summary */}
      {results.forecast_summary && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">🌤️ {t('multimodal.weatherForecast')}</h4>
          <div className="grid grid-cols-2 gap-4">
            {results.forecast_summary.rainfall_probability && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.rainfallProbability')}
                </p>
                <p className="text-2xl font-bold">{results.forecast_summary.rainfall_probability}%</p>
              </div>
            )}
            {results.forecast_summary.temperature_celsius && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.temperature')}
                </p>
                <p className="text-2xl font-bold">{results.forecast_summary.temperature_celsius}°C</p>
              </div>
            )}
            {results.forecast_summary.wind_speed_kmh && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.windSpeed')}
                </p>
                <p className="text-2xl font-bold">{results.forecast_summary.wind_speed_kmh} km/h</p>
              </div>
            )}
            {results.forecast_summary.rainfall_mm && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.expectedRainfall')}
                </p>
                <p className="text-2xl font-bold">{results.forecast_summary.rainfall_mm} mm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Level */}
      {results.risk_level && (
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: getStatusColor(results.risk_level),
          }}
        >
          <p className="text-sm font-semibold">
            {t('multimodal.riskLevel')}: <span style={{ color: getStatusColor(results.risk_level) }}>{results.risk_level}</span>
          </p>
        </div>
      )}

      {/* Metadata */}
      {results.timestamp && (
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
          {t('multimodal.analyzedAt')}: {new Date(results.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  )
}
