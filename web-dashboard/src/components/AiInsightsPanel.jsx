import React, { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function AiInsightsPanel({ insights = [], recommendations = [], wowFeatures = [], isLoading = false }) {
  const { t } = useI18n();
  const [expandedInsight, setExpandedInsight] = useState(null);

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type) => {
    const icons = {
      crop_protection: '🌾',
      weather: '⛅',
      storage: '📦',
      supply: '🚚',
      water: '💧',
      quality: '⭐',
    };
    return icons[type] || '💡';
  };

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* AI Insights Section */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} style={{ color: 'var(--color-info)' }} />
          <h3 className="text-lg font-semibold">{t('aiInsights.title')}</h3>
        </div>

        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                onClick={() =>
                  setExpandedInsight(expandedInsight === idx ? null : idx)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getInsightIcon(insight.type)}</span>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
                          insight.confidence
                        )}`}
                      >
                        {t(`aiInsights.confidence`)}: {t(`aiInsights.${insight.confidence}`)}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {insight.description}
                    </p>
                    {insight.impact && expandedInsight === idx && (
                      <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-success)' }}>
                        💰 {insight.impact}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    style={{
                      transform:
                        expandedInsight === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>{t('common.noData')}</p>
          )}
        </div>
      </div>

      {/* Actionable Recommendations Section */}
      {((recommendations && recommendations.length > 0) || (insights && insights.length > 0)) && (
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--color-primary)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
              <Lightbulb size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Actionable Recommendations</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Precision insights from Nova LLM Reasoning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="p-5 rounded-xl border-l-4 transition-all hover:translate-y-[-2px]"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{rec.action}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(var(--color-success-rgb), 0.1)', color: 'var(--color-success)' }}>Impact</span>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{rec.impact}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(var(--color-info-rgb), 0.1)', color: 'var(--color-info)' }}>Timeline</span>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{rec.timeline}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center col-span-2 p-6 rounded-xl border border-dashed" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>No specific actionable recommendations available for this profile yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WOW Features Section */}
      {wowFeatures.length > 0 && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h3 className="text-lg font-semibold mb-4">{t('wowFeatures.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wowFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--color-warning)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {feature.metric}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {typeof feature.value === 'number'
                        ? feature.value.toLocaleString()
                        : feature.value}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {feature.unit}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {feature.trend === 'up' ? '📈' : feature.trend === 'down' ? '📉' : '➡️'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
