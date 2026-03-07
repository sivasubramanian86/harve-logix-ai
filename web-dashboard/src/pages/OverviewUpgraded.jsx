import React, { useEffect, useState } from 'react';
import {
  Users,
  Factory,
  Leaf,
  TrendingUp,
  Droplets,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import WowFeatures from '../components/WowFeatures';
import RagStatus from '../components/RagStatus';
import dataService from '../services/dataService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OverviewUpgraded() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!metrics) return;
    setExporting(true);
    
    // Simulate generation delay for premium feel
    setTimeout(() => {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(33, 150, 243); // Info color
      doc.text("HarveLogix Intelligence Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`System Environment: ${metrics.source.toUpperCase()}`, 14, 36);
      
      const tableData = [
        ["Farmers Onboarded", metrics.farmersOnboarded.toLocaleString()],
        ["Processors Connected", metrics.processorsConnected.toLocaleString()],
        ["Waste Reduction", `Rs ${(metrics.wasteReductionRupees / 1000000).toFixed(1)}M`],
        ["Income Uplift", `Rs ${metrics.incomeUpliftPerAcre} / acre`],
        ["Water Saved", `${(metrics.waterSavedLitres / 1000000).toFixed(1)}M Litres`],
        ["RAG Knowledge Base", metrics.ragStatus],
        ["MCP Agents", metrics.mcpStatus]
      ];

      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value/Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] }, // Success green
        styles: { fontSize: 11, cellPadding: 5 }
      });
      
      doc.save(`HarveLogix_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      setExporting(false);
    }, 1200);
  };

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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
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
      className="p-8 space-y-8 min-h-full transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Dynamic Background Element */}
      <div 
        className="fixed top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-success) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 pb-6 border-b border-primary/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-success">
                System Live
              </span>
            </div>
            <div className="w-[1px] h-3 bg-primary/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Viksit Bharat 2047
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 flex flex-col sm:flex-row sm:items-baseline gap-2">
            <span style={{ color: 'var(--text-secondary)' }} className="opacity-90">
              {getWelcomeMessage()},
            </span>
            <span style={{ 
              background: 'linear-gradient(90deg, var(--color-success), var(--color-info))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }} className="font-extrabold italic drop-shadow-sm">
              HarveLogix Dashboard
            </span>
          </h1>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="h-[2px] w-8 bg-gradient-to-r from-success-500 to-transparent rounded-full" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">
              Next-Gen Agricultural Intelligence
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            {metrics && <DataBadge mode={metrics.source} timestamp={metrics.timestamp} />}
            <button 
              onClick={handleExport}
              disabled={exporting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border bg-white/5 border-white/10 backdrop-blur-md shadow-xl hover:bg-white/10 active:bg-white/20 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                boxShadow: '0 10px 30px -10px var(--card-shadow)'
              }}
            >
              {exporting ? 'Exporting...' : 'Export Report'} <ArrowRight size={14} className={exporting ? 'animate-ping' : 'opacity-50'} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[10px] uppercase font-bold tracking-tighter opacity-40">
            {t('common.lastUpdated')}: {metrics?.timestamp?.toLocaleString()}
          </p>
        </div>
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
        className="p-6 rounded-xl border relative overflow-hidden transition-all duration-300 hover:shadow-xl group"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(var(--card-bg-rgb), 0.8)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-info" style={{ color: 'var(--color-info)' }} />
            {t('overview.stateBreakdown')}
          </h2>
          <span className="text-xs font-medium px-3 py-1 rounded-full border bg-opacity-10" style={{ 
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-primary)' 
          }}>
            Real-time Updates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-wider text-[10px]">{t('overview.state')}</th>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-wider text-[10px]">{t('overview.farmers')}</th>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-wider text-[10px]">{t('overview.processors')}</th>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-wider text-[10px]">{t('overview.waste')}</th>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-wider text-[10px]">{t('overview.income')}</th>
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
                  className="transition-all duration-200 hover:translate-x-1 group/row"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <td className="py-4 px-4 font-bold rounded-l-lg border-y border-l border-transparent group-hover/row:border-primary" style={{ borderColor: 'var(--border-primary)' }}>
                    {row.state}
                  </td>
                  <td className="py-4 px-4 border-y border-transparent" style={{ borderColor: 'var(--border-primary)' }}>
                    {row.farmers.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 border-y border-transparent" style={{ borderColor: 'var(--border-primary)' }}>
                    {row.processors}
                  </td>
                  <td className="py-4 px-4 border-y border-transparent font-medium" style={{ color: 'var(--color-success)', borderColor: 'var(--border-primary)' }}>
                    {row.waste}
                  </td>
                  <td className="py-4 px-4 rounded-r-lg border-y border-r border-transparent font-medium" style={{ color: 'var(--color-success)', borderColor: 'var(--border-primary)' }}>
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
        className="p-6 rounded-xl border relative overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-primary)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="text-warning" style={{ color: 'var(--color-warning)' }} />
            {t('overview.todayActivity')}
          </h2>
          <button className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-info)' }}>
            View Full Audit Trail
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              time: '14:32',
              farmer: 'Rajesh Kumar',
              action: 'Harvest recommendation accepted',
              outcome: 'positive',
              icon: Leaf,
              agent: 'HarvestAgent'
            },
            {
              time: '13:15',
              farmer: 'Priya Singh',
              action: 'Pest control alert issued',
              outcome: 'positive',
              icon: AlertTriangle,
              agent: 'ProtectorAgent'
            },
            {
              time: '12:48',
              farmer: 'Arjun Patel',
              action: 'Water optimization suggestion',
              outcome: 'neutral',
              icon: Droplets,
              agent: 'HydroAgent'
            },
            {
              time: '11:22',
              farmer: 'Meera Desai',
              action: 'Storage risk warning',
              outcome: 'positive',
              icon: Factory,
              agent: 'LogisticsAgent'
            },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-opacity-70 group"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderLeft: `4px solid ${activity.outcome === 'positive' ? 'var(--color-success)' : 'var(--color-warning)'}`,
              }}
            >
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <activity.icon 
                  size={18} 
                  style={{ 
                    color: activity.outcome === 'positive' ? 'var(--color-success)' : 'var(--color-warning)'
                  }} 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{activity.farmer}</p>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-primary font-bold" style={{ 
                      color: 'var(--text-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}>
                      {activity.agent}
                    </span>
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {activity.time}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG/MCP status summary - Moved to Bottom */}
      {metrics && (
        <div className="pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <Database size={18} style={{ color: 'var(--text-tertiary)' }} />
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
              Core Systems & Knowledge Graph Status
            </h3>
          </div>
          <RagStatus rag={metrics.ragStatus} mcp={metrics.mcpStatus} />
        </div>
      )}
    </div>
  );
}
