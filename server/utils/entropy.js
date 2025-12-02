import crypto from 'crypto'

export function calculateShannonEntropy(buffer) {
  if (!buffer || buffer.length === 0) return 0
  
  // Count byte frequencies
  const freq = new Array(256).fill(0)
  for (let i = 0; i < buffer.length; i++) {
    freq[buffer[i]]++
  }
  
  // Calculate Shannon entropy
  let entropy = 0
  const len = buffer.length
  
  for (let count of freq) {
    if (count > 0) {
      const p = count / len
      entropy -= p * Math.log2(p)
    }
  }
  
  return entropy
}

export function calculateFileEntropy(fileBuffer) {
  return calculateShannonEntropy(fileBuffer)
}

export function calculateStringEntropy(str) {
  const buffer = Buffer.from(str, 'utf8')
  return calculateShannonEntropy(buffer)
}

export function getEntropyFeatures(fileBuffer) {
  const entropy = calculateShannonEntropy(fileBuffer)
  const size = fileBuffer.length
  
  // Additional entropy-based features
  const features = {
    entropy: entropy,
    entropy_per_byte: entropy / size,
    size: size,
    log_size: Math.log(size + 1),
    entropy_ratio: entropy / 8, // Max entropy is 8 bits per byte
    is_high_entropy: entropy > 7.5,
    is_low_entropy: entropy < 4.0,
    entropy_variance: calculateEntropyVariance(fileBuffer)
  }
  
  return features
}

function calculateEntropyVariance(buffer, chunkSize = 1024) {
  if (buffer.length < chunkSize) return 0
  
  const chunks = []
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize)
    chunks.push(calculateShannonEntropy(chunk))
  }
  
  if (chunks.length < 2) return 0
  
  const mean = chunks.reduce((a, b) => a + b, 0) / chunks.length
  const variance = chunks.reduce((sum, chunk) => sum + Math.pow(chunk - mean, 2), 0) / chunks.length
  
  return variance
}

export function detectEncryptionPatterns(buffer) {
  const entropy = calculateShannonEntropy(buffer)
  const size = buffer.length
  
  // Patterns that might indicate encryption
  const patterns = {
    high_entropy: entropy > 7.8,
    uniform_distribution: isUniformDistribution(buffer),
    random_like: entropy > 7.5 && size > 1024,
    compressed_like: entropy > 6.0 && entropy < 7.5,
    text_like: entropy < 5.0
  }
  
  return patterns
}

function isUniformDistribution(buffer, tolerance = 0.1) {
  if (buffer.length < 256) return false
  
  const freq = new Array(256).fill(0)
  for (let i = 0; i < buffer.length; i++) {
    freq[buffer[i]]++
  }
  
  const expected = buffer.length / 256
  const maxDeviation = expected * tolerance
  
  for (let count of freq) {
    if (Math.abs(count - expected) > maxDeviation) {
      return false
    }
  }
  
  return true
}
