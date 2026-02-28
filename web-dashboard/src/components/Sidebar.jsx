import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Users,
  Truck,
  TrendingUp,
  Leaf,
  Zap,
  Activity,
  Globe,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '../context/I18nProvider'

/**
 * Sidebar Navigation Component
 * Features:
 * - Collapsible navigation rail
 * - Active state indicators
 * - Organized sections
 * - Responsive design
 * - i18n support for labels
 */
export default function Sidebar({ open }) {
  const location = useLocation()
  const { t } = useI18n()

  const menuSections = [
    {
      title: 'Main',
      items: [
        { icon: BarChart3, label: t('nav.overview'), path: '/', badge: null },
        { icon: Zap, label: t('nav.agents'), path: '/agents', badge: '6' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { icon: Users, label: t('nav.farmers'), path: '/farmers', badge: null },
        { icon: Truck, label: t('nav.processors'), path: '/processors', badge: null },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { icon: Globe, label: t('nav.governmentView'), path: '/government', badge: null },
        { icon: Activity, label: t('nav.systemHealth'), path: '/health', badge: null },
      ],
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } bg-gradient-primary text-white transition-all duration-300 shadow-lg flex flex-col overflow-hidden`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-white border-opacity-10">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Leaf size={24} />
        </div>
        {open && (
          <div>
            <h2 className="text-lg font-bold">HarveLogix</h2>
            <p className="text-xs text-white text-opacity-70">AI for Bharat</p>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            {open && (
              <h3 className="px-6 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-6 py-3 transition-all duration-200
                      ${
                        active
                          ? 'bg-white bg-opacity-20 border-r-4 border-accent-500'
                          : 'hover:bg-white hover:bg-opacity-10'
                      }
                    `}
                    title={!open ? item.label : undefined}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {open && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {open && active && <ChevronRight size={16} className="flex-shrink-0" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {open && (
        <div className="p-6 border-t border-white border-opacity-10 text-xs text-white text-opacity-70">
          <p>v1.0.0</p>
          <p className="mt-1">© 2026 HarveLogix AI</p>
        </div>
      )}
    </aside>
  )
}
