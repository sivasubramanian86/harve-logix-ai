import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import DataBadge from '../components/DataBadge';
import dataService from '../services/dataService';

export default function GovernmentViewUpgraded() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await dataService.getGovernmentMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch government metrics:', err);
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

  const getTrendBadge = (direction) => {
    if (direction === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp size={16} />
          <span className="text-xs font-medium">{t('governmentView.improving')}</span>
        </div>
      );
    } else if (direction === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown size={16} />
          <span className="text-xs font-medium">{t('governmentView.declining')}</span>
        </div>
      );
    }
    return <span className="text-xs font-medium text-gray-600">Stable</span>;
  };

  const ChartCard = ({ title, data, dataKey, color }) => (
    <div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-primary)"
          />
          <XAxis
            dataKey="state"
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
            formatter={(value) => {
              if (value > 1000000) {
                return `₹${(value / 1000000).toFixed(1)}M`;
              } else if (value > 1000) {
                return `₹${(value / 1000).toFixed(1)}K`;
              }
              return value.toLocaleString();
            }}
          />
          <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Trend Badges */}
      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <span className="text-sm font-medium">{item.state}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.trend > 0 ? '+' : ''}{item.trend}%</span>
              {getTrendBadge(item.direction)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold mb-2">{t('governmentView.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('common.lastUpdated')}: {metrics?.timestamp?.toLocaleString()}
          </p>
        </div>
        {metrics && <DataBadge mode={metrics.source} timestamp={metrics.timestamp} />}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('governmentView.wasteReductionByState')}
          data={metrics?.wasteReductionByState || []}
          dataKey="value"
          color="var(--color-success)"
        />
        <ChartCard
          title={t('governmentView.incomeUpliftByState')}
          data={metrics?.incomeUpliftByState || []}
          dataKey="value"
          color="var(--color-info)"
        />
        <ChartCard
          title={t('governmentView.adoptionRateByState')}
          data={metrics?.adoptionByState || []}
          dataKey="value"
          color="var(--color-warning)"
        />
        <ChartCard
          title={t('governmentView.waterSavingsByState')}
          data={metrics?.waterSavingsByState || []}
          dataKey="value"
          color="var(--color-info)"
        />
      </div>

      {/* Summary Statistics */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">{t('governmentView.summary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: t('governmentView.totalWaste'),
              value: `₹${(
                (metrics?.wasteReductionByState || []).reduce(
                  (sum, item) => sum + item.value,
                  0
                ) / 1000000
              ).toFixed(1)}M`,
            },
            {
              label: t('governmentView.avgIncome'),
              value: `₹${Math.round(
                (metrics?.incomeUpliftByState || []).reduce(
                  (sum, item) => sum + item.value,
                  0
                ) / (metrics?.incomeUpliftByState?.length || 1)
              )}`,
            },
            {
              label: t('governmentView.avgAdoption'),
              value: `${Math.round(
                (metrics?.adoptionByState || []).reduce(
                  (sum, item) => sum + item.value,
                  0
                ) / (metrics?.adoptionByState?.length || 1)
              )}%`,
            },
            {
              label: t('governmentView.totalWater'),
              value: `${(
                (metrics?.waterSavingsByState || []).reduce(
                  (sum, item) => sum + item.value,
                  0
                ) / 1000000
              ).toFixed(1)}M L`,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
