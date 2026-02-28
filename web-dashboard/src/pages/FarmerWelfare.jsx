import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import axios from '../config/axios'

export default function FarmerWelfare() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWelfareData()
  }, [])

  const fetchWelfareData = async () => {
    try {
      const response = await axios.get('/api/welfare')
      setData(response.data)
    } catch (error) {
      setData(getMockWelfareData())
    } finally {
      setLoading(false)
    }
  }

  const getMockWelfareData = () => ({
    incomeDistribution: [
      { range: '₹0-50K', farmers: 8500, percentage: 18.8 },
      { range: '₹50-100K', farmers: 12300, percentage: 27.2 },
      { range: '₹100-150K', farmers: 15600, percentage: 34.5 },
      { range: '₹150K+', farmers: 8830, percentage: 19.5 },
    ],
    incomeGrowthByRegion: [
      { region: 'Karnataka', growth: 32.5 },
      { region: 'Maharashtra', growth: 28.3 },
      { region: 'Tamil Nadu', growth: 25.8 },
      { region: 'Telangana', growth: 22.1 },
      { region: 'Andhra Pradesh', growth: 19.7 },
    ],
    schemeEligibility: [
      { scheme: 'PM-KISAN', eligible: 38500, enrolled: 32100 },
      { scheme: 'Crop Insurance', eligible: 42100, enrolled: 28900 },
      { scheme: 'Soil Health Card', eligible: 35200, enrolled: 24500 },
      { scheme: 'Subsidy Schemes', eligible: 28900, enrolled: 18700 },
    ]
  })

  if (loading || !data) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Farmer Welfare</h1>
        <p className="text-gray-600 mt-2">Income distribution and welfare scheme enrollment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Income Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.incomeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="farmers" fill="#10b981" name="Farmers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Growth by Region */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Income Growth by Region (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.incomeGrowthByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="region" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="growth" fill="#059669" name="Growth %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scheme Enrollment */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Government Scheme Enrollment</h2>
        <div className="space-y-4">
          {data.schemeEligibility.map((scheme, idx) => {
            const enrollmentRate = (scheme.enrolled / scheme.eligible * 100).toFixed(1)
            return (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{scheme.scheme}</span>
                  <span className="text-sm text-gray-600">{enrollmentRate}% enrolled</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${enrollmentRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{scheme.enrolled.toLocaleString()} enrolled</span>
                  <span>{scheme.eligible.toLocaleString()} eligible</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
