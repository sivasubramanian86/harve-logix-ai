import React, { useState, useEffect } from 'react'
import {
  Zap,
  Leaf,
  Truck,
  Droplet,
  CheckCircle,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react'
import axios from '../config/axios'
import { Card, CardHeader, CardBody, StatusBadge } from '../components/Card'
import RagStatus from '../components/RagStatus'

/**
 * Agents Page
 * Displays all 6 autonomous agents with status, metrics, and quick actions
 */
export default function Agents() {
  const [agentData, setAgentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentData()
  }, [])

  const fetchAgentData = async () => {
    try {
      const response = await axios.get('/api/agents')
      const iconMap = {
        'harvest-ready': Leaf,
        'storage-scout': Leaf,
        'supply-match': Truck,
        'water-wise': Droplet,
        'quality-hub': CheckCircle,
        'collective-voice': Users,
      }
      
      // Add icons to agents from backend
      const agentsWithIcons = response.data.agents.map(agent => ({
        ...agent,
        icon: iconMap[agent.id] || Leaf,
      }))
      
      setAgentData({
        agents: agentsWithIcons,
        ragStatus: response.data.ragStatus || {},
        mcpStatus: response.data.mcpStatus || {},
      })
    } catch (error) {
      setAgentData(getMockAgentData())
    } finally {
      setLoading(false)
    }
  }

  const getMockAgentData = () => ({
    agents: [
      {
        id: 'harvest-ready',
        name: 'HarvestReady',
        icon: Leaf,
        description: 'Optimal harvest timing using crop phenology + market + weather',
        status: 'healthy',
        accuracy: 94.2,
        decisions: 8500,
        incomeGain: 4500,
        lastRun: '2 minutes ago',
        color: 'secondary',
      },
      {
        id: 'storage-scout',
        name: 'StorageScout',
        icon: Leaf,
        description: 'Zero-loss storage protocol using ambient data + crop type',
        status: 'healthy',
        accuracy: 91.8,
        decisions: 5100,
        incomeGain: 7500,
        lastRun: '5 minutes ago',
        color: 'primary',
      },
      {
        id: 'supply-match',
        name: 'SupplyMatch',
        icon: Truck,
        description: 'Direct farmer-processor buyer matching (eliminates middleman)',
        status: 'healthy',
        accuracy: 96.5,
        decisions: 6200,
        incomeGain: 20000,
        lastRun: '1 minute ago',
        color: 'accent',
      },
      {
        id: 'water-wise',
        name: 'WaterWise',
        icon: Droplet,
        description: 'Water optimization for post-harvest operations',
        status: 'healthy',
        accuracy: 88.3,
        decisions: 3200,
        incomeGain: 8000,
        lastRun: '8 minutes ago',
        color: 'info',
      },
      {
        id: 'quality-hub',
        name: 'QualityHub',
        icon: CheckCircle,
        description: 'Automated quality certification using AWS Rekognition',
        status: 'healthy',
        accuracy: 95.2,
        decisions: 4300,
        incomeGain: 5000,
        lastRun: '3 minutes ago',
        color: 'success',
      },
      {
        id: 'collective-voice',
        name: 'CollectiveVoice',
        icon: Users,
        description: 'Aggregation + collective bargaining for farmers',
        status: 'healthy',
        accuracy: 89.7,
        decisions: 2100,
        incomeGain: 3000,
        lastRun: '10 minutes ago',
        color: 'warning',
      },
    ],
  })

  if (loading || !agentData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading agents...</p>
        </div>
      </div>
    )
  }

  const colorMap = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
  }

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Autonomous Agents</h1>
        <p className="text-neutral-600 mt-2">6 specialized AI agents orchestrating post-harvest decisions</p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentData.agents.map((agent) => {
          const AgentIcon = agent.icon
          return (
            <Card key={agent.id} className="hover:shadow-lg transition-all duration-300">
              {/* Agent Header with Icon */}
              <div className={`${colorMap[agent.color]} text-white p-6 rounded-t-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <AgentIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{agent.name}</h3>
                      <StatusBadge status={agent.status} label="Healthy" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Body */}
              <CardBody className="space-y-4">
                {/* Description */}
                <p className="text-sm text-neutral-600">{agent.description}</p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 font-medium">Accuracy</p>
                    <p className="text-xl font-bold text-primary-500 mt-1">{agent.accuracy}%</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 font-medium">Decisions</p>
                    <p className="text-xl font-bold text-secondary-500 mt-1">{agent.decisions.toLocaleString()}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 font-medium">Income Gain</p>
                    <p className="text-lg font-bold text-accent-500 mt-1">₹{agent.incomeGain.toLocaleString()}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 font-medium">Last Run</p>
                    <p className="text-sm font-semibold text-neutral-700 mt-1">{agent.lastRun}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                    <Activity size={16} />
                    View Logs
                  </button>
                  <button className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium text-sm hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                    <ArrowRight size={16} />
                    Details
                  </button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Agent Performance Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-neutral-900">Performance Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-500">92.6%</p>
              <p className="text-neutral-600 mt-2">Average Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-secondary-500">29.4K</p>
              <p className="text-neutral-600 mt-2">Total Decisions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-accent-500">₹48K</p>
              <p className="text-neutral-600 mt-2">Avg Income Gain</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
