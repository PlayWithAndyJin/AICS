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

function evpBytesToKey(password: string, salt: Buffer, keyLen: number, ivLen: number) {
  const totalLen = keyLen + ivLen;
  let derived = Buffer.alloc(0);
  let hasher = crypto.createHash('md5');
  
  while (derived.length < totalLen) {
    if (derived.length > 0) {
      hasher.update(derived.slice(-16));
    }
    hasher.update(password, 'utf8');
    hasher.update(salt);
    const hash = hasher.digest();
    derived = Buffer.concat([derived, hash]);
    hasher = crypto.createHash('md5');
  }
  
  return {
    key: derived.slice(0, keyLen),
    iv: derived.slice(keyLen, keyLen + ivLen)
  };
}

export function decryptUniqueKey(encryptedKey: string): string {
  try {
    const encryptedData = Buffer.from(encryptedKey, 'base64');
    if (encryptedData.length < 16 || encryptedData.toString('utf8', 0, 8) !== 'Salted__') {
      throw new Error('无效的CryptoJS加密格式');
    }
    const salt = encryptedData.slice(8, 16);
    const encrypted = encryptedData.slice(16);
    const { key, iv } = evpBytesToKey(UNIQUE_KEY_ENCRYPTION_KEY, salt, 32, 16);
    const ciphertext = encrypted.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密唯一密钥失败:', error);
    throw new Error('解密唯一密钥失败');
  }
} 
