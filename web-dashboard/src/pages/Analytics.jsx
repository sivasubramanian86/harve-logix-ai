import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics')
      setData(response.data)
    } catch (error) {
      setData(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalytics = () => ({
    agentPerformance: [
      { agent: 'HarvestReady', accuracy: 94.2, usage: 8500 },
      { agent: 'StorageScout', accuracy: 91.8, usage: 5100 },
      { agent: 'SupplyMatch', accuracy: 96.5, usage: 6200 },
      { agent: 'WaterWise', accuracy: 88.3, usage: 3200 },
      { agent: 'QualityHub', accuracy: 95.2, usage: 4300 },
      { agent: 'CollectiveVoice', accuracy: 89.7, usage: 2100 },
    ],
    monthlyTrends: [
      { month: 'Jan', farmers: 8200, income: 1200000, waste: 35.2 },
      { month: 'Feb', farmers: 15400, income: 1450000, waste: 32.8 },
      { month: 'Mar', farmers: 22100, income: 1680000, waste: 30.5 },
      { month: 'Apr', farmers: 31200, income: 1920000, waste: 29.1 },
      { month: 'May', farmers: 38500, income: 2150000, waste: 27.8 },
      { month: 'Jun', farmers: 45230, income: 2340000, waste: 26.2 },
    ],
    agentAccuracy: [
      { month: 'Week 1', accuracy: 88.5 },
      { month: 'Week 2', accuracy: 90.2 },
      { month: 'Week 3', accuracy: 91.8 },
      { month: 'Week 4', accuracy: 93.1 },
      { month: 'Week 5', accuracy: 94.2 },
      { month: 'Week 6', accuracy: 95.1 },
    ]
  })

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-2">Agent performance and platform trends</p>
      </div>

      {/* Monthly Trends */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Platform Growth Trends</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.monthlyTrends}>
            <defs>
              <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="farmers" stroke="#10b981" fillOpacity={1} fill="url(#colorFarmers)" name="Active Farmers" />
            <Line yAxisId="right" type="monotone" dataKey="waste" stroke="#ef4444" name="Waste Reduction %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Accuracy Trend */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Agent Accuracy Improvement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.agentAccuracy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[85, 96]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income Trend */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Monthly Income Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} name="Total Income" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Agent Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Agent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Accuracy</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Usage Count</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.agentPerformance.map((agent, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{agent.agent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${agent.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{agent.accuracy}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{agent.usage.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
