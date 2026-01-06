import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key, Eye, Upload, FileText, ArrowRight, CheckCircle } from 'lucide-react';

interface HomeProps {
  isAuthenticated: boolean;
}

export const Home: React.FC<HomeProps> = ({ isAuthenticated }) => {
  const features = [
    {
      icon: Key,
      title: 'ECDH Key Exchange',
      description: 'Secure key agreement protocol using Elliptic Curve Diffie-Hellman for perfect forward secrecy.',
    },
    {
      icon: Shield,
      title: 'AES-256-GCM Encryption',
      description: 'Military-grade authenticated encryption ensuring both confidentiality and integrity of your data.',
    },
    {
      icon: Eye,
      title: 'AI-Powered IDS',
      description: 'Deep Neural Network analyzes traffic patterns to detect and prevent intrusion attempts in real-time.',
    },
  ];

  const securitySteps = [
    'Client generates ECDH key pair using P-256 curve',
    'Secure key exchange with server authentication',
    'File encryption using AES-256-GCM with random nonce',
    'Encrypted data transfer over TLS 1.3',
    'Real-time intrusion detection and threat analysis',
    'Secure storage with integrity verification',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary-100 rounded-full">
              <Shield className="w-16 h-16 text-primary-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Cloud Data Transfer
            <span className="block text-primary-600">with AI & Cryptography</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced file transfer system combining ECDH key exchange, AES-256-GCM encryption, 
            and AI-powered intrusion detection for maximum security in cloud environments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? "/upload" : "/login"}
              className="btn-primary inline-flex items-center justify-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Secure Transfer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              to={isAuthenticated ? "/logs" : "/login"}
              className="btn-secondary inline-flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Transfer Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Security Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our system implements cutting-edge cryptographic protocols and AI-driven security measures 
            to ensure your data remains protected throughout the transfer process.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Process Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How Our Security Works
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Every file transfer follows a rigorous security protocol designed to protect against 
                both passive eavesdropping and active attacks.
              </p>
              
              <div className="space-y-4">
                {securitySteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Security Guarantees
              </h3>
              
              <div className="space-y-4">
                {[
                  'End-to-end encryption with perfect forward secrecy',
                  'Real-time intrusion detection and prevention',
                  'Authenticated encryption prevents tampering',
                  'Zero-knowledge architecture - we never see your data',
                  'Compliance with industry security standards',
                  'Comprehensive audit logging and monitoring',
                ].map((guarantee, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700">{guarantee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Secure Your Data?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Experience the next generation of secure file transfer with our advanced 
            cryptographic protocols and AI-powered threat detection.
          </p>
          
          <Link
            to={isAuthenticated ? "/upload" : "/login"}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};