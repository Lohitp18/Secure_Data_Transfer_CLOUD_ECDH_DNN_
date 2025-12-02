import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/layout/Sidebar'
import { AuthForm } from './components/auth/AuthForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { HandshakePanel } from './components/handshake/HandshakePanel'
import { FileTransferPanel } from './components/transfer/FileTransferPanel'
import { IntrusionAlertsPanel } from './components/alerts/IntrusionAlertsPanel'
import { ActivityLogsPanel } from './components/activity/ActivityLogsPanel'
import { api, AuthUser } from './lib/api'
import { toast } from 'react-hot-toast'

type TabType = 'dashboard' | 'handshake' | 'transfer' | 'intrusion' | 'activity' | 'settings'

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for existing auth token on app start
    const token = localStorage.getItem('auth_token')
    if (token) {
      // In a real app, you'd validate the token with the backend
      // For demo purposes, we'll assume it's valid
      setUser({
        id: 'demo-user',
        email: 'demo@secureacloud.com',
        name: 'Demo User',
        created_at: new Date().toISOString(),
      })
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.login(email, password)
      setUser(response.user)
      toast.success('Logged in successfully!')
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.register(name, email, password)
      setUser(response.user)
      toast.success('Account created successfully!')
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await api.logout()
    setUser(null)
    setActiveTab('dashboard')
    toast.success('Logged out successfully')
  }

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'handshake':
        return <HandshakePanel />
      case 'transfer':
        return <FileTransferPanel />
      case 'intrusion':
        return <IntrusionAlertsPanel />
      case 'activity':
        return <ActivityLogsPanel />
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">Name: <span className="text-white">{user?.name}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{user?.email}</span></p>
                    <p className="text-gray-400">User ID: <span className="text-white font-mono">{user?.id}</span></p>
                  </div>
                </div>
                <hr className="border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  if (!user) {
    return (
      <>
        <AuthForm 
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
        />
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          {renderActivePanel()}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default App