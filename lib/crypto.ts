import crypto from 'crypto'
import * as CryptoJS from 'crypto-js'

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

export function decryptUniqueKey(encryptedKey: string): string {
  try {
    console.log('decryptUniqueKey 被调用')
    console.log('环境变量UNIQUE_KEY_ENCRYPTION_KEY:', process.env.UNIQUE_KEY_ENCRYPTION_KEY ? '已设置' : '未设置')
    console.log('加密的唯一密钥:', encryptedKey)
    
    const bytes = CryptoJS.AES.decrypt(encryptedKey, UNIQUE_KEY_ENCRYPTION_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    
    console.log('解密结果:', result)
    return result;
  } catch (error) {
    console.error('解密唯一密钥失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('错误详情:', errorMessage);
    throw new Error('解密唯一密钥失败: ' + errorMessage);
  }
} 
