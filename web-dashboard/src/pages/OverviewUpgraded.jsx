import React, { useEffect, useState } from 'react';
import {
  Users,
  Factory,
  Leaf,
  TrendingUp,
  Droplets,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import WowFeatures from '../components/WowFeatures';
import dataService from '../services/dataService';

export default function OverviewUpgraded() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await dataService.getOverviewMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch overview metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
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

  if (error && !metrics) {
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

  const getTrendType = (direction) => {
    if (direction === 'up') return 'positive';
    if (direction === 'down') return 'negative';
    return 'neutral';
  };

  const wowFeatures = metrics
    ? [
        {
          metric: t('wowFeatures.wasteReduction'),
          value: `₹${(metrics.wasteReductionRupees / 1000000).toFixed(1)}M`,
          unit: 'saved',
          trend: 'up',
          description: 'Waste reduction impact',
        },
        {
          metric: t('wowFeatures.incomeUplift'),
          value: `₹${metrics.incomeUpliftPerAcre}`,
          unit: '/acre',
          trend: 'up',
          description: 'Income increase',
        },
        {
          metric: t('wowFeatures.waterSaved'),
          value: `${(metrics.waterSavedLitres / 1000000).toFixed(1)}M`,
          unit: 'litres',
          trend: 'up',
          description: 'Water conservation',
        },
        {
          metric: t('wowFeatures.processorMatches'),
          value: metrics.processorsConnected || 342,
          unit: 'connected',
          trend: 'up',
          description: 'Processor network',
        },
      ]
    : [];

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
          <h1 className="text-3xl font-bold mb-2">{t('overview.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('common.lastUpdated')}: {metrics?.timestamp?.toLocaleString()}
          </p>
        </div>
        {metrics && <DataBadge mode={metrics.source} timestamp={metrics.timestamp} />}
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Users}
          label={t('overview.farmersOnboarded')}
          value={metrics?.farmersOnboarded || 0}
          change={metrics?.trends[0]?.change}
          changeType={getTrendType(metrics?.trends[0]?.direction)}
          color="info"
        />
        <MetricCard
          icon={Factory}
          label={t('overview.processorsConnected')}
          value={metrics?.processorsConnected || 0}
          change={metrics?.trends[1]?.change}
          changeType={getTrendType(metrics?.trends[1]?.direction)}
          color="info"
        />
        <MetricCard
          icon={Leaf}
          label={t('overview.wasteReduction')}
          value={`₹${(metrics?.wasteReductionRupees / 1000000).toFixed(1)}M`}
          change={metrics?.trends[2]?.change}
          changeType={getTrendType(metrics?.trends[2]?.direction)}
          color="success"
        />
        <MetricCard
          icon={TrendingUp}
          label={t('overview.incomeUplift')}
          value={`₹${metrics?.incomeUpliftPerAcre || 0}`}
          unit="/acre"
          change={metrics?.trends[3]?.change}
          changeType={getTrendType(metrics?.trends[3]?.direction)}
          color="success"
        />
        <MetricCard
          icon={Droplets}
          label={t('overview.waterSaved')}
          value={`${(metrics?.waterSavedLitres / 1000000).toFixed(1)}M`}
          unit="L"
          change={metrics?.trends[4]?.change}
          changeType={getTrendType(metrics?.trends[4]?.direction)}
          color="info"
        />
      </div>

      {/* WOW Features */}
      <WowFeatures features={wowFeatures} />

      {/* State Breakdown Table */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">{t('overview.stateBreakdown')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border-primary)' }} className="border-b">
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('overview.state')}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('overview.farmers')}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('overview.processors')}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('overview.waste')}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('overview.income')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { state: 'Punjab', farmers: 3200, processors: 85, waste: '₹2.5M', income: '₹3500' },
                { state: 'Maharashtra', farmers: 2800, processors: 72, waste: '₹1.8M', income: '₹2800' },
                { state: 'Gujarat', farmers: 2400, processors: 65, waste: '₹1.2M', income: '₹2200' },
                { state: 'Karnataka', farmers: 2100, processors: 58, waste: '₹950K', income: '₹1900' },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottomColor: 'var(--border-primary)',
                    backgroundColor: idx % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                  }}
                  className="border-b hover:bg-opacity-50"
                >
                  <td className="py-3 px-4 font-medium">{row.state}</td>
                  <td className="py-3 px-4">{row.farmers.toLocaleString()}</td>
                  <td className="py-3 px-4">{row.processors}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--color-success)' }}>
                    {row.waste}
                  </td>
                  <td className="py-3 px-4" style={{ color: 'var(--color-success)' }}>
                    {row.income}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Agent Activity Timeline */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">{t('overview.todayActivity')}</h2>
        <div className="space-y-4">
          {[
            {
              time: '14:32',
              farmer: 'Rajesh Kumar',
              action: 'Harvest recommendation accepted',
              outcome: 'positive',
            },
            {
              time: '13:15',
              farmer: 'Priya Singh',
              action: 'Pest control alert issued',
              outcome: 'positive',
            },
            {
              time: '12:48',
              farmer: 'Arjun Patel',
              action: 'Water optimization suggestion',
              outcome: 'neutral',
            },
            {
              time: '11:22',
              farmer: 'Meera Desai',
              action: 'Storage risk warning',
              outcome: 'positive',
            },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderLeftColor: 'var(--color-info)',
                borderLeftWidth: '4px',
              }}
            >
              <div className="flex-shrink-0 pt-1">
                <CheckCircle
                  size={20}
                  style={{
                    color:
                      activity.outcome === 'positive'
                        ? 'var(--color-success)'
                        : 'var(--color-warning)',
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{activity.farmer}</p>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {activity.time}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
