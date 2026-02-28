import React from 'react';
import { useI18n } from '../context/I18nProvider';

export default function DataBadge({ mode = 'live', timestamp }) {
  const { t } = useI18n();

  const isDemo = mode === 'demo';
  const bgColor = isDemo ? 'bg-yellow-100' : 'bg-green-100';
  const textColor = isDemo ? 'text-yellow-800' : 'text-green-800';
  const borderColor = isDemo ? 'border-yellow-300' : 'border-green-300';

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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${bgColor} ${borderColor} ${textColor} text-xs font-medium`}
    >
      <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-yellow-600' : 'bg-green-600'}`}></span>
      <span>{isDemo ? t('common.demoData') : t('common.liveData')}</span>
      {timestamp && (
        <>
          <span className="opacity-50">•</span>
          <span className="opacity-75">{formatTime(timestamp)}</span>
        </>
      )}
    </div>
  );
}
