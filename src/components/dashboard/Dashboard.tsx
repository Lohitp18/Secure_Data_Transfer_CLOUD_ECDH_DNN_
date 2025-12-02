import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Shield, Lock, FileTerminal as FileTransfer, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import apiClient, { Alert, Transfer, ConnectionLog } from '../../api/client'

export function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    activeConnections: 0,
    totalTransfers: 0,
    resolvedAlerts: 0,
    securityScore: 100,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('Loading dashboard data...')
      const [alertsData, transfersData, connectionLogsData] = await Promise.all([
        apiClient.getAlerts(),
        apiClient.getTransfers(),
        apiClient.getConnectionLogs(),
      ])
      console.log('Dashboard data loaded:', { alerts: alertsData.length, transfers: transfersData.length, connections: connectionLogsData.length })
      
      setAlerts(alertsData)
      setTransfers(transfersData)
      setConnectionLogs(connectionLogsData)

      const resolved = alertsData.filter((a: Alert) => a.resolved).length
      const total = transfersData.length
      const successfulConnections = connectionLogsData.filter((c: ConnectionLog) => c.status === 'success').length
      const suspiciousRate = alertsData.length > 0 ? (alertsData.filter((a: Alert) => (a.severity === 'high' || a.severity === 'critical')).length / alertsData.length) : 0
      const score = Math.max(0, Math.round(100 - suspiciousRate * 100))

      setStats({
        activeConnections: successfulConnections,
        totalTransfers: total,
        resolvedAlerts: resolved,
        securityScore: score,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Build alert distribution dynamically
  const severityCounts: Record<string, number> = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const alertDistribution = [
    { name: 'Low', value: severityCounts['low'] || 0, color: '#10B981' },
    { name: 'Medium', value: severityCounts['medium'] || 0, color: '#F59E0B' },
    { name: 'High', value: severityCounts['high'] || 0, color: '#EF4444' },
    { name: 'Critical', value: severityCounts['critical'] || 0, color: '#DC2626' },
  ]

  // Helper to parse dates safely
  const parseDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) return dateStr
    try {
      return new Date(dateStr)
    } catch {
      return new Date()
    }
  }

  // Simple time series from alerts, transfers, and connection logs (by hour)
  const byHour: Record<string, { threats: number; connections: number; transfers: number }> = {}
  
  alerts.forEach(a => {
    const date = parseDate(a.created_at)
    const h = date.getHours().toString().padStart(2, '0') + ':00'
    byHour[h] = byHour[h] || { threats: 0, connections: 0, transfers: 0 }
    byHour[h].threats += 1
  })
  
  connectionLogs.forEach(c => {
    const date = parseDate(c.created_at)
    const h = date.getHours().toString().padStart(2, '0') + ':00'
    byHour[h] = byHour[h] || { threats: 0, connections: 0, transfers: 0 }
    if (c.status === 'success') {
      byHour[h].connections += 1
    }
  })
  
  transfers.forEach(t => {
    const date = parseDate(t.created_at)
    const h = date.getHours().toString().padStart(2, '0') + ':00'
    byHour[h] = byHour[h] || { threats: 0, connections: 0, transfers: 0 }
    byHour[h].transfers += 1
  })
  
  const securityMetrics = Object.entries(byHour)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([time, v]) => ({ time, threats: v.threats, connections: v.connections, transfers: v.transfers }))

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Connections</p>
                  <p className="text-3xl font-bold">{stats.activeConnections}</p>
                </div>
                <Lock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Transfers</p>
                  <p className="text-3xl font-bold">{stats.totalTransfers}</p>
                </div>
                <FileTransfer className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Resolved Alerts</p>
                  <p className="text-3xl font-bold">{stats.resolvedAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Security Score</p>
                  <p className="text-3xl font-bold">{stats.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Metrics Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Security Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Threat detection and connection trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={securityMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} name="Threats" />
                  <Line type="monotone" dataKey="connections" stroke="#3B82F6" strokeWidth={2} name="Connections" />
                  <Line type="monotone" dataKey="transfers" stroke="#10B981" strokeWidth={2} name="Transfers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Alert Distribution</CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown of alert severity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={alertDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {alertDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {alertDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-gray-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Alerts</CardTitle>
              <CardDescription className="text-gray-400">
                Latest intrusion detection alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No alerts yet</p>
                    <p className="text-xs mt-1">Alerts will appear here when detected</p>
                  </div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{alert.threat_type}</p>
                          <p className="text-xs text-gray-400">{alert.source_ip || 'N/A'}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'warning' :
                          alert.severity === 'medium' ? 'secondary' : 'default'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Transfers</CardTitle>
              <CardDescription className="text-gray-400">
                Latest file transfer activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transfers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileTransfer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No transfers yet</p>
                    <p className="text-xs mt-1">Upload files to see transfer history</p>
                  </div>
                ) : (
                  transfers.slice(0, 5).map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileTransfer className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{transfer.filename}</p>
                          <p className="text-xs text-gray-400">{(transfer.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          transfer.status === 'completed' ? 'success' :
                          transfer.status === 'failed' ? 'destructive' :
                          transfer.status === 'uploading' ? 'secondary' : 'default'
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}