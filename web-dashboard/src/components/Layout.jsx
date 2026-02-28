import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

/**
 * Main Layout Component
 * Provides consistent structure with top navbar and left sidebar navigation
 * Responsive: sidebar collapses on mobile
 * Uses CSS variables for theming support
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar open={sidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
