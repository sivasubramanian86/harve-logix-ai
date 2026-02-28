import React, { useState } from 'react'
import { Menu, Bell, User, ChevronDown, LogOut, Settings, Sun, Moon, Globe } from 'lucide-react'
import { useTheme } from '../context/ThemeProvider'
import { useI18n } from '../context/I18nProvider'
import DataBadge from './DataBadge'

/**
 * Top Navigation Bar Component
 * Features:
 * - Menu toggle for sidebar
 * - Logo/branding area
 * - Language switcher
 * - Theme toggle
 * - Data mode badge
 * - Notifications
 * - User profile dropdown
 */
export default function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { currentLanguage, changeLanguage, t } = useI18n()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'mr', name: 'मराठी' },
  ]

  return (
    <nav
      className="border-b shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderBottomColor: 'var(--border-primary)',
      }}
    >
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
          }}
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
            <h1 className="text-lg font-bold text-primary-500">HarveLogix</h1>
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
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700"
            aria-label="Language selector"
          >
            <Globe size={20} />
            <span className="text-sm font-medium uppercase">{currentLanguage}</span>
          </button>

          {languageOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code)
                    setLanguageOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Data Badge */}
        <DataBadge mode="live" />

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
