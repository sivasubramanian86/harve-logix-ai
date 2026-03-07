import React from 'react';
import { useI18n } from '../context/I18nProvider';

export default function DataBadge({ mode = 'live', timestamp }) {
  const { t } = useI18n();

  const isDemo = mode === 'demo';
  const colorVar = isDemo ? 'var(--color-warning)' : 'var(--color-success)';

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        color: colorVar,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: colorVar }}></span>
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colorVar }}></span>
      </span>
      <span>{isDemo ? t('common.demoData') : t('common.liveData')}</span>
      {timestamp && (
        <>
          <span className="opacity-30">|</span>
          <span className="opacity-70 font-bold">{formatTime(timestamp)}</span>
        </>
      )}
    </div>
  );
}
