import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { SecurityStatusCard, StatusType } from '../components/StatusCard';
import { ProgressBar } from '../components/ProgressBar';
import { ApiService } from '../utils/api';

interface TransferStatusState {
  uploadId: string;
  fileName: string;
  idsResult: 'safe' | 'suspicious' | 'intrusion';
}

export const TransferStatus: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as TransferStatusState;

  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!state?.uploadId) {
      navigate('/upload');
      return;
    }

    fetchStatus();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [state?.uploadId, navigate]);

  const fetchStatus = async () => {
    if (!state?.uploadId) return;

    try {
      setIsLoading(true);
      const response = await ApiService.getTransferStatus(state.uploadId);
      setStatusData(response);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIdsResultConfig = (result: string) => {
    switch (result) {
      case 'safe':
        return {
          icon: CheckCircle,
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          title: 'Transfer Secure',
          description: 'No threats detected. Your file has been safely transferred.',
        };
      case 'suspicious':
        return {
          icon: AlertTriangle,
          color: 'text-warning-600',
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          title: 'Suspicious Activity Detected',
          description: 'Some anomalies were detected but transfer completed. Please review the logs.',
        };
      case 'intrusion':
        return {
          icon: XCircle,
          color: 'text-error-600',
          bgColor: 'bg-error-50',
          borderColor: 'border-error-200',
          title: 'Intrusion Detected',
          description: 'Malicious activity detected. Transfer was terminated for security.',
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Analysis in Progress',
          description: 'Security analysis is still running...',
        };
    }
  };

  if (!state?.uploadId) {
    return null;
  }

  const idsConfig = getIdsResultConfig(state.idsResult);
  const Icon = idsConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transfer Status
              </h1>
              <p className="text-lg text-gray-600">
                Real-time monitoring of your secure file transfer
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Info */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                File Transfer Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Name:</span>
                  <span className="font-medium">{state.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upload ID:</span>
                  <span className="font-mono text-sm">{state.uploadId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-sm">{lastUpdated.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Process Status */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Security Process
              </h2>
              
              <div className="space-y-3">
                <SecurityStatusCard
                  type="crypto"
                  status="success"
                  title="ECDH Key Exchange"
                  description="Secure key agreement completed successfully"
                  timestamp={new Date(Date.now() - 300000).toLocaleTimeString()}
                />
                
                <SecurityStatusCard
                  type="crypto"
                  status="success"
                  title="AES-256-GCM Encryption"
                  description="File encrypted with authenticated encryption"
                  timestamp={new Date(Date.now() - 240000).toLocaleTimeString()}
                />
                
                <SecurityStatusCard
                  type="transfer"
                  status="success"
                  title="Secure Transfer"
                  description="Encrypted data transferred over TLS 1.3"
                  timestamp={new Date(Date.now() - 180000).toLocaleTimeString()}
                />
                
                <SecurityStatusCard
                  type="ids"
                  status={state.idsResult === 'safe' ? 'success' : state.idsResult === 'suspicious' ? 'warning' : 'error'}
                  title="Intrusion Detection"
                  description="AI-powered threat analysis completed"
                  timestamp={new Date(Date.now() - 60000).toLocaleTimeString()}
                />
              </div>
            </div>

            {/* Transfer Progress */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Transfer Progress
              </h2>
              
              <ProgressBar
                progress={100}
                label="Overall Progress"
                color="success"
              />
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success-600">100%</div>
                  <div className="text-sm text-gray-600">Encryption</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">100%</div>
                  <div className="text-sm text-gray-600">Transfer</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">100%</div>
                  <div className="text-sm text-gray-600">Verification</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">100%</div>
                  <div className="text-sm text-gray-600">Analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* IDS Results */}
          <div className="space-y-6">
            {/* IDS Result Card */}
            <div className={`card ${idsConfig.bgColor} ${idsConfig.borderColor} border-2`}>
              <div className="text-center">
                <Icon className={`w-16 h-16 mx-auto mb-4 ${idsConfig.color}`} />
                <h3 className="text-xl font-semibold mb-2">
                  {idsConfig.title}
                </h3>
                <p className="text-sm mb-4">
                  {idsConfig.description}
                </p>
                
                {state.idsResult === 'intrusion' && (
                  <div className="bg-white rounded-lg p-4 text-left">
                    <h4 className="font-medium text-error-800 mb-2">
                      Security Actions Taken:
                    </h4>
                    <ul className="text-sm text-error-700 space-y-1">
                      <li>• Transfer immediately terminated</li>
                      <li>• Session invalidated</li>
                      <li>• Security team notified</li>
                      <li>• Incident logged for analysis</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="w-full btn-primary text-center block"
                >
                  Upload Another File
                </Link>
                
                <Link
                  to="/logs"
                  className="w-full btn-secondary text-center block"
                >
                  View All Transfers
                </Link>
                
                <button className="w-full btn-secondary">
                  Download Report
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Information
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Encryption:</span>
                  <span>AES-256-GCM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Exchange:</span>
                  <span>ECDH P-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span>TLS 1.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IDS Model:</span>
                  <span>DNN v2.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};