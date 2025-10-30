'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KeyManagerModal from '@/components/KeyManagerModal'
import { useUser } from '@/contexts/UserContext'
import ProfileFooter from '@/components/ProfileFooter'
import Link from 'next/link'
import { performLogout, isNewAuthSystem } from '@/lib/auth'
import { QRCodeSVG } from 'qrcode.react'
import { fetchUserInfo, setupTokenStatusCheck } from '@/lib/tokenManager'

// 新认证系统的用户数据类型
interface NewAuthUser {
  userId: string
  email: string | null
  username: string
  status: string
  metadata: any
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { user, isLoggedIn, login, logout } = useUser()
  const [newAuthUser, setNewAuthUser] = useState<NewAuthUser | null>(null)
  const [isNewAuth, setIsNewAuth] = useState(false)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isNewFeatureOpen, setIsNewFeatureOpen] = useState(false)
  const [showLegacyNotice, setShowLegacyNotice] = useState(true)
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaOtpauth, setMfaOtpauth] = useState('')
  const [mfaEnableCode, setMfaEnableCode] = useState('')
  const [mfaDisableCode, setMfaDisableCode] = useState('')
  const [mfaMsg, setMfaMsg] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null)
  const [isMfaEnableModalOpen, setIsMfaEnableModalOpen] = useState(false)
  const [isMfaDisableModalOpen, setIsMfaDisableModalOpen] = useState(false)
  const [mfaEnableModalCode, setMfaEnableModalCode] = useState('')
  const [mfaDisableModalCode, setMfaDisableModalCode] = useState('')
  const router = useRouter()

  // 检查是否使用新认证系统
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user')
    
    if (accessToken && refreshToken) {
      setupTokenStatusCheck()

      // 确保网页端仅单设备在线
      import('@/lib/deviceManager')
        .then(m => m.enforceSingleWebSession())
        .catch(() => {})
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setNewAuthUser(userData)
          setIsNewAuth(true)
        } catch (e) {}      
      } else {
        fetchUserInfo().then(userData => {
          if (userData) {
            setNewAuthUser(userData)
            setIsNewAuth(true)
          }
        })
      }
    }
  }, [])

  // 获取当前显示的用户信息
  const getCurrentUser = () => {
    if (isNewAuth && newAuthUser) {
      return {
        username: newAuthUser.username,
        email: newAuthUser.email,
        userId: newAuthUser.userId,
        status: newAuthUser.status,
        lastLoginAt: newAuthUser.lastLoginAt,
        createdAt: newAuthUser.createdAt,
        currentVersion: 'N/A' // 新系统没有这个字段
      }
    }
    return user
  }

  // 检查是否已登录
  const checkLoginStatus = () => {
    const result = isNewAuth && newAuthUser ? true : isLoggedIn
    return result
  }

  const isUserLoggedIn = checkLoginStatus()

  const currentUser = getCurrentUser()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim() || !email.trim()) {
      setError('请输入用户ID和邮箱')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await login(userId.trim(), email.trim())
      
      if (result.success) {
        setError('')
        setUserId('')
        setEmail('')
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } else {
        setError(result.message)
        setIsLoading(false)
      }
    } catch (error) {
      setError('登录过程中发生错误')
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const result = await performLogout()
    
    // 如果是新认证系统，更新本地状态
    if (isNewAuthSystem()) {
      setNewAuthUser(null)
      setIsNewAuth(false)
    } else {
      // 旧系统登出
      logout()
    }
    
    setUserId('')
    setEmail('')
    setShowUserDetails(false)
    
    
    // 可选：显示退出登录结果消息
    if (result.message) {
    }
    
    setTimeout(() => {
      router.push("/auth")
    }, 500)    // 退出登录成功后跳转到登录页面
  }

  const clearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  const toggleUserDetails = () => {
    setShowUserDetails(!showUserDetails)
  }

  useEffect(() => {
    const check = async () => {
      const data = await fetchUserInfo()
      if (data && typeof (data as any).mfaEnabled !== 'undefined') {
        setMfaEnabled(Boolean((data as any).mfaEnabled))
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    // 首次进入也校验一次
    check()
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    const getBrowserName = () => {
      if (typeof navigator === 'undefined') return 'web'
      const ua = navigator.userAgent
      if (/edg/i.test(ua)) return 'Edge'
      if (/opr|opera/i.test(ua)) return 'Opera'
      if (/chrome|crios/i.test(ua)) return 'Chrome'
      if (/firefox|fxios/i.test(ua)) return 'Firefox'
      if (/safari/i.test(ua)) return 'Safari'
      return 'Browser'
    }
    const deviceId = getBrowserName()

    const logoutAndRedirect = () => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.replace('/auth')
    }
    let timer: number | undefined
    const checkOnline = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      try {
        const res = await fetch('/api/auth/devices', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) {
          if (res.status === 401) logoutAndRedirect()
          return
        }
        const data = await res.json()
        const online = Array.isArray(data?.devices) && data.devices.some((d: any) => d.deviceId === deviceId)
        if (!online) logoutAndRedirect()
      } catch {
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') checkOnline()
    }
    document.addEventListener('visibilitychange', onVisible)
    checkOnline()
    timer = window.setInterval(checkOnline, 15000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      if (timer) window.clearInterval(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 dark:from-indigo-500/5 dark:to-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/5 to-purple-300/5 dark:from-blue-400/3 dark:to-purple-400/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 头部导航栏 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white shadow-lg relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">个人中心</h1>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="https://www.andyjin.website"
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors text-sm ml-2"
                title="返回首页"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline ml-2">返回首页</span>
              </a>
              {isUserLoggedIn && currentUser && (
                <div className="relative">
                  <button
                    onClick={toggleUserDetails}
                    className="flex items-center space-x-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">{currentUser.username.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">欢迎回来，{currentUser.username}</p>
                      <p className="text-xs opacity-80">用户ID: {currentUser.userId}</p>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform ${showUserDetails ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 用户详细信息下拉面板 */}
                  {showUserDetails && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-6">
                        <a
                          href="https://www.andyjin.website"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm:hidden mb-4 inline-flex items-center px-3 py-2 rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-700/40 text-gray-800 dark:text-gray-200 hover:bg-white/90 dark:hover:bg-gray-700 transition-colors text-sm"
                          title="返回首页"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          返回首页
                        </a>

                        {/* 用户基本信息 */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {currentUser.username.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentUser.username}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                          </div>
                        </div>

                        {/* 详细信息列表 */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-400">用户ID</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.userId}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-400">当前版本</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.currentVersion}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-400">账户状态</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              currentUser.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {currentUser.status === 'active' ? '活跃' : '非活跃'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-400">最后登录</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString('zh-CN') : '未知'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">注册时间</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString('zh-CN') : '未知'}
                            </span>
                          </div>
                        </div>

                        {/* 退出登录按钮 */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            退出登录
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {!isUserLoggedIn ? (
            /* 登录页面 */
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="w-full max-w-md">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">欢迎登录</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">请输入您的账户信息</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        用户ID
                      </label>
                      <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="请输入用户ID"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        邮箱
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入邮箱"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          登录中...
                        </div>
                      ) : (
                        '立即登录'
                      )}
                    </button>
                  </form>

                  {/* 新版引导卡片（小巧简洁） */}
                  <div className="mt-6 rounded-2xl border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">新版登录已上线</h3>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsNewFeatureOpen(true)}
                              className="inline-flex items-center rounded-lg bg-white text-blue-600 px-3 py-1.5 text-xs font-medium border border-blue-200 hover:bg-blue-50 dark:bg-transparent dark:text-blue-300 dark:border-blue-500/40 dark:hover:bg-blue-500/10 transition"
                            >
                              了解新版特性
                            </button>
                            <Link
                              href="/auth"
                              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700 transition"
                            >
                              前往新版
                            </Link>
                          </div>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-gray-600 dark:text-gray-300">
                          更佳视觉体验，建议使用新版登录。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 功能模块 */
            <div className="space-y-6">

              {/* 密钥管家模块 */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">密钥管家</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">通过独立密钥调用用户存储的所有密钥，实现安全统一管理</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsKeyModalOpen(true)}
                      disabled={!currentUser?.userId}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      管理
                    </button>
                    <button
                      onClick={() => setShowPrivacyModal(true)}
                      className="px-4 py-2 bg-white/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white/90 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      隐私协议
                    </button>
                  </div>
                </div>
              </div>

              {/* 系统维护模块 */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">系统维护</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">清除缓存、重置登录状态，解决账号显示问题</p>
                  </div>
                  <button 
                    onClick={clearCache}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium"
                  >
                    清除缓存
                  </button>
                </div>
              </div>

              {/* MFA 设置模块 */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">多因素认证（MFA）</h3>
                        {mfaEnabled !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${mfaEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40' : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/40'}`}>
                            {mfaEnabled ? '已启用' : '未启用'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">启用后，登录除账号密码外还需输入6位验证码</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            setMfaMsg('')
                            setMfaEnableModalCode('')
                            setMfaSecret('')
                            setMfaOtpauth('')
                            setIsMfaEnableModalOpen(true)
                            try {
                              const token = localStorage.getItem('accessToken')
                              if (!token) throw new Error('请先登录')
                              const res = await fetch('/api/auth/mfa/setup', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                              })
                              const data = await res.json()
                              if (!res.ok) throw new Error(data.message || '发起设置失败')
                              setMfaSecret(data.secret || '')
                              setMfaOtpauth(data.otpauth || '')
                            } catch (e: any) {
                              setMfaMsg(e.message || '网络错误')
                            }
                          }}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm"
                        >
                          去开启
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMfaMsg('')
                            setMfaDisableModalCode('')
                            setIsMfaDisableModalOpen(true)
                          }}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                        >
                          去关闭
                        </button>
                      </div>
                    </div>

                    {mfaMsg && (
                      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3">{mfaMsg}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 开启MFA弹窗：二维码 + 验证码输入 */}
              {isMfaEnableModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setIsMfaEnableModalOpen(false)} />
                  <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">开启多因素认证</h3>
                      <button onClick={() => setIsMfaEnableModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400">使用认证器App（Google/Microsoft 等）扫描二维码完成绑定，然后输入当期6位验证码完成开启。</p>
                      <div className="flex items-center justify-center">
                        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white p-2">
                          {mfaOtpauth ? <QRCodeSVG value={mfaOtpauth} size={180} includeMargin={true} /> : <div className="text-xs text-gray-500">加载二维码...</div>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">输入6位验证码</label>
                        <input
                          inputMode="numeric"
                          pattern="^[0-9]{6}$"
                          maxLength={6}
                          autoComplete="one-time-code"
                          value={mfaEnableModalCode}
                          onChange={(e) => setMfaEnableModalCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsMfaEnableModalOpen(false)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">取消</button>
                        <button
                          disabled={mfaEnableModalCode.length !== 6}
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('accessToken')
                              if (!token) throw new Error('请先登录')
                              const res = await fetch('/api/auth/mfa/enable', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: mfaEnableModalCode })
                              })
                              const data = await res.json()
                              if (!res.ok) throw new Error(data.message || '启用失败')
                              setMfaEnabled(true)
                              setMfaMsg('MFA 已启用')
                              setIsMfaEnableModalOpen(false)
                              setMfaEnableModalCode('')
                            } catch (e: any) {
                              setMfaMsg(e.message || '网络错误')
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm disabled:opacity-50"
                        >
                          确认开启
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 关闭MFA弹窗：验证码输入 */}
              {isMfaDisableModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setIsMfaDisableModalOpen(false)} />
                  <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">关闭多因素认证</h3>
                      <button onClick={() => setIsMfaDisableModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400">请输入当前时间步内认证器显示的6位验证码以关闭MFA。</p>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">输入6位验证码</label>
                        <input
                          inputMode="numeric"
                          pattern="^[0-9]{6}$"
                          maxLength={6}
                          autoComplete="one-time-code"
                          value={mfaDisableModalCode}
                          onChange={(e) => setMfaDisableModalCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsMfaDisableModalOpen(false)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">取消</button>
                        <button
                          disabled={mfaDisableModalCode.length !== 6}
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('accessToken')
                              if (!token) throw new Error('请先登录')
                              const res = await fetch('/api/auth/mfa/disable', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: mfaDisableModalCode })
                              })
                              const data = await res.json()
                              if (!res.ok) throw new Error(data.message || '关闭失败')
                              setMfaEnabled(false)
                              setMfaMsg('MFA 已关闭')
                              setIsMfaDisableModalOpen(false)
                              setMfaDisableModalCode('')
                            } catch (e: any) {
                              setMfaMsg(e.message || '网络错误')
                            }
                          }}
                          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm disabled:opacity-50"
                        >
                          确认关闭
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 右侧悬浮旧版公告（仅在未登录时显示更贴近“登录页”语境，也可登录后保留） */}
      {showLegacyNotice && (
        <div className="fixed right-2 md:right-4 top-24 md:top-28 z-30 max-w-xs w-[88vw] sm:w-80">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-amber-300/60 dark:border-amber-700/50 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-start p-4">
              <div className="mt-0.5 mr-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                  !
                </span>
              </div>
              <div className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-100">
                <span className="font-semibold mr-1">公告</span>
                用户您好，核心数据库于2025年9月16日至9月20日上午10时整进行月度维护与功能升级，期间账号管理机制不可用，请用户悉知！
              </div>
              <button
                type="button"
                onClick={() => setShowLegacyNotice(false)}
                className="ml-3 text-amber-700/70 hover:text-amber-900 dark:text-amber-200/70 dark:hover:text-amber-100"
                aria-label="关闭公告"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
          </div>
        </div>
      )}

      {/* 密钥管理弹窗 */}
      <KeyManagerModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        userId={currentUser?.userId || ''}
      />

      {/* 隐私协议弹窗 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">密钥管家隐私协议</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                aria-label="关闭"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                为保障您的数据安全与隐私，我们对“密钥管家”功能的数据处理方式做出如下说明：
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>我们仅在提供 MyBlog 与 Modern Blog 移动应用中的 AI 服务所必需的范围内收集与使用您提供的信息。</li>
                <li>我们会对您提供的 API Key 进行加密存储，不以明文保存与传输。</li>
                <li>当您从客户端请求密钥管家存储的数据时，我们会进行必要的身份核验，确保仅密钥所有者可以获取其数据。</li>
                <li>您的 API Key 仅用于为您提供密钥代管与调用相关功能，不会对外展示。</li>
                <li>除法律法规另有规定或取得您的授权外，我们不会对外提供您的个人信息。</li>
                <li>您可以随时更新或删除任意品牌的 API Key；删除账户将同步删除相关密钥记录。</li>
                <li>我们会在实现功能所需且符合法律要求的期限内保存您的信息，并在超过期限后及时删除或匿名化处理。</li>
                <li>请妥善保管与账户相关的凭据，不要在公共环境中泄露。</li>
              </ul>
              <p>
                如您继续使用“密钥管家”，即表示您已阅读并同意本隐私说明。
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新版特性弹窗 */}
      {isNewFeatureOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsNewFeatureOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">新版特性</h3>
              <button
                type="button"
                onClick={() => setIsNewFeatureOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200 space-y-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                <p>支持在网页端注册账号，流程清晰，上手更快</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                <p>更安全的注册与登录机制，显著降低用户数据泄露风险</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                <p>注册时可设置用户名、密码与邮箱，扩展用户信息维度</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                <p>不记录邮箱、密码等敏感信息；所有关键数据均加密存储</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                <p>更佳的视觉与交互体验，整体操作更顺畅</p>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNewFeatureOpen(false)}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileFooter />
    </div>
  )
} 
