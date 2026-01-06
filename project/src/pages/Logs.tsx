import React, { useState, useEffect } from 'react';
import { LogsTable } from '../components/LogsTable';
import { ApiService, TransferLog } from '../utils/api';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<TransferLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<TransferLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getTransferLogs();
      setLogs(response);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Use mock data for demo
      setLogs(generateMockLogs());
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (log: TransferLog) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  // Generate mock data for demonstration
  const generateMockLogs = (): TransferLog[] => {
    const mockLogs: TransferLog[] = [];
    const fileNames = [
      'document.pdf',
      'presentation.pptx',
      'spreadsheet.xlsx',
      'image.jpg',
      'video.mp4',
      'archive.zip',
      'report.docx',
      'data.csv',
    ];
    
    const idsResults: Array<'safe' | 'suspicious' | 'intrusion'> = ['safe', 'suspicious', 'intrusion'];
    const statuses: Array<'completed' | 'failed' | 'in_progress'> = ['completed', 'failed', 'in_progress'];

    for (let i = 0; i < 25; i++) {
      const randomDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      mockLogs.push({
        id: `log-${i + 1}`,
        fileName: fileNames[Math.floor(Math.random() * fileNames.length)],
        timestamp: randomDate.toISOString(),
        encryptionMethod: 'AES-256-GCM',
        idsResult: idsResults[Math.floor(Math.random() * idsResults.length)],
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        fileSize: Math.floor(Math.random() * 100000000) + 1000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transfer Logs
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and analyze your secure file transfers and security events.
          </p>
        </div>

        <LogsTable
          logs={logs}
          isLoading={isLoading}
          onRefresh={fetchLogs}
          onViewDetails={handleViewDetails}
        />

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Transfer Details
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      File Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Name:</span>
                        <span className="font-medium">{selectedLog.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">
                          {(selectedLog.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transfer Time:</span>
                        <span className="font-medium">
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Security Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Encryption Method:</span>
                        <span className="font-medium">{selectedLog.encryptionMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key Exchange:</span>
                        <span className="font-medium">ECDH P-256</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session ID:</span>
                        <span className="font-mono text-sm">{selectedLog.sessionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IDS Result:</span>
                        <span className={`font-medium ${
                          selectedLog.idsResult === 'safe' ? 'text-success-600' :
                          selectedLog.idsResult === 'suspicious' ? 'text-warning-600' :
                          'text-error-600'
                        }`}>
                          {selectedLog.idsResult.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* IDS Analysis Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      IDS Analysis Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedLog.idsResult === 'safe' && (
                        <div className="text-success-700">
                          <p className="font-medium mb-2">✓ No threats detected</p>
                          <ul className="text-sm space-y-1">
                            <li>• Traffic patterns analyzed: Normal</li>
                            <li>• Payload inspection: Clean</li>
                            <li>• Behavioral analysis: No anomalies</li>
                            <li>• Signature matching: No matches</li>
                          </ul>
                        </div>
                      )}
                      
                      {selectedLog.idsResult === 'suspicious' && (
                        <div className="text-warning-700">
                          <p className="font-medium mb-2">⚠ Suspicious activity detected</p>
                          <ul className="text-sm space-y-1">
                            <li>• Unusual traffic patterns observed</li>
                            <li>• File type mismatch detected</li>
                            <li>• Transfer completed with monitoring</li>
                            <li>• Recommended: Manual review</li>
                          </ul>
                        </div>
                      )}
                      
                      {selectedLog.idsResult === 'intrusion' && (
                        <div className="text-error-700">
                          <p className="font-medium mb-2">🚨 Intrusion attempt detected</p>
                          <ul className="text-sm space-y-1">
                            <li>• Malicious payload signatures found</li>
                            <li>• Transfer immediately terminated</li>
                            <li>• Security team notified</li>
                            <li>• Session blacklisted</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseDetails}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button className="btn-primary">
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};