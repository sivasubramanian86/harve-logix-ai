import React, { useState } from 'react'
import { ChevronDown, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useI18n } from '../../context/I18nProvider'

export default function ScanResultsDisplay({ results, scanType }) {
  const { t } = useI18n()
  const [expandedIssue, setExpandedIssue] = useState(null)

  if (!results) {
    return null
  }

  const getStatusIcon = (status) => {
    const s = status?.toUpperCase()
    switch (s) {
      case 'HEALTHY':
      case 'OPTIMAL':
        return <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
      case 'AT_RISK':
      case 'UNDER_WATERED':
      case 'OVER_WATERED':
        return <AlertTriangle size={24} style={{ color: 'var(--color-warning)' }} />
      case 'DISEASED':
      case 'WATERLOGGING':
        return <AlertCircle size={24} style={{ color: 'var(--color-error)' }} />
      default:
        return <CheckCircle size={24} style={{ color: 'var(--color-info)' }} />
    }
  }

  const getStatusColor = (status) => {
    const s = status?.toUpperCase()
    switch (s) {
      case 'HEALTHY':
      case 'OPTIMAL':
        return 'var(--color-success)'
      case 'AT_RISK':
      case 'UNDER_WATERED':
      case 'OVER_WATERED':
        return 'var(--color-warning)'
      case 'DISEASED':
      case 'WATERLOGGING':
        return 'var(--color-error)'
      default:
        return 'var(--color-info)'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'extreme':
        return 'var(--color-error)'
      case 'medium':
      case 'moderate':
        return 'var(--color-warning)'
      case 'low':
      case 'stable':
        return 'var(--color-success)'
      default:
        return 'var(--color-info)'
    }
  }

  // Unwrap data if nested
  const data = results.data || results

  return (
    <div className="space-y-4">
      {/* Voice Query Response */}
      {scanType === 'voice-query' && data.transcript && (
        <>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h4 className="font-semibold mb-3">🎤 {t('multimodal.transcript')}</h4>
            <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
              "{data.transcript}"
            </p>
            {data.confidence_score && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Confidence: {Math.round(data.confidence_score * 100)}%
              </p>
            )}
          </div>
          <div
            className="p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--color-success)',
            }}
          >
            <h4 className="font-semibold mb-3">💬 {t('multimodal.response')}</h4>
            <p style={{ color: 'var(--text-primary)' }}>{data.response}</p>
          </div>
        </>
      )}

      {/* Status Header */}
      {scanType !== 'voice-query' && (
        <div
          className="p-6 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: getStatusColor(data.health_status || data.irrigation_status || data.sky_description || data.risk_level),
          }}
        >
          <div className="flex items-start gap-4">
            <div>{getStatusIcon(data.health_status || data.irrigation_status || data.risk_level)}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 capitalize">
                {String(data.health_status || data.irrigation_status || data.risk_level || t('multimodal.analysisComplete')).replace(/_/g, ' ')}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {data.explanation || data.sky_description || data.harvest_window_advice || data.aggregated_insights?.[0]}
              </p>
              {data.processing_time_ms && (
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-2">
                  ⏱️ {t('multimodal.processingTime')}: {(data.processing_time_ms / 1000).toFixed(2)}s
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detected Issues */}
      {data.detected_issues && data.detected_issues.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">{t('multimodal.detectedIssues')}</h4>
          <div className="space-y-2">
            {data.detected_issues.map((issue, idx) => {
              // Handle both string and object formats
              const issueObj = typeof issue === 'string'
                ? { type: issue, severity: 'medium', description: '' }
                : issue;

              return (
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
                        <span className="font-medium">{issueObj.type}</span>
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: getUrgencyColor(issueObj.severity || issueObj.urgency || 'medium'),
                            color: 'white',
                          }}
                        >
                          {issueObj.severity || issueObj.urgency || 'medium'}
                        </span>
                        {issueObj.confidence && (
                          <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
                            {Math.round(issueObj.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {issueObj.description && (
                         <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                           {issueObj.description}
                         </p>
                      )}
                    </div>
                    {issueObj.description && (
                      <ChevronDown
                        size={18}
                        style={{
                          transform: expandedIssue === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          color: 'var(--text-secondary)',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {(data.recommended_actions || data.recommendations) && (data.recommended_actions || data.recommendations).length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">{t('multimodal.recommendedActions')}</h4>
          <div className="space-y-3">
            {(data.recommended_actions || data.recommendations).map((action, idx) => {
              // Handle both string and object formats
              const actionObj = typeof action === 'string' 
                ? { action: action, details: '', urgency: 'medium' }
                : action;
                
              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: getUrgencyColor(actionObj.urgency || actionObj.severity || 'medium'),
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold">{actionObj.action}</h5>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: getUrgencyColor(actionObj.urgency || actionObj.severity || 'medium'),
                        color: 'white',
                      }}
                    >
                      {actionObj.urgency || actionObj.severity || 'medium'}
                    </span>
                  </div>
                  {actionObj.details && (
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
                      {actionObj.details}
                    </p>
                  )}
                  {actionObj.estimated_cost_rupees && (
                    <p style={{ color: 'var(--color-info)' }} className="text-xs font-medium">
                      💰 {t('multimodal.estimatedCost')}: ₹{actionObj.estimated_cost_rupees}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Water Saving Recommendations */}
      {data.water_saving_recommendations && data.water_saving_recommendations.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">💧 {t('multimodal.waterSavingTips')}</h4>
          <ul className="space-y-2">
            {data.water_saving_recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span style={{ color: 'var(--color-info)' }}>✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Forecast Summary */}
      {data.forecast_summary && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h4 className="font-semibold mb-3">🌤️ {t('multimodal.weatherForecast')}</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.forecast_summary.rainfall_probability && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.rainfallProbability')}
                </p>
                <p className="text-2xl font-bold">{data.forecast_summary.rainfall_probability}%</p>
              </div>
            )}
            {data.forecast_summary.temperature_celsius && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.temperature')}
                </p>
                <p className="text-2xl font-bold">{data.forecast_summary.temperature_celsius}°C</p>
              </div>
            )}
            {data.forecast_summary.wind_speed_kmh && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.windSpeed')}
                </p>
                <p className="text-2xl font-bold">{data.forecast_summary.wind_speed_kmh} km/h</p>
              </div>
            )}
            {data.forecast_summary.rainfall_mm && (
              <div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {t('multimodal.expectedRainfall')}
                </p>
                <p className="text-2xl font-bold">{data.forecast_summary.rainfall_mm} mm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Level */}
      {data.risk_level && (
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: getStatusColor(data.risk_level),
          }}
        >
          <p className="text-sm font-semibold">
            {t('multimodal.riskLevel')}: <span style={{ color: getStatusColor(data.risk_level) }}>{data.risk_level}</span>
          </p>
        </div>
      )}

      {/* Metadata */}
      {data.timestamp && (
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
          {t('multimodal.analyzedAt')}: {new Date(data.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  )
}
