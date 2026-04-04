import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import DataBadge from '../components/DataBadge';
import dataService from '../services/dataService';

export default function SystemHealthUpgraded() {
  const { t } = useI18n();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchHealth = async () => {
    try {
      const data = await dataService.getSystemHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div
        className="p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ color: 'var(--color-error)' }}>{t('common.error')}: {error}</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 'healthy') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{t('systemHealth.healthy')}</span>
        </div>
      );
    } else if (status === 'degraded') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{t('systemHealth.degraded')}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{t('systemHealth.critical')}</span>
        </div>
      );
    }
  };

  const getMetricStatus = (metric, value, threshold) => {
    if (value > threshold) {
      return 'critical';
    } else if (value > threshold * 0.7) {
      return 'warning';
    }
    return 'healthy';
  };

  const latencyStatus = getMetricStatus('latency', health?.agentLatency || 0, 500);
  const errorStatus = getMetricStatus('error', health?.errorRate || 0, 5);

  const MetricCard = ({ icon: Icon, label, value, unit, status, threshold }) => {
    const getStatusColor = () => {
      if (status === 'healthy') return 'bg-green-50 border-green-200';
      if (status === 'warning') return 'bg-yellow-50 border-yellow-200';
      return 'bg-red-50 border-red-200';
    };

    const getStatusIcon = () => {
      if (status === 'healthy') return <CheckCircle size={20} className="text-green-600" />;
      if (status === 'warning') return <AlertCircle size={20} className="text-yellow-600" />;
      return <AlertCircle size={20} className="text-red-600" />;
    };

    return (
      <div
        className={`p-6 rounded-lg border ${getStatusColor()}`}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <Icon size={24} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </p>
              <p className="text-2xl font-bold mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
                <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                  {unit}
                </span>
              </p>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {threshold && (
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Threshold: {threshold}{unit}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="p-8 space-y-8"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('systemHealth.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('common.lastUpdated')}: {health?.lastUpdated?.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {health && <DataBadge mode={health.source} timestamp={health.lastUpdated} />}
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={16} />
            <span>Auto-refresh: 30s</span>
          </div>
        </div>
      </div>

      {/* Overall System Status */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">Overall System Status</h2>
            <div style={{ color: 'var(--text-secondary)' }}>
              {health?.eventBridgeStatus === 'healthy' ? (
                'All systems operational'
              ) : (
                <div className="space-y-1">
                  <p className="text-yellow-600 font-semibold">Issues detected in following agents:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {health?.failingAgents?.map(agent => (
                      <span key={agent} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded border border-red-200 uppercase font-bold">
                        {agent.replace('-', ' ')}
                      </span>
                    )) || <span>Analyzing specific faults...</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
          {health && getStatusBadge(health.eventBridgeStatus)}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Activity}
          label={t('systemHealth.agentLatency')}
          value={health?.agentLatency || 0}
          unit={t('systemHealth.ms')}
          status={latencyStatus}
          threshold={500}
        />
        <MetricCard
          icon={AlertCircle}
          label={t('systemHealth.errorRate')}
          value={health?.errorRate || 0}
          unit={t('systemHealth.percent')}
          status={errorStatus}
          threshold={5}
        />
        <MetricCard
          icon={Activity}
          label={t('systemHealth.bedrockCallVolume')}
          value={health?.bedrockCallVolume || 0}
          unit="calls"
          status="healthy"
        />
        <MetricCard
          icon={CheckCircle}
          label={t('systemHealth.eventBridgeStatus')}
          value={health?.eventBridgeStatus || 'unknown'}
          unit=""
          status={health?.eventBridgeStatus === 'healthy' ? 'healthy' : 'warning'}
        />
      </div>

      {/* Detailed Metrics */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Detailed Metrics</h2>
        <div className="space-y-4">
          {[
            {
              name: 'Agent Latency',
              value: `${health?.agentLatency || 0}ms`,
              status: latencyStatus,
              description: 'Average response time for AI agent decisions',
            },
            {
              name: 'Error Rate',
              value: `${health?.errorRate || 0}%`,
              status: errorStatus,
              description: 'Percentage of failed API calls',
            },
            {
              name: 'Bedrock API Calls',
              value: `${health?.bedrockCallVolume || 0}`,
              status: 'healthy',
              description: 'Number of calls to Bedrock AI service',
            },
            {
              name: 'EventBridge Status',
              value: health?.eventBridgeStatus || 'unknown',
              status: health?.eventBridgeStatus === 'healthy' ? 'healthy' : 'warning',
              description: 'Status of event routing infrastructure',
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div>
                <p className="font-semibold">{metric.name}</p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {metric.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold">{metric.value}</p>
                {metric.status === 'healthy' && (
                  <CheckCircle size={20} className="text-green-600" />
                )}
                {metric.status === 'warning' && (
                  <AlertCircle size={20} className="text-yellow-600" />
                )}
                {metric.status === 'critical' && (
                  <AlertCircle size={20} className="text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(latencyStatus !== 'healthy' || errorStatus !== 'healthy') && (
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <div className="flex items-start gap-4">
            <AlertCircle size={24} style={{ color: 'var(--color-warning)' }} />
            <div>
              <h3 className="font-bold mb-2">Active Alerts</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {latencyStatus !== 'healthy' && (
                  <li>
                    • Agent latency is{' '}
                    {latencyStatus === 'critical' ? 'critically' : 'moderately'} high
                  </li>
                )}
                {errorStatus !== 'healthy' && (
                  <li>
                    • Error rate is{' '}
                    {errorStatus === 'critical' ? 'critically' : 'moderately'} elevated
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
