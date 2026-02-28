import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Leaf, DollarSign } from 'lucide-react'
import axios from 'axios'

const COLORS = ['#10b981', '#059669', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/metrics')
      setMetrics(response.data)
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

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time insights into HarveLogix AI platform</p>
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
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Top Crops by Income</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farmers</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Income</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Avg Income/Farmer</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topCrops.map((crop, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
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
