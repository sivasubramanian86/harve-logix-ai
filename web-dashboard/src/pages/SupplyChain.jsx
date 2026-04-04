import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Truck, Package, AlertCircle } from 'lucide-react'
import axios from '../config/axios'

export default function SupplyChain() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplyData()
  }, [])

  const fetchSupplyData = async () => {
    try {
      const response = await axios.get('/agents/supply-chain')
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

  if (loading || !data) return <div className="p-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div>
        <h1 className="text-3xl font-bold">Supply Chain</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Farmer-processor connections and logistics optimization</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Truck}
          label="Direct Connections"
          value={(data?.directConnections || getMockSupplyData().directConnections).toLocaleString()}
          color="var(--color-info)"
        />
        <KPICard
          icon={Package}
          label="Middlemen Eliminated"
          value={(data?.middlemanEliminated || getMockSupplyData().middlemanEliminated).toLocaleString()}
          color="var(--color-success)"
        />
        <KPICard
          icon={AlertCircle}
          label="Avg Delivery Time"
          value={data?.avgDeliveryTime || getMockSupplyData().avgDeliveryTime}
          color="var(--color-warning)"
        />
        <KPICard
          icon={Package}
          label="Waste in Transit"
          value={data?.wasteInTransit || getMockSupplyData().wasteInTransit}
          color="var(--color-error)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processor Utilization */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Processor Utilization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.processorUtilization?.length > 0 ? data.processorUtilization : getMockSupplyData().processorUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="processor" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => `${value}%`} 
              />
              <Legend />
              <Bar dataKey="utilization" fill="var(--color-success)" name="Utilization %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supply Matches */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Supply Matches</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.supplyMatches?.length > 0 ? data.supplyMatches : getMockSupplyData().supplyMatches}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend />
              <Bar dataKey="matches" fill="var(--color-info)" name="Total Matches" radius={[4, 4, 0, 0]} />
              <Bar dataKey="successful" fill="var(--color-success)" name="Successful" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Processor Details */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
        <h2 className="text-xl font-bold mb-4">Processor Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Processor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Utilization</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Capacity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.processorUtilization?.length > 0 ? data.processorUtilization : getMockSupplyData().processorUtilization).map((proc, idx) => (
                <tr key={idx} className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <td className="px-6 py-4 font-medium">{proc.processor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-opacity-20 rounded-full h-2" style={{ backgroundColor: 'var(--text-secondary)' }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${proc.utilization}%`,
                            backgroundColor: proc.utilization > 80 ? 'var(--color-error)' : proc.utilization > 60 ? 'var(--color-warning)' : 'var(--color-success)'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm">{proc.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{proc.capacity} units</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ 
                      backgroundColor: proc.utilization > 80 ? 'rgba(239, 68, 68, 0.15)' : proc.utilization > 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: proc.utilization > 80 ? 'var(--color-error)' : proc.utilization > 60 ? 'var(--color-warning)' : 'var(--color-success)',
                      border: `1px solid ${proc.utilization > 80 ? 'var(--color-error)' : proc.utilization > 60 ? 'var(--color-warning)' : 'var(--color-success)'}`
                    }}>
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
    <div className="rounded-2xl p-6 shadow-xl relative overflow-hidden group border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-opacity-10 group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: color, color: color }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
