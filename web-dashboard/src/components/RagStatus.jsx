import React from 'react';
import { Database, Clock, Layers, Activity } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function RagStatus({ rag = {}, mcp = {} }) {
  const { t } = useI18n();

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg" 
      style={{ 
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)',
        backdropFilter: 'blur(10px)',
        background: 'rgba(var(--card-bg-rgb), 0.7)',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* RAG Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="relative">
              <Database size={20} className="text-info" style={{ color: 'var(--color-info)' }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
            </div>
            <h3 className="text-md font-bold uppercase tracking-wide">{t('ragStatus.title')}</h3>
          </div>
          <div className="grid gap-3">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{t('ragStatus.docsIndexed')}</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {rag.docsIndexed ?? '—'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{t('ragStatus.lastLatency')}</span>
              <span className="font-bold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                {rag.lastQueryLatencyMs ?? '—'} <span className="text-[10px] font-normal opacity-70">ms</span>
              </span>
            </div>
            <div className="pt-1">
              <p className="text-[10px] uppercase font-bold mb-1 opacity-50 tracking-tighter">{t('ragStatus.lastSources')}</p>
              <div className="flex flex-wrap gap-1">
                {(rag.lastSources || ['Bedrock Knowledge Base', 'Prisma DB', 'Local Metadata']).map((source, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MCP Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="relative">
              <Layers size={20} className="text-warning" style={{ color: 'var(--color-warning)' }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-info animate-pulse" style={{ backgroundColor: 'var(--color-info)' }} />
            </div>
            <h3 className="text-md font-bold uppercase tracking-wide">Workflow & MCP Engine</h3>
          </div>
          <div className="grid gap-3">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{t('mcpStatus.activeWorkflows')}</span>
              <span className="font-bold px-2 py-0.5 rounded bg-secondary flex items-center gap-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-info)' }}>
                <Activity size={12} /> {mcp.activeWorkflows ?? '0'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{t('mcpStatus.pendingTasks')}</span>
              <span className="font-bold">{mcp.pendingTasks ?? '0'}</span>
            </div>
            <div className="pt-1">
              <p className="text-[10px] uppercase font-bold mb-1 opacity-50 tracking-tighter">{t('mcpStatus.lastEvent')}</p>
              <div className="p-2 rounded bg-secondary text-[11px] font-medium italic border-l-2 border-info" style={{ backgroundColor: 'var(--bg-secondary)', borderLeftColor: 'var(--color-info)' }}>
                "{mcp.lastEvent || 'No recent events recorded'}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
