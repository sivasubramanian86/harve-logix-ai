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
 * - Theme toggle
 * - Data mode badge
 * - Notifications
 * - User profile dropdown
 */
import { useDataMode } from '../context/DataModeProvider'

export default function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { currentLanguage, changeLanguage, t } = useI18n()
  const { dataMode } = useDataMode()

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
      {/* Left Section - Menu & Environment */}
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95 border border-transparent hover:border-white/10 group"
          style={{
            color: 'var(--text-primary)',
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>

        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-success-500 opacity-80 leading-none mb-1.5">
            Agricultural Intelligence
          </span>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight leading-none italic uppercase">HarveLogix</h1>
            <div className="h-4 w-[1px] bg-white/20 mx-0.5" />
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 rounded-md border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-success">Production Environ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group"
            aria-label="Language selector"
          >
            <Globe size={18} className="opacity-60 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{currentLanguage}</span>
            <ChevronDown size={12} className={`opacity-40 transition-transform duration-300 ${languageOpen ? 'rotate-180' : ''}`} />
          </button>

          {languageOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 overflow-hidden" 
              style={{ boxShadow: '0 20px 50px -15px rgba(0,0,0,0.3)' }}>
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Select Language</span>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code)
                    setLanguageOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-all flex items-center justify-between group ${
                    currentLanguage === lang.code
                      ? 'bg-accent-500/10 text-accent-400 font-bold'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {lang.name}
                  {currentLanguage === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? 
            <Moon size={18} className="opacity-60 group-hover:-rotate-12 transition-transform" /> : 
            <Sun size={18} className="opacity-60 group-hover:rotate-45 transition-transform" />
          }
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block" />

        {/* Notifications */}
        <button
          className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group hidden md:flex"
          aria-label="Notifications"
        >
          <Bell size={18} className="opacity-60 group-hover:animate-swing" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-error rounded-full ring-2 ring-neutral-950"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group"
            aria-label="User profile"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-500 to-accent-600 p-[1px]">
              <div className="w-full h-full rounded-[7px] bg-neutral-950 flex items-center justify-center overflow-hidden">
                 <span className="text-white text-[10px] font-black">AD</span>
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">Admin</p>
              <p className="text-[8px] font-bold opacity-40 leading-none">Root Access</p>
            </div>
            <ChevronDown size={14} className={`opacity-40 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-3 z-50 overflow-hidden"
              style={{ boxShadow: '0 20px 50px -15px rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-3 border-b border-white/5 mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-white">Administrator</p>
                <p className="text-[10px] font-bold opacity-40">admin@harvelogix.ai</p>
              </div>

              <div className="px-2 space-y-1">
                <button className="w-full text-left px-4 py-2.5 text-xs text-neutral-400 hover:bg-white/5 hover:text-white rounded-lg transition-all flex items-center gap-3 group">
                  <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent-500/10 group-hover:text-accent-400 transition-colors">
                    <Settings size={14} />
                  </div>
                  System Settings
                </button>
                <button className="w-full text-left px-4 py-2.5 text-xs text-error hover:bg-error/10 rounded-lg transition-all flex items-center gap-3 group">
                  <div className="p-1.5 rounded-md bg-error/10 group-hover:bg-error group-hover:text-white transition-colors">
                    <LogOut size={14} />
                  </div>
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
