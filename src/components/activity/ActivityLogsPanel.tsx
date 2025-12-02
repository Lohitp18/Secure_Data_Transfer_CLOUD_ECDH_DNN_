import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Activity, Download, Filter, Calendar, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { api, ConnectionLog, FileTransfer } from '@/lib/api'
import { formatTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'

type LogType = 'connections' | 'transfers' | 'all'

export function ActivityLogsPanel() {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([])
  const [transferLogs, setTransferLogs] = useState<FileTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LogType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const [connections, transfers] = await Promise.all([
        api.getConnectionLogs(),
        api.getFileTransfers(),
      ])
      setConnectionLogs(connections)
      setTransferLogs(transfers)
    } catch (error) {
      console.error('Failed to load logs:', error)
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = (format: 'csv' | 'json') => {
    const allLogs = [
      ...connectionLogs.map(log => ({ ...log, type: 'connection' })),
      ...transferLogs.map(log => ({ ...log, type: 'transfer' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (format === 'json') {
      const dataStr = JSON.stringify(allLogs, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } else {
      // CSV export
      const headers = ['Type', 'Timestamp', 'Status', 'Details', 'User ID']
      const csvContent = [
        headers.join(','),
        ...allLogs.map(log => [
          log.type,
          new Date(log.created_at).toISOString(),
          'status' in log ? log.status : '',
          'details' in log ? `"${log.details}"` : `"${('filename' in log) ? (log as any).filename : ''}"`,
          log.user_id
        ].join(','))
      ].join('\n')

      const dataBlob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
    toast.success(`Logs exported as ${format.toUpperCase()}`)
  }

  const filteredConnectionLogs = connectionLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = dateFilter === '' || 
      log.created_at.startsWith(dateFilter)

    return matchesSearch && matchesDate
  })

  const filteredTransferLogs = transferLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = dateFilter === '' || 
      log.created_at.startsWith(dateFilter)

    return matchesSearch && matchesDate
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'pending':
      case 'uploading':
      case 'encrypting':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400">Monitor all system activities and connections</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportLogs('csv')}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportLogs('json')}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Log Type</label>
              <div className="flex space-x-1">
                {(['all', 'connections', 'transfers'] as LogType[]).map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={activeTab === type ? 'default' : 'outline'}
                    onClick={() => setActiveTab(type)}
                    className="text-xs"
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Logs */}
        {(activeTab === 'all' || activeTab === 'connections') && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Connection Logs</CardTitle>
                <CardDescription className="text-gray-400">
                  ECDH handshake and connection attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredConnectionLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No connection logs found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredConnectionLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">
                              {log.handshake_type} Handshake
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(log.status) as any}>
                              {log.status}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatTime(new Date(log.created_at))}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {log.details}
                        </p>
                        {log.public_key && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                            <span className="text-gray-400">Public Key:</span>
                            <p className="text-gray-300 font-mono break-all">
                              {log.public_key.slice(0, 32)}...
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transfer Logs */}
        {(activeTab === 'all' || activeTab === 'transfers') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">File Transfer Logs</CardTitle>
                <CardDescription className="text-gray-400">
                  Encrypted file upload and download history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                ) : filteredTransferLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No transfer logs found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredTransferLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Download className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-white">
                              {log.filename}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(log.status) as any}>
                              {log.status}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatTime(new Date(log.created_at))}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <p className="text-gray-300">
                              {(log.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Encryption:</span>
                            <p className="text-gray-300">{log.encryption_method}</p>
                          </div>
                        </div>
                        {log.aes_nonce && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-400">Nonce:</span>
                                <p className="text-gray-300 font-mono break-all">
                                  {log.aes_nonce.slice(0, 16)}...
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Tag:</span>
                                <p className="text-gray-300 font-mono break-all">
                                  {log.verification_tag?.slice(0, 16)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}