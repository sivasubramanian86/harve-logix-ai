import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  color = 'primary',
  unit = '',
}) {
  const { t } = useI18n();

  const getTrendIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (changeType === 'negative') {
      return <TrendingDown size={16} className="text-red-500" />;
    }
    return <Minus size={16} className="text-gray-500" />;
  };

  const getTrendColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`p-6 rounded-lg border ${getColorClass()} transition-all hover:shadow-md`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {unit && (
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Icon size={24} style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
    </div>
  );
}
