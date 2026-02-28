import React from 'react'
import { Menu, Bell, User } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">HarveLogix AI</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <User size={20} />
        </button>
      </div>
    </nav>
  )
}
