import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os

def generate_synthetic_handshake_data(n_samples=10000):
    """Generate synthetic handshake data for training"""
    np.random.seed(42)
    
    # Generate features
    handshake_duration = np.random.exponential(0.5, n_samples)
    key_size = np.random.choice([32, 64, 128, 256], n_samples, p=[0.1, 0.2, 0.6, 0.1])
    signature_valid = np.random.choice([0, 1], n_samples, p=[0.05, 0.95])
    client_entropy = np.random.normal(7.5, 0.5, n_samples)
    server_entropy = np.random.normal(7.5, 0.5, n_samples)
    retry_count = np.random.poisson(0.5, n_samples)
    timestamp_hour = np.random.randint(0, 24, n_samples)
    ip_reputation = np.random.beta(2, 5, n_samples)
    geolocation_risk = np.random.beta(1, 3, n_samples)
    protocol_version = np.random.choice([1.0, 1.1, 2.0], n_samples, p=[0.1, 0.3, 0.6])
    
    # Create anomaly labels (suspicious patterns)
    anomaly_prob = (
        (handshake_duration > 2.0) * 0.3 +
        (signature_valid == 0) * 0.8 +
        (retry_count > 3) * 0.4 +
        (ip_reputation < 0.3) * 0.6 +
        (geolocation_risk > 0.7) * 0.5 +
        (client_entropy < 6.0) * 0.3
    )
    
    labels = (np.random.random(n_samples) < anomaly_prob).astype(int)
    
    data = pd.DataFrame({
        'handshake_duration': handshake_duration,
        'key_size': key_size,
        'signature_valid': signature_valid,
        'client_entropy': client_entropy,
        'server_entropy': server_entropy,
        'retry_count': retry_count,
        'timestamp_hour': timestamp_hour,
        'ip_reputation': ip_reputation,
        'geolocation_risk': geolocation_risk,
        'protocol_version': protocol_version,
        'anomaly': labels
    })
    
    return data

def generate_synthetic_file_data(n_samples=10000):
    """Generate synthetic file transfer data for training"""
    np.random.seed(42)
    
    # Generate features
    file_size = np.random.lognormal(10, 2, n_samples)
    file_entropy = np.random.normal(7.0, 1.0, n_samples)
    file_type_risk = np.random.beta(1, 4, n_samples)
    encryption_strength = np.random.choice([128, 256], n_samples, p=[0.2, 0.8])
    upload_duration = np.random.exponential(2.0, n_samples)
    compression_ratio = np.random.beta(2, 2, n_samples)
    metadata_anomaly = np.random.beta(1, 9, n_samples)
    transfer_speed = np.random.lognormal(8, 1, n_samples)
    packet_loss = np.random.exponential(0.01, n_samples)
    concurrent_uploads = np.random.poisson(2, n_samples)
    
    # Create anomaly labels
    anomaly_prob = (
        (file_size > 100000000) * 0.3 +  # Large files
        (file_entropy < 5.0) * 0.4 +     # Low entropy
        (file_type_risk > 0.7) * 0.6 +   # Risky file types
        (encryption_strength < 256) * 0.2 +
        (upload_duration < 0.1) * 0.5 +  # Suspiciously fast
        (metadata_anomaly > 0.8) * 0.7 +
        (packet_loss > 0.1) * 0.4
    )
    
    labels = (np.random.random(n_samples) < anomaly_prob).astype(int)
    
    data = pd.DataFrame({
        'file_size': file_size,
        'file_entropy': file_entropy,
        'file_type_risk': file_type_risk,
        'encryption_strength': encryption_strength,
        'upload_duration': upload_duration,
        'compression_ratio': compression_ratio,
        'metadata_anomaly': metadata_anomaly,
        'transfer_speed': transfer_speed,
        'packet_loss': packet_loss,
        'concurrent_uploads': concurrent_uploads,
        'anomaly': labels
    })
    
    return data

def train_handshake_model():
    """Train handshake anomaly detection model"""
    print("Generating handshake training data...")
    data = generate_synthetic_handshake_data()
    
    # Prepare features and labels
    feature_cols = [col for col in data.columns if col != 'anomaly']
    X = data[feature_cols]
    y = data['anomaly']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training handshake model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    print("Handshake Model Performance:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/handshake_model.pkl')
    print("Handshake model saved to models/handshake_model.pkl")
    
    return model

def train_file_model():
    """Train file transfer anomaly detection model"""
    print("Generating file transfer training data...")
    data = generate_synthetic_file_data()
    
    # Prepare features and labels
    feature_cols = [col for col in data.columns if col != 'anomaly']
    X = data[feature_cols]
    y = data['anomaly']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training file model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    print("File Model Performance:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/file_model.pkl')
    print("File model saved to models/file_model.pkl")
    
    return model

if __name__ == "__main__":
    print("Training IDS models...")
    handshake_model = train_handshake_model()
    file_model = train_file_model()
    print("Training completed!")
