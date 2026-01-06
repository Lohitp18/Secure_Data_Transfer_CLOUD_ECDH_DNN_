import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { ProgressBar } from '../components/ProgressBar';
import { CryptoStatusCards, StatusType } from '../components/StatusCard';
import { CryptoUtils } from '../utils/cryptoUtils';
import { ApiService } from '../utils/api';

interface UploadStep {
  id: string;
  title: string;
  status: StatusType;
  timestamp?: string;
}

export const SecureUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  
  const [steps, setSteps] = useState<UploadStep[]>([
    { id: 'keygen', title: 'Key Generation', status: 'pending' },
    { id: 'exchange', title: 'Key Exchange', status: 'pending' },
    { id: 'encrypt', title: 'File Encryption', status: 'pending' },
    { id: 'transfer', title: 'Secure Transfer', status: 'pending' },
    { id: 'ids', title: 'IDS Analysis', status: 'pending' },
  ]);

  const navigate = useNavigate();

  const updateStepStatus = useCallback((stepId: string, status: StatusType, timestamp?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, timestamp: timestamp || new Date().toLocaleTimeString() }
        : step
    ));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError('');
    setUploadProgress(0);
    setCurrentStep('');
    
    // Reset all steps to pending
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as StatusType, timestamp: undefined })));
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError('');
    setUploadProgress(0);
    setCurrentStep('');
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as StatusType, timestamp: undefined })));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Step 1: Generate ECDH key pair
      setCurrentStep('keygen');
      updateStepStatus('keygen', 'in-progress');
      
      const keyPair = await CryptoUtils.generateECDHKeyPair();
      const publicKeyBuffer = await CryptoUtils.exportPublicKey(keyPair.publicKey);
      const publicKeyBase64 = CryptoUtils.arrayBufferToBase64(publicKeyBuffer);
      
      updateStepStatus('keygen', 'success');
      setUploadProgress(20);

      // Step 2: Key exchange with server
      setCurrentStep('exchange');
      updateStepStatus('exchange', 'in-progress');
      
      const keyExchangeResponse = await ApiService.exchangeKeys({
        publicKey: publicKeyBase64,
      });
      
      // Import server's public key
      const serverPublicKeyBuffer = CryptoUtils.base64ToArrayBuffer(keyExchangeResponse.serverPublicKey);
      const serverPublicKey = await CryptoUtils.importPublicKey(serverPublicKeyBuffer);
      
      // Derive shared secret
      const sharedSecret = await CryptoUtils.deriveSharedSecret(keyPair.privateKey, serverPublicKey);
      
      setSessionId(keyExchangeResponse.sessionId);
      updateStepStatus('exchange', 'success');
      setUploadProgress(40);

      // Step 3: Encrypt file
      setCurrentStep('encrypt');
      updateStepStatus('encrypt', 'in-progress');
      
      const encryptionResult = await CryptoUtils.encryptFile(
        selectedFile,
        sharedSecret,
        (progress) => {
          setUploadProgress(40 + (progress * 0.3)); // 40% to 70%
        }
      );
      
      updateStepStatus('encrypt', 'success');
      setUploadProgress(70);

      // Step 4: Upload encrypted file
      setCurrentStep('transfer');
      updateStepStatus('transfer', 'in-progress');
      
      const uploadResponse = await ApiService.uploadFile({
        sessionId: keyExchangeResponse.sessionId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        ciphertext: CryptoUtils.arrayBufferToBase64(encryptionResult.ciphertext),
        nonce: CryptoUtils.arrayBufferToBase64(encryptionResult.nonce),
        authTag: CryptoUtils.arrayBufferToBase64(encryptionResult.authTag),
      });
      
      updateStepStatus('transfer', 'success');
      setUploadProgress(90);

      // Step 5: IDS Analysis
      setCurrentStep('ids');
      updateStepStatus('ids', 'in-progress');
      
      // Simulate IDS analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (uploadResponse.idsResult === 'intrusion') {
        updateStepStatus('ids', 'error');
        setError('Intrusion detected! Transfer has been terminated for security reasons.');
      } else if (uploadResponse.idsResult === 'suspicious') {
        updateStepStatus('ids', 'warning');
      } else {
        updateStepStatus('ids', 'success');
      }
      
      setUploadProgress(100);
      setCurrentStep('complete');

      // Navigate to status page after a brief delay
      setTimeout(() => {
        navigate('/status', { 
          state: { 
            uploadId: uploadResponse.uploadId,
            fileName: selectedFile.name,
            idsResult: uploadResponse.idsResult 
          }
        });
      }, 2000);

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      
      // Mark current step as failed
      if (currentStep) {
        updateStepStatus(currentStep, 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getStepComponent = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return null;

    switch (stepId) {
      case 'keygen':
        return <CryptoStatusCards.KeyGeneration status={step.status} timestamp={step.timestamp} />;
      case 'exchange':
        return <CryptoStatusCards.KeyExchange status={step.status} timestamp={step.timestamp} />;
      case 'encrypt':
        return <CryptoStatusCards.FileEncryption status={step.status} timestamp={step.timestamp} />;
      case 'transfer':
        return <CryptoStatusCards.SecureTransfer status={step.status} timestamp={step.timestamp} />;
      case 'ids':
        return <CryptoStatusCards.IDSAnalysis status={step.status} timestamp={step.timestamp} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Secure File Upload
          </h1>
          <p className="text-lg text-gray-600">
            Upload your files with end-to-end encryption and real-time threat detection.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              isUploading={isUploading}
              error={error}
            />

            {selectedFile && !isUploading && (
              <button
                onClick={handleUpload}
                className="w-full btn-primary"
              >
                Start Secure Upload
              </button>
            )}

            {isUploading && (
              <div className="card">
                <ProgressBar
                  progress={uploadProgress}
                  label="Upload Progress"
                  color={error ? 'error' : 'primary'}
                />
                
                {currentStep && (
                  <div className="mt-4 text-sm text-gray-600">
                    Current step: {steps.find(s => s.id === currentStep)?.title}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Security Process Status
            </h2>
            
            <div className="space-y-3">
              {steps.map(step => (
                <div key={step.id}>
                  {getStepComponent(step.id)}
                </div>
              ))}
            </div>

            {currentStep === 'complete' && !error && (
              <div className="card bg-success-50 border-success-200">
                <div className="text-center">
                  <div className="text-success-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-success-800 mb-2">
                    Upload Complete!
                  </h3>
                  <p className="text-success-700">
                    Your file has been securely uploaded and analyzed. Redirecting to status page...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};