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
  Wand2,
  Settings,
  HelpCircle,
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
      title: 'AI Tools',
      items: [
        { icon: Wand2, label: t('multimodal.aiScanner'), path: '/ai-scanner', badge: null },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { icon: Globe, label: t('nav.governmentView'), path: '/government', badge: null },
        { icon: Activity, label: t('nav.systemHealth'), path: '/health', badge: null },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: t('nav.settings'), path: '/settings', badge: null },
        { icon: HelpCircle, label: t('nav.faq'), path: '/faq', badge: null },
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
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-white border-opacity-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-400 to-info-500 flex items-center justify-center shadow-lg shadow-success-900/20 transform transition-transform hover:scale-110 duration-300">
          <Leaf size={24} className="text-white drop-shadow-md" />
        </div>
        {open && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tighter leading-none bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic">
              HarveLogix
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-[1px] w-3 bg-accent-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-400 opacity-90">
                AI for Bharat
              </p>
            </div>
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
