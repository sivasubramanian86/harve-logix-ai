import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Truck, Package, AlertCircle } from 'lucide-react'
import axios from 'axios'

export default function SupplyChain() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplyData()
  }, [])

  const fetchSupplyData = async () => {
    try {
      const response = await axios.get('/api/supply-chain')
      setData(response.data)
    } catch (error) {
      setData(getMockSupplyData())
    } finally {
      setLoading(false)
    }
  }

  const getMockSupplyData = () => ({
    processorUtilization: [
      { processor: 'FreshMart', utilization: 85, capacity: 1000 },
      { processor: 'AgroTrade', utilization: 72, capacity: 800 },
      { processor: 'GreenLogix', utilization: 68, capacity: 900 },
      { processor: 'FarmConnect', utilization: 91, capacity: 1200 },
      { processor: 'HarvestHub', utilization: 55, capacity: 600 },
    ],
    supplyMatches: [
      { date: 'Mon', matches: 245, successful: 198 },
      { date: 'Tue', matches: 312, successful: 267 },
      { date: 'Wed', matches: 289, successful: 241 },
      { date: 'Thu', matches: 401, successful: 356 },
      { date: 'Fri', matches: 378, successful: 334 },
      { date: 'Sat', matches: 456, successful: 412 },
      { date: 'Sun', matches: 234, successful: 198 },
    ],
    directConnections: 12450,
    middlemanEliminated: 3120,
    avgDeliveryTime: '2.3 days',
    wasteInTransit: '3.2%'
  })

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Supply Chain</h1>
        <p className="text-gray-600 mt-2">Farmer-processor connections and logistics optimization</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Truck}
          label="Direct Connections"
          value={data.directConnections.toLocaleString()}
          color="bg-blue-500"
        />
        <KPICard
          icon={Package}
          label="Middlemen Eliminated"
          value={data.middlemanEliminated.toLocaleString()}
          color="bg-green-500"
        />
        <KPICard
          icon={AlertCircle}
          label="Avg Delivery Time"
          value={data.avgDeliveryTime}
          color="bg-yellow-500"
        />
        <KPICard
          icon={Package}
          label="Waste in Transit"
          value={data.wasteInTransit}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processor Utilization */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Processor Utilization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.processorUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="processor" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="utilization" fill="#10b981" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supply Matches */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Weekly Supply Matches</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.supplyMatches}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="matches" fill="#059669" name="Total Matches" />
              <Bar dataKey="successful" fill="#10b981" name="Successful" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Processor Details */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Processor Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Processor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Utilization</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Capacity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.processorUtilization.map((proc, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{proc.processor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${proc.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{proc.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{proc.capacity} units</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      proc.utilization > 80 ? 'bg-red-100 text-red-800' :
                      proc.utilization > 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {proc.utilization > 80 ? 'High' : proc.utilization > 60 ? 'Medium' : 'Low'}
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

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className={`${color} text-white rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-50" />
      </div>
    </div>
  )
}
