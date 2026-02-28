import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Agents from './pages/Agents'
import FarmerWelfare from './pages/FarmerWelfare'
import SupplyChain from './pages/SupplyChain'
import Analytics from './pages/Analytics'

/**
 * HarveLogix AI - Main App Component
 * 
 * Routing structure:
 * - / → Overview (main dashboard)
 * - /agents → Autonomous agents
 * - /farmers → Farmer welfare
 * - /processors → Processor management
 * - /government → Government view
 * - /health → System health
 * - /supply-chain → Supply chain (legacy)
 * - /analytics → Analytics (legacy)
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/farmers" element={<FarmerWelfare />} />
          <Route path="/processors" element={<SupplyChain />} />
          <Route path="/government" element={<Analytics />} />
          <Route path="/health" element={<Analytics />} />
          {/* Legacy routes */}
          <Route path="/welfare" element={<FarmerWelfare />} />
          <Route path="/supply-chain" element={<SupplyChain />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
