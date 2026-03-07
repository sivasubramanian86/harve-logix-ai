import React from 'react'
import { X, Cpu, Database, Network, Clock, ShieldCheck, Activity } from 'lucide-react'

const AGENT_CONFIGS = {
  'harvest-ready': {
    capabilities: ['Phenology Analysis', 'Weather Forecasting', 'Market Price Matching'],
    tools: ['IMD_Weather_API', 'Crop_Phenology_Vector_DB', 'APMC_Market_REST'],
    model: 'Amazon Bedrock Nova Pro',
    contextWindow: '128K Tokens',
    latency: '142ms'
  },
  'storage-scout': {
    capabilities: ['IoT Telemetry Analysis', 'Predictive Spoilage', 'Ventilation Routing'],
    tools: ['AWS_IoT_Core', 'Storage_Best_Practices_RAG', 'HVAC_Actuator_API'],
    model: 'Amazon Bedrock Nova Lite',
    contextWindow: '16K Tokens',
    latency: '85ms'
  },
  'supply-match': {
    capabilities: ['Multi-Agent Negotiation', 'Quality Verification', 'Smart Contracts'],
    tools: ['Processor_Bidding_API', 'Hyperledger_Fabric', 'Logistics_Router'],
    model: 'Amazon Bedrock Nova Pro',
    contextWindow: '128K Tokens',
    latency: '210ms'
  },
  'water-wise': {
    capabilities: ['Evapotranspiration Math', 'Satellite Moisture Analysis', 'Pump Control'],
    tools: ['ISRO_Satellite_DB', 'Soil_Sensors_IoT', 'Irrigation_Actuator'],
    model: 'Amazon Bedrock Nova Lite',
    contextWindow: '16K Tokens',
    latency: '95ms'
  },
  'quality-hub': {
    capabilities: ['Hyperspectral Image Vision', 'Defect Scanning', 'Blockchain Certification'],
    tools: ['AWS_Rekognition', 'Quality_Standards_RAG', 'Ethereum_SmartContract'],
    model: 'Amazon Bedrock Claude 3.5 Sonnet',
    contextWindow: '200K Tokens',
    latency: '850ms'
  },
  'collective-voice': {
    capabilities: ['Geospatial Grouping', 'Volume Aggregation', 'Freight Negotiation'],
    tools: ['PostGIS_DB', 'Fleet_Logistics_API', 'Smart_Pricing_Engine'],
    model: 'Amazon Bedrock Nova Pro',
    contextWindow: '128K Tokens',
    latency: '310ms'
  }
}

export default function AgentDetailsModal({ isOpen, onClose, agentId, agentName }) {
  if (!isOpen || !agentId) return null

  const config = AGENT_CONFIGS[agentId] || AGENT_CONFIGS['harvest-ready']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary-500 border-b border-primary-600">
          <div className="flex items-center gap-3">
            <Cpu size={24} className="text-white" />
            <div>
              <h3 className="text-white font-bold text-lg">{agentName} Configuration</h3>
              <p className="text-primary-100 text-sm">Model Context Protocol (MCP) Node</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-primary-100 hover:text-white transition-colors p-1 rounded-md hover:bg-primary-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Hardware & Model */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">
              <Activity size={16} className="text-primary-500"/> Foundation Model
            </h4>
            <div className="bg-neutral-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-neutral-100">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Inference Engine</p>
                <p className="font-semibold text-neutral-900">{config.model}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Avg Latency</p>
                <p className="font-semibold text-neutral-900 flex items-center gap-1">
                  <Clock size={12} className="text-success"/> {config.latency}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-neutral-500 mb-1">Context Window</p>
                <p className="font-semibold text-neutral-900">{config.contextWindow}</p>
              </div>
            </div>
          </div>

          {/* Core Capabilities */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">
              <ShieldCheck size={16} className="text-primary-500"/> Core Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {config.capabilities.map((cap, i) => (
                <span key={i} className="px-3 py-1 bg-secondary-50 text-secondary-700 text-sm rounded-full border border-secondary-100 font-medium">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* RAG & MCP Tools */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">
              <Database size={16} className="text-primary-500"/> Connected MCP Tools & RAG
            </h4>
            <div className="space-y-2">
              {config.tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Network size={16} className="text-neutral-400" />
                  <span className="text-sm font-mono text-neutral-700">{tool}</span>
                  <span className="ml-auto flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
