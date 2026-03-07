import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  Users,
  Leaf,
  Droplet,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import dataService from '../services/dataService'
import { Card, CardHeader, CardBody, MetricCard, StatusBadge } from '../components/Card'

/**
 * Overview Page
 * Hero dashboard with KPIs, regional metrics, and agent activity timeline
 */
export default function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const overviewData = await dataService.getOverviewMetrics();
      
      setData({
        farmers: overviewData.farmersOnboarded,
        processors: overviewData.processorsConnected,
        wasteReduced: overviewData.wasteReductionRupees,
        incomeUplift: overviewData.incomeUpliftPerAcre,
        waterSaved: overviewData.waterSavedLitres,
        incomeGrowth: getMockData().incomeGrowth, // Not fully wired in backend
        regionMetrics: getMockData().regionMetrics, // Not fully wired in backend
        agentActivity: getMockData().agentActivity, // Not fully wired in backend
        source: overviewData.source
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  const getMockData = () => ({
    farmers: 45230,
    processors: 5120,
    wasteReduced: 2340000,
    incomeUplift: 18500,
    waterSaved: 12500000,
    incomeGrowth: [
      { month: 'Jan', income: 1200000 },
      { month: 'Feb', income: 1450000 },
      { month: 'Mar', income: 1680000 },
      { month: 'Apr', income: 1920000 },
      { month: 'May', income: 2150000 },
      { month: 'Jun', income: 2340000 },
    ],
    regionMetrics: [
      { state: 'Karnataka', farmers: 8500, income: 450000, waste: 28 },
      { state: 'Maharashtra', farmers: 7200, income: 380000, waste: 26 },
      { state: 'Tamil Nadu', farmers: 6800, income: 360000, waste: 30 },
      { state: 'Telangana', farmers: 5900, income: 310000, waste: 25 },
      { state: 'Andhra Pradesh', farmers: 5200, income: 275000, waste: 29 },
    ],
    agentActivity: [
      { time: '09:15 AM', agent: 'HarvestReady', action: 'Analyzed 245 farms', status: 'healthy' },
      { time: '09:32 AM', agent: 'SupplyMatch', action: 'Matched 89 transactions', status: 'healthy' },
      { time: '09:48 AM', agent: 'QualityHub', action: 'Certified 34 batches', status: 'healthy' },
      { time: '10:05 AM', agent: 'StorageScout', action: 'Optimized 156 storage units', status: 'healthy' },
      { time: '10:22 AM', agent: 'WaterWise', action: 'Saved 45,000 liters', status: 'healthy' },
      { time: '10:39 AM', agent: 'CollectiveVoice', action: 'Formed 12 collectives', status: 'healthy' },
    ],
  })

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-neutral-900">Overview</h1>
          {data.source === 'live' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div> Live Data</span>
          ) : (
             <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">Demo Data</span>
          )}
        </div>
        <p className="text-neutral-600 mt-2">Real-time insights into HarveLogix AI platform performance</p>
      </div>

      {/* Hero KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Users}
          label="Farmers Onboarded"
          value={data.farmers.toLocaleString()}
          change="+12.5%"
          changeType="positive"
          color="primary"
        />
        <MetricCard
          icon={Leaf}
          label="Processors Connected"
          value={data.processors.toLocaleString()}
          change="+8.2%"
          changeType="positive"
          color="secondary"
        />
        <MetricCard
          icon={TrendingUp}
          label="Waste Reduced"
          value={`₹${(data.wasteReduced / 1000000).toFixed(1)}M`}
          change="+28.5%"
          changeType="positive"
          color="accent"
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Income Uplift"
          value={`₹${data.incomeUplift.toLocaleString()}/acre`}
          change="+18.3%"
          changeType="positive"
          color="success"
        />
        <MetricCard
          icon={Droplet}
          label="Water Saved"
          value={`${(data.waterSaved / 1000000).toFixed(1)}M L`}
          change="+35.7%"
          changeType="positive"
          color="info"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Regional Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Regional Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-primary-500" />
                <h2 className="text-lg font-bold text-neutral-900">Top States</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {data.regionMetrics.map((region, idx) => (
                <div key={idx} className="pb-4 border-b border-neutral-200 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900">{region.state}</h3>
                    <span className="text-xs font-semibold text-neutral-600">{region.farmers.toLocaleString()} farmers</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Income: ₹{(region.income / 1000).toFixed(0)}K</span>
                    <span className="text-warning font-medium">{region.waste}% waste</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-gradient-secondary h-2 rounded-full"
                      style={{ width: `${(region.farmers / 9000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Charts & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income Growth Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-neutral-900">Income Growth Trend</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.incomeGrowth}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2457A7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2457A7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#2457A7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Agent Activity Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-accent-500" />
                <h2 className="text-lg font-bold text-neutral-900">Today's Agent Activity</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {data.agentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-3 border-b border-neutral-200 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0 pt-1">
                      <StatusBadge status={activity.status} label="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-neutral-900 text-sm">{activity.agent}</p>
                        <span className="text-xs text-neutral-500 flex-shrink-0">{activity.time}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
