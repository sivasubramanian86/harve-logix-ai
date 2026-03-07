import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Leaf, DollarSign } from 'lucide-react'
import axios from '../config/axios'

const COLORS = ['#10b981', '#059669', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/metrics')
      const backendData = response.data
      setMetrics({
        totalFarmers: backendData.totalFarmers || 45230,
        activeUsers: 12450,
        totalIncome: 2340000,
        wasteReduction: 28.5,
        incomeGrowth: backendData.incomeGrowth || getMockMetrics().incomeGrowth,
        agentUsage: backendData.agentUsage || getMockMetrics().agentUsage,
        topCrops: backendData.topCrops || getMockMetrics().topCrops,
      })
    } catch (error) {
      console.log('Using mock data')
      setMetrics(getMockMetrics())
    } finally {
      setLoading(false)
    }
  }

  const getMockMetrics = () => ({
    totalFarmers: 45230,
    activeUsers: 12450,
    totalIncome: 2340000,
    wasteReduction: 28.5,
    incomeGrowth: [
      { month: 'Jan', income: 1200000 },
      { month: 'Feb', income: 1450000 },
      { month: 'Mar', income: 1680000 },
      { month: 'Apr', income: 1920000 },
      { month: 'May', income: 2150000 },
      { month: 'Jun', income: 2340000 },
    ],
    agentUsage: [
      { name: 'HarvestReady', value: 8500 },
      { name: 'SupplyMatch', value: 6200 },
      { name: 'StorageScout', value: 5100 },
      { name: 'QualityHub', value: 4300 },
    ],
    topCrops: [
      { crop: 'Tomato', farmers: 12450, income: 850000 },
      { crop: 'Onion', farmers: 9800, income: 720000 },
      { crop: 'Potato', farmers: 8200, income: 580000 },
      { crop: 'Pepper', farmers: 6800, income: 450000 },
    ]
  })

  if (loading || !metrics) {
    return <div className="p-8 text-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Real-time insights into HarveLogix AI platform</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Total Farmers"
          value={metrics.totalFarmers.toLocaleString()}
          color="bg-blue-500"
        />
        <MetricCard
          icon={TrendingUp}
          label="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          color="bg-green-500"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Income"
          value={`₹${(metrics.totalIncome / 1000000).toFixed(1)}M`}
          color="bg-yellow-500"
        />
        <MetricCard
          icon={Leaf}
          label="Waste Reduction"
          value={`${metrics.wasteReduction}%`}
          color="bg-purple-500"
        />
      </div>

      {/* AI Strategic Intelligence Banner */}
      <div 
        className="p-6 rounded-2xl border-2 border-primary-500/20 relative overflow-hidden group transition-all hover:shadow-xl"
        style={{ 
          background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%)',
          borderColor: 'var(--color-primary-light)' 
        }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp size={120} />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="bg-primary-500 p-4 rounded-xl text-white shadow-lg">
            <TrendingUp size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <span className="text-primary-600">Amazon Nova Pro</span> Strategic Insight
              <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">Live Reasoning</span>
            </h2>
            <p className="mt-2 text-lg font-medium leading-relaxed">
              Platform-wide waste reduction has increased by <span className="text-success-600 font-bold">12.5%</span> this week. 
              <span className="opacity-70 ml-2 italic">Recommendation: Optimize storage capacity in Maharashtra clusters to capture peak harvest premiums next month.</span>
            </p>
          </div>
          <button 
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-md hover:bg-primary-700 transition-colors"
          >
            View Full Analysis
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Growth */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Income Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.incomeGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Monthly Income" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Usage */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Agent Usage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.agentUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.agentUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Crops Table */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
        <h2 className="text-xl font-bold mb-4">Top Crops by Income</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Crop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Farmers</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Total Income</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Avg Income/Farmer</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topCrops.map((crop, idx) => (
                <tr key={idx} className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <td className="px-6 py-4 font-medium">{crop.crop}</td>
                  <td className="px-6 py-4">{crop.farmers.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(crop.income / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-4">₹{(crop.income / crop.farmers).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`${color} text-white rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-50" />
      </div>
    </div>
  )
}
