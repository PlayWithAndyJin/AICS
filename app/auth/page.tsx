"use client"
import { fetchUserInfo } from '@/lib/tokenManager'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileFooter from '@/components/ProfileFooter'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordLogin, setShowPasswordLogin] = useState(false)
  const [showPasswordRegister, setShowPasswordRegister] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!identifier.trim() || !password.trim()) {
      setError('请输入账号和密码')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || '登录失败')
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      // 使用新的token管理工具获取用户信息
      const userData = await fetchUserInfo()
      
      if (userData) {
        setSuccess("登录成功")
        setTimeout(() => router.push("/profile"), 600)
      } else {
        // 如果获取用户信息失败，使用默认用户信息
        const defaultUserData = {
          userId: "user-" + Date.now(),
          username: identifier.split("@")[0] || "用户",
          email: identifier.includes("@") ? identifier : "",
          status: "active",
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        localStorage.setItem("user", JSON.stringify(defaultUserData))
        setSuccess("登录成功")
        setTimeout(() => router.push("/profile"), 600)
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码（邮箱选填）')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim(), email: email.trim() || undefined })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || '注册失败')
      }

      setSuccess('注册成功，请使用新账户登录')
      setActiveTab('login')
      setIdentifier(username.trim())
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
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
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
              {/* 标题与说明 */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeTab === 'login' ? '欢迎登录' : '欢迎注册'}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">使用您的账户体验更多功能与个性化服务</p>
              </div>

              {/* Tabs */}
              <div className="relative mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex" role="tablist">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'}`}
                  aria-selected={activeTab === 'login'}
                  aria-controls="login-panel"
                >
                  登录
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'}`}
                  aria-selected={activeTab === 'register'}
                  aria-controls="register-panel"
                >
                  注册
                </button>
              </div>

              {error && (
                <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  {success}
                </div>
              )}

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} id="login-panel" className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名或邮箱</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="请输入用户名或邮箱"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                        </svg>
                      </div>
                      <input
                        type={showPasswordLogin ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="输入密码"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label={showPasswordLogin ? '隐藏密码' : '显示密码'}
                      >
                        {showPasswordLogin ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.375-2.03 1.05-2.925M6.223 6.223A10.026 10.026 0 0112 5c5 0 9 4 9 7 0 1.162-.41 2.256-1.134 3.2M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    登录即表示同意我们的
                    <button type="button" onClick={() => setIsPrivacyOpen(true)} className="ml-1 underline text-blue-600 dark:text-blue-400 hover:opacity-80">
                      隐私政策
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} id="register-panel" className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                        </svg>
                      </div>
                      <input
                        type={showPasswordRegister ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label={showPasswordRegister ? '隐藏密码' : '显示密码'}
                      >
                        {showPasswordRegister ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.375-2.03 1.05-2.925M6.223 6.223A10.026 10.026 0 0112 5c5 0 9 4 9 7 0 1.162-.41 2.256-1.134 3.2M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">建议使用至少 8 位，包含大小写字母与数字的强密码</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱（可选）</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4M4 8l8-4 8 4v8l-8 4-8-4V8z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入邮箱"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? '注册中...' : '注册'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    注册即表示同意我们的
                    <button type="button" onClick={() => setIsPrivacyOpen(true)} className="ml-1 underline text-blue-600 dark:text-blue-400 hover:opacity-80">
                      隐私政策
                    </button>
                  </p>
                </form>
              )}

              {/* 页脚操作 */}
              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={() => router.push('/profile')}
                  className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回个人中心
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 隐私政策弹窗 */}
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsPrivacyOpen(false)}></div>
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">隐私政策</h3>
                <button onClick={() => setIsPrivacyOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <p>我们非常重视您的隐私与数据安全，仅会在提供服务所必需的情况下收集与使用您的信息，并采取合理的安全措施保护您的数据。</p>
                <p>1. 收集信息范围：包括但不限于您在注册、登录与使用服务时主动提供的账号信息与必要的操作日志。</p>
                <p>2. 使用信息目的：用于身份验证、服务提供与改进、客户支持与安全风控等。</p>
                <p>3. 数据存储与保护：我们遵循最小化原则，采用必要的技术与管理措施保护数据安全，并尽量缩短数据保留时间。</p>
                <p>4. 您的权利：您可通过联系我们进行信息查询、更正、删除或撤回授权等操作。</p>
                <p>如对本隐私政策有任何疑问，请联系我们。</p>
              </div>
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setIsPrivacyOpen(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">我已了解</button>
              </div>
            </div>
          </div>
        )}
        {/* 页脚 */}
        <ProfileFooter />
      </div>
    </div>
  )
} 