import crypto from 'crypto'

const UNIQUE_KEY_ENCRYPTION_KEY = process.env.UNIQUE_KEY_ENCRYPTION_KEY as string
if (!UNIQUE_KEY_ENCRYPTION_KEY) {
  throw new Error('Missing UNIQUE_KEY_ENCRYPTION_KEY environment variable')
}
const ALGORITHM = 'aes-256-gcm'

export function encryptWithUniqueKey(data: string, uniqueKey: string): { encryptedData: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(UNIQUE_KEY_ENCRYPTION_KEY + uniqueKey, 'salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  cipher.setAAD(Buffer.from(uniqueKey, 'hex'))
  
  let encryptedData = cipher.update(data, 'utf8', 'hex')
  encryptedData += cipher.final('hex')
  
  return {
    encryptedData,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex')
  }
}

// 使用唯一密钥解密API密钥
export function decryptWithUniqueKey(encryptedData: string, uniqueKey: string, iv: string, authTag: string): string {
  const key = crypto.scryptSync(UNIQUE_KEY_ENCRYPTION_KEY + uniqueKey, 'salt', 32)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'))
  decipher.setAAD(Buffer.from(uniqueKey, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8')
  decryptedData += decipher.final('utf8')
  
  return decryptedData
}

export function validateUniqueKey(uniqueKey: string): boolean {
  return /^[a-f0-9]{32}$/.test(uniqueKey)
}

export function generateRequestSignature(userId: string, uniqueKey: string, timestamp: number): string {
  const data = `${userId}:${uniqueKey}:${timestamp}`
  return crypto.createHmac('sha256', UNIQUE_KEY_ENCRYPTION_KEY).update(data).digest('hex')
}

export function verifyRequestSignature(userId: string, uniqueKey: string, timestamp: number, signature: string): boolean {
  const expectedSignature = generateRequestSignature(userId, uniqueKey, timestamp)
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
}

// 简单的AES解密函数，用于解密唯一密钥
export function decryptUniqueKey(encryptedKey: string): string {
  try {
    const key = crypto.scryptSync(UNIQUE_KEY_ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipher('aes-256-cbc', key)
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('解密唯一密钥失败:', error)
    throw new Error('解密唯一密钥失败')
  }
} 
