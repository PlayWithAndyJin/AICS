'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KeyManagerModal from '@/components/KeyManagerModal'
import { useUser } from '@/contexts/UserContext'

export default function ProfilePage() {
  const { user, isLoggedIn, login, logout } = useUser()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const router = useRouter()



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

  const handleLogout = () => {
    logout()
    setUserId('')
    setEmail('')
    setShowUserDetails(false)
  }

  const clearCache = () => {
    // 清除所有本地存储
    localStorage.clear()
    // 刷新页面
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
            {isLoggedIn && user && (
              <div className="relative">
                <button
                  onClick={toggleUserDetails}
                  className="flex items-center space-x-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{user.username.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">欢迎回来，{user.username}</p>
                    <p className="text-xs opacity-80">用户ID: {user.userId}</p>
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
                      {/* 用户基本信息 */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>

                      {/* 详细信息列表 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">用户ID</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{user.userId}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">当前版本</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{user.currentVersion}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">账户状态</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            {user.status === 'active' ? '活跃' : '非活跃'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">最后登录</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '未知'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">注册时间</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '未知'}
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

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {!isLoggedIn ? (
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
                  <button 
                    onClick={() => setIsKeyModalOpen(true)}
                    disabled={!user?.userId}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    管理
                  </button>
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
        userId={user?.userId || ''}
      />
    </div>
  )
} 