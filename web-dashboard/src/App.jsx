import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from './context/I18nProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { DataModeProvider } from './context/DataModeProvider'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import OverviewUpgraded from './pages/OverviewUpgraded'
import Agents from './pages/Agents'
import FarmerWelfare from './pages/FarmerWelfare'
import FarmersUpgraded from './pages/FarmersUpgraded'
import SupplyChain from './pages/SupplyChain'
import Analytics from './pages/Analytics'
import GovernmentViewUpgraded from './pages/GovernmentViewUpgraded'
import SystemHealthUpgraded from './pages/SystemHealthUpgraded'
import './theme/variables.css'
import i18n from './i18n/config'

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
    <I18nProvider>
      <ThemeProvider>
        <DataModeProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<OverviewUpgraded />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/farmers" element={<FarmersUpgraded />} />
                <Route path="/processors" element={<SupplyChain />} />
                <Route path="/government" element={<GovernmentViewUpgraded />} />
                <Route path="/health" element={<SystemHealthUpgraded />} />
                {/* Legacy routes */}
                <Route path="/welfare" element={<FarmerWelfare />} />
                <Route path="/supply-chain" element={<SupplyChain />} />
                <Route path="/analytics" element={<Analytics />} />
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </DataModeProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default App
