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

  const getColorStyle = () => {
    switch (color) {
      case 'success':
        return { color: 'var(--color-success)', background: 'rgba(var(--color-success-rgb, 76, 175, 80), 0.1)' };
      case 'warning':
        return { color: 'var(--color-warning)', background: 'rgba(var(--color-warning-rgb, 255, 152, 0), 0.1)' };
      case 'error':
        return { color: 'var(--color-error)', background: 'rgba(var(--color-error-rgb, 244, 67, 54), 0.1)' };
      case 'info':
        return { color: 'var(--color-info)', background: 'rgba(var(--color-info-rgb, 33, 150, 243), 0.1)' };
      default:
        return { color: 'var(--color-info)', background: 'rgba(var(--color-info-rgb, 33, 150, 243), 0.1)' };
    }
  };

  return (
    <div
      className="p-5 rounded-2xl border transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 relative overflow-hidden group border-white/5 active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Dynamic Glow Effect */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 opacity-10 group-hover:opacity-20 transition-all duration-700 blur-3xl pointer-events-none"
        style={{
          background: getColorStyle().color,
        }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-50"
          >
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black tracking-tighter">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {unit && (
              <span
                className="text-xs font-bold opacity-40 uppercase tracking-widest"
              >
                {unit}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div 
            className="p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg bg-white/5 border border-white/10" 
            style={{ 
              color: getColorStyle().color,
              boxShadow: `0 10px 20px -5px ${getColorStyle().color}20`
            }}
          >
            <Icon size={22} className="drop-shadow-md" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-5 flex items-center gap-2 relative z-10">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-opacity-10 ${getTrendColor().replace('text-', 'bg-')} border border-current border-opacity-10`}>
            {getTrendIcon()}
            <span className={`text-[10px] font-bold ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">vs last month</span>
        </div>
      )}
      
      {/* Bottom Accent Line */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700"
        style={{ backgroundColor: getColorStyle().color }}
      />
    </div>
  );
}
