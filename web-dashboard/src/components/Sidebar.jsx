import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Users, Truck, TrendingUp, Leaf } from 'lucide-react'

export default function Sidebar({ open }) {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Farmer Welfare', path: '/welfare' },
    { icon: Truck, label: 'Supply Chain', path: '/supply-chain' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  ]

  return (
    <aside className={`${open ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary to-secondary text-white transition-all duration-300 shadow-lg`}>
      <div className="p-6 flex items-center gap-3">
        <Leaf size={32} />
        {open && <span className="text-xl font-bold">HarveLogix</span>}
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-4 px-6 py-4 hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <item.icon size={20} />
            {open && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
