import React, { useState } from 'react'
import { Menu, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react'

/**
 * Top Navigation Bar Component
 * Features:
 * - Menu toggle for sidebar
 * - Logo/branding area
 * - Environment indicator
 * - Notifications
 * - User profile dropdown
 */
export default function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Logo & Branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HL</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">HarveLogix</h1>
            <p className="text-xs text-neutral-500">AI for Bharat</p>
          </div>
        </div>

        {/* Environment Badge */}
        <div className="ml-4 px-3 py-1 bg-accent-50 border border-accent-200 rounded-full">
          <span className="text-xs font-medium text-accent-700">Development</span>
        </div>
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="User profile"
          >
            <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <ChevronDown size={16} className="text-neutral-600" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900">Admin User</p>
                <p className="text-xs text-neutral-500">admin@harvelogix.ai</p>
              </div>

              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                <Settings size={16} />
                Settings
              </button>

              <button className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-50 flex items-center gap-2 border-t border-neutral-200">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
