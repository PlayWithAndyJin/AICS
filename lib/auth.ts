 /**
 * 退出登录工具函数
 * 支持新认证系统和旧认证系统的退出登录
 */

export interface LogoutResult {
    success: boolean
    message?: string
  }
  
  /**
   * 执行退出登录操作
   * 自动检测认证系统类型并执行相应的退出登录流程
   */
  export async function performLogout(): Promise<LogoutResult> {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken && refreshToken) {
      // 新认证系统退出登录
      return await logoutNewAuth(refreshToken)
    } else {
      // 旧认证系统退出登录
      return logoutOldAuth()
    }
  }
  
  /**
   * 新认证系统退出登录
   * 向服务端发送退出登录请求
   */
  async function logoutNewAuth(refreshToken: string): Promise<LogoutResult> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
      } else {
      }
      
      // 无论服务端请求是否成功，都清除本地存储
      clearNewAuthStorage()
      
      return {
        success: true,
        message: '退出登录成功'
      }
    } catch (error) {
      console.error('退出登录请求失败:', error)
      
      // 即使请求失败，也清除本地存储
      clearNewAuthStorage()
      
      return {
        success: true,
        message: '退出登录成功（网络请求失败，但已清除本地数据）'
      }
    }
  }
  
  /**
   * 旧认证系统退出登录
   * 仅清除本地存储
   */
  function logoutOldAuth(): LogoutResult {
    // 清除旧系统的用户数据
    localStorage.removeItem('user')
    
    return {
      success: true,
      message: '退出登录成功'
    }
  }
  
  /**
   * 清除新认证系统的本地存储
   */
  function clearNewAuthStorage(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
  
  /**
   * 检查是否使用新认证系统
   */
  export function isNewAuthSystem(): boolean {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    return !!(accessToken && refreshToken)
  }