'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KeyManagerModal from '@/components/KeyManagerModal'
import { useUser } from '@/contexts/UserContext'
import ProfileFooter from '@/components/ProfileFooter'
import Link from 'next/link'
import { performLogout, isNewAuthSystem } from '@/lib/auth'
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
  const router = useRouter()

  // 检查是否使用新认证系统
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user')
    
    if (accessToken && refreshToken) {
      setupTokenStatusCheck()
      
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

  // 检查是否已登录（支持新旧系统）
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

                  <div className="mt-4">
                    <Link
                      href="/auth"
                      className="w-full inline-flex items-center justify-center bg-white text-blue-600 py-3 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-lg"
                    >
                      前往新版登录/注册
                    </Link>
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
            </div>
          )}
        </div>
      </div>

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

      <ProfileFooter />
    </div>
  )
} 
