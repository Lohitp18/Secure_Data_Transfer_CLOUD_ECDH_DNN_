import React from 'react'
import { Shield, FileTerminal as FileTransfer, Activity, Settings, AlertTriangle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Shield },
  { id: 'handshake', name: 'Connection', icon: Lock },
  // File transfer UI removed from frontend
  { id: 'intrusion', name: 'IDS Alerts', icon: AlertTriangle },
  { id: 'activity', name: 'Activity Logs', icon: Activity },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-lg font-bold text-white">SecureTransfer</h1>
            <p className="text-xs text-gray-400">IDS Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          )
        })}
      </nav>
    </div>
  )
}