import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, Key, Lock, Eye } from 'lucide-react';

export type StatusType = 'pending' | 'in-progress' | 'success' | 'warning' | 'error';

interface StatusCardProps {
  title: string;
  description: string;
  status: StatusType;
  timestamp?: string;
  details?: string[];
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  status,
  timestamp,
  details,
}) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'status-success',
          iconColor: 'text-success-600',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          className: 'status-warning',
          iconColor: 'text-warning-600',
        };
      case 'error':
        return {
          icon: XCircle,
          className: 'status-error',
          iconColor: 'text-error-600',
        };
      case 'in-progress':
        return {
          icon: Clock,
          className: 'status-info',
          iconColor: 'text-primary-600',
        };
      default:
        return {
          icon: Clock,
          className: 'status-indicator bg-gray-50 border-gray-200 text-gray-700',
          iconColor: 'text-gray-400',
        };
    }
  };

  const { icon: Icon, className, iconColor } = getStatusConfig(status);

  return (
    <div className={`status-indicator ${className}`}>
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          {timestamp && (
            <span className="text-xs opacity-75">{timestamp}</span>
          )}
        </div>
        
        <p className="text-sm opacity-90 mt-1">{description}</p>
        
        {details && details.length > 0 && (
          <ul className="text-xs opacity-75 mt-2 space-y-1">
            {details.map((detail, index) => (
              <li key={index} className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-current rounded-full" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Predefined status cards for common cryptography and IDS steps
export const CryptoStatusCards = {
  KeyGeneration: ({ status, timestamp }: { status: StatusType; timestamp?: string }) => (
    <StatusCard
      title="ECDH Key Generation"
      description="Generating client-side cryptographic key pair"
      status={status}
      timestamp={timestamp}
      details={[
        'Algorithm: ECDH P-256',
        'Key length: 256 bits',
        'Extractable: Public key only'
      ]}
    />
  ),

  KeyExchange: ({ status, timestamp }: { status: StatusType; timestamp?: string }) => (
    <StatusCard
      title="Secure Key Exchange"
      description="Establishing secure session with server"
      status={status}
      timestamp={timestamp}
      details={[
        'Protocol: ECDH key agreement',
        'Signature verification: ECDSA',
        'Session key derivation: HKDF-SHA256'
      ]}
    />
  ),

  FileEncryption: ({ status, timestamp }: { status: StatusType; timestamp?: string }) => (
    <StatusCard
      title="AES-256-GCM Encryption"
      description="Encrypting file with authenticated encryption"
      status={status}
      timestamp={timestamp}
      details={[
        'Algorithm: AES-256-GCM',
        'Nonce: 96-bit random',
        'Authentication tag: 128-bit'
      ]}
    />
  ),

  SecureTransfer: ({ status, timestamp }: { status: StatusType; timestamp?: string }) => (
    <StatusCard
      title="Secure File Transfer"
      description="Uploading encrypted data to cloud storage"
      status={status}
      timestamp={timestamp}
      details={[
        'Transport: HTTPS/TLS 1.3',
        'Payload: Encrypted + authenticated',
        'Integrity: SHA-256 checksum'
      ]}
    />
  ),

  IDSAnalysis: ({ status, timestamp, result }: { status: StatusType; timestamp?: string; result?: string }) => (
    <StatusCard
      title="Intrusion Detection Analysis"
      description="AI-powered traffic analysis and threat detection"
      status={status}
      timestamp={timestamp}
      details={[
        'Model: Deep Neural Network',
        'Features: Network traffic patterns',
        result ? `Result: ${result}` : 'Analysis in progress...'
      ]}
    />
  ),
};

// Status card with icon mapping for different security components
export const SecurityStatusCard: React.FC<{
  type: 'crypto' | 'ids' | 'transfer' | 'auth';
  status: StatusType;
  title: string;
  description: string;
  timestamp?: string;
}> = ({ type, status, title, description, timestamp }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crypto':
        return Key;
      case 'ids':
        return Eye;
      case 'transfer':
        return Lock;
      case 'auth':
        return Shield;
      default:
        return Clock;
    }
  };

  const TypeIcon = getTypeIcon(type);
  const { className, iconColor } = getStatusConfig(status);

  return (
    <div className={`status-indicator ${className}`}>
      <div className="flex-shrink-0">
        <TypeIcon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          {timestamp && (
            <span className="text-xs opacity-75">{timestamp}</span>
          )}
        </div>
        <p className="text-sm opacity-90 mt-1">{description}</p>
      </div>
    </div>
  );
};

function getStatusConfig(status: StatusType) {
  switch (status) {
    case 'success':
      return {
        className: 'status-success',
        iconColor: 'text-success-600',
      };
    case 'warning':
      return {
        className: 'status-warning',
        iconColor: 'text-warning-600',
      };
    case 'error':
      return {
        className: 'status-error',
        iconColor: 'text-error-600',
      };
    case 'in-progress':
      return {
        className: 'status-info',
        iconColor: 'text-primary-600',
      };
    default:
      return {
        className: 'status-indicator bg-gray-50 border-gray-200 text-gray-700',
        iconColor: 'text-gray-400',
      };
  }
}