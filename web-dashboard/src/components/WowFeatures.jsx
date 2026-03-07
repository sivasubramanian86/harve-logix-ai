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
      className="p-8 rounded-xl border relative overflow-hidden transition-all duration-500"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px -10px var(--card-shadow)',
      }}
    >
      {/* Background Accent */}
      <div 
        className="absolute bottom-0 right-0 w-48 h-48 opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-warning) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-warning bg-opacity-10" style={{ color: 'var(--color-warning)' }}>
          <Zap size={24} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{t('wowFeatures.title')}</h2>
        <div className="flex items-center gap-2 ml-auto px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
          style={{ 
            color: 'var(--color-success)',
            borderColor: 'var(--color-success)',
            backgroundColor: 'rgba(var(--color-success-rgb), 0.1)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" style={{ backgroundColor: 'var(--color-success)' }} />
          Powered by RAG + AI
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.length > 0 ? (
          features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-5 flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {getFeatureIcon(feature.metric)}
                </div>
                <span className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">{getTrendIcon(feature.trend)}</span>
              </div>

              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {feature.metric}
              </p>

              <p className="text-3xl font-black mb-1 tabular-nums">
                {typeof feature.value === 'number'
                  ? feature.value.toLocaleString()
                  : feature.value}
              </p>

              <p
                className="text-xs font-medium mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                {feature.unit}
              </p>

              {feature.description && (
                <div className="mt-auto pt-4 border-t border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-success)' }}
                  >
                    {feature.description}
                  </p>
                </div>
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
