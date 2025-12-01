/**
 * Token管理工具
 * 处理accessToken和refreshToken的管理
 */

export interface UserData {
  userId: string
  username: string
  email: string | null
  status: string
  metadata: any
  lastLoginAt: string
  createdAt: string
  updatedAt: string
  mfaEnabled?: boolean
}

/**
 * 检查token是否即将过期（提前5分钟检查）
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    return (exp - now) < fiveMinutes
  } catch (error) {
    return true 
  }
}

/**
 * 检查token是否已过期
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // 转换为毫秒
    const now = Date.now()
    
    return now >= exp
  } catch (error) {
    return true // 如果解析失败，认为已过期
  }
}

/**
 * 获取有效的accessToken
 */
export function getValidAccessToken(): string | null {
  const accessToken = localStorage.getItem('accessToken')
  
  if (!accessToken) {
    return null
  }

  // 检查token是否已过期
  if (isTokenExpired(accessToken)) {
    // 清除过期的token
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    return null
  }

  return accessToken
}

function getBrowserName(): string {
  try {
    if (typeof navigator === 'undefined') return 'web'
    const ua = navigator.userAgent
    if (/edg/i.test(ua)) return 'Edge'
    if (/opr|opera/i.test(ua)) return 'Opera'
    if (/chrome|crios/i.test(ua)) return 'Chrome'
    if (/firefox|fxios/i.test(ua)) return 'Firefox'
    if (/safari/i.test(ua)) return 'Safari'
    return 'Browser'
  } catch {
    return 'Browser'
  }
}

export async function fetchUserInfo(): Promise<UserData | null> {
  const accessToken = getValidAccessToken()
  if (!accessToken) return null

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Device-Id': getBrowserName()
      }
    })

    if (response.ok) {
      const userData = await response.json()
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    }

    if (response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') window.location.href = '/auth'
      return null
    }

    return null
  } catch {
    return null
  }
}
/**
 * 检查token状态并显示警告
 */
export function checkTokenStatus(): { isValid: boolean; expiresIn?: number } {
  const accessToken = localStorage.getItem('accessToken')
  
  if (!accessToken) {
    return { isValid: false }
  }

  if (isTokenExpired(accessToken)) {
    return { isValid: false }
  }

  if (isTokenExpiringSoon(accessToken)) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const exp = payload.exp * 1000
      const now = Date.now()
      const expiresIn = Math.floor((exp - now) / 1000 / 60)
      
      return { isValid: true, expiresIn }
    } catch (error) {
      return { isValid: false }
    }
  }

  return { isValid: true }
}

/**
 * 设置token状态检查
 */
export function setupTokenStatusCheck(): void {
  setInterval(() => {
    const status = checkTokenStatus()
    
    if (!status.isValid) {
    } else if (status.expiresIn && status.expiresIn < 10) {
    }
  }, 5 * 60 * 1000)
}

