import React from 'react';
import { Zap } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function WowFeatures({ features = [] }) {
  const { t } = useI18n();

  const getFeatureIcon = (metric) => {
    const icons = {
      wasteReduction: '♻️',
      incomeUplift: '💰',
      waterSaved: '💧',
      processorMatches: '🤝',
    };
    return icons[metric] || '⭐';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <div
      className="p-6 rounded-lg border-2"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--color-warning)',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Zap size={24} style={{ color: 'var(--color-warning)' }} />
        <h2 className="text-2xl font-bold">{t('wowFeatures.title')}</h2>
        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full ml-auto" style={{ fontSize: '11px' }}>
          Powered by RAG + AI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.length > 0 ? (
          features.map((feature, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--color-warning)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{getFeatureIcon(feature.metric)}</span>
                <span className="text-2xl">{getTrendIcon(feature.trend)}</span>
              </div>

              <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {feature.metric}
              </p>

              <p className="text-2xl font-bold mb-1">
                {typeof feature.value === 'number'
                  ? feature.value.toLocaleString()
                  : feature.value}
              </p>

              <p
                className="text-xs mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {feature.unit}
              </p>

              {feature.description && (
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-success)' }}
                >
                  {feature.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>{t('common.noData')}</p>
        )}
      </div>
    </div>
  );
}
