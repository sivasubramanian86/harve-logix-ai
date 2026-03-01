import React from 'react';
import { Database, Clock, Layers } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function RagStatus({ rag = {}, mcp = {} }) {
  const { t } = useI18n();

  return (
    <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="flex items-center mb-3">
        <Database className="mr-2" />
        <h3 className="text-lg font-semibold">{t('ragStatus.title')}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p>{t('ragStatus.docsIndexed')}: <strong>{rag.docsIndexed ?? '—'}</strong></p>
          <p>{t('ragStatus.lastLatency')}: <strong>{rag.lastQueryLatencyMs ?? '—'} ms</strong></p>
          <p>{t('ragStatus.lastSources')}: <strong>{(rag.lastSources || []).join(', ') || '—'}</strong></p>
        </div>
        <div>
          <Clock className="inline mr-1" />
          <p>{t('mcpStatus.activeWorkflows')}: <strong>{mcp.activeWorkflows ?? '—'}</strong></p>
          <p>{t('mcpStatus.pendingTasks')}: <strong>{mcp.pendingTasks ?? '—'}</strong></p>
          <p>{t('mcpStatus.lastEvent')}: <strong>{mcp.lastEvent ?? '—'}</strong></p>
        </div>
      </div>
    </div>
  );
}
