"use client"
import { fetchUserInfo } from '@/lib/tokenManager'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileFooter from '@/components/ProfileFooter'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [needTotp, setNeedTotp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordLogin, setShowPasswordLogin] = useState(false)
  const [showPasswordRegister, setShowPasswordRegister] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isUnsupportedOpen, setIsUnsupportedOpen] = useState(false)
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

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          deviceId,
          ...(totpCode.trim() ? { totpCode: totpCode.trim() } : {})
        })
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = (data && data.message) ? String(data.message) : ''
        if (msg.includes('MFA required')) {
          setNeedTotp(true)
          setError('该账户已开启MFA，请输入当期30秒内的6位验证码')
          return
        }
        if (msg.includes('Invalid TOTP')) {
          setNeedTotp(true)
          setError('验证码错误，请在弹窗中重新输入当前30秒内的6位码')
          return
        }
        throw new Error(msg || '登录失败')
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      const userData = await fetchUserInfo()

      if (userData) {
        setNeedTotp(false)
        setTotpCode('')
        setSuccess("登录成功")
        setTimeout(() => router.push("/profile"), 600)
      } else {
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
        setNeedTotp(false)
        setTotpCode('')
        setSuccess("登录成功")
        setTimeout(() => router.push("/profile"), 600)
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const renderMfaModal = () => {
    if (!needTotp) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={() => setNeedTotp(false)}></div>
        <div className="relative w-full max-w-sm rounded-[28px] bg-[#050509]/90 border border-white/12 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">输入 MFA 验证码</h3>
            <button
              onClick={() => setNeedTotp(false)}
              className="text-white/50 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-white/60">
              请打开认证器 App（如 Google Authenticator、Microsoft Authenticator 等），输入当前 30 秒内的 6 位验证码完成第二步验证。
            </p>
            <div>
              <label className="block text-sm text-white/80 mb-1">6 位验证码</label>
              <input
                inputMode="numeric"
                pattern="^[0-9]{6}$"
                maxLength={6}
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder=""
                className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/60 text-sm tracking-[0.35em] text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-white/35 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNeedTotp(false)}
              className="px-3 py-2 rounded-xl border border-white/15 text-sm text-white/80 hover:bg-white/5"
            >
              取消
            </button>
            <button
              type="button"
              disabled={totpCode.length !== 6 || isLoading}
              onClick={() => {
                const form = document.getElementById('login-panel') as HTMLFormElement | null
                form?.requestSubmit()
              }}
              className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_14px_30px_-20px_rgba(255,255,255,0.9)]"
            >
              {isLoading ? '验证中...' : '确认验证'}
            </button>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-gradient-to-b from-[#101018] via-[#050505] to-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-40 -left-24 w-80 h-80 rounded-full bg-[#63a1ff] opacity-30 blur-[90px]" />

        <div className="absolute -top-32 right-[-60px] w-80 h-80 rounded-full bg-[#ff79c6] opacity-30 blur-[95px]" />

        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#78ffd6] opacity-25 blur-[110px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 主体内容 - 居中卡片 */}
        <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-xl">
              <div className="bg-[#0f0f0f]/90 backdrop-blur-2xl rounded-[32px] shadow-[0_40px_80px_-35px_rgba(0,0,0,0.85)] p-8 border border-white/5 transition-transform hover:-translate-y-0.5">
                {/* 标题与说明 */}
                <div className="text-center mb-8 space-y-2">
                  <p className="uppercase tracking-[0.45em] text-[11px] text-white/40">Modern Account</p>
                  <h1 className="text-[32px] sm:text-[36px] font-semibold text-white tracking-tight">{activeTab === 'login' ? '欢迎登录' : '欢迎注册'}</h1>
                  <p className="text-sm text-white/60">安全·纯净·直观的账户体验，专为全平台同步而设计。</p>
                </div>

                {/* Tabs */}
                <div className="relative mb-6 bg-[#090909] rounded-2xl p-1 flex ring-1 ring-white/10" role="tablist">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                    aria-selected={activeTab === 'login'}
                    aria-controls="login-panel"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                    aria-selected={activeTab === 'register'}
                    aria-controls="register-panel"
                  >
                    注册
                  </button>
                </div>

                {error && (
                  <div className="mb-4 text-[#ff8ba0] text-sm bg-[#ff54701a] p-4 rounded-xl border border-[#ff547033]">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 text-emerald-300 text-sm bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                    {success}
                  </div>
                )}

                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} id="login-panel" className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">用户名或邮箱</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="请输入用户名或邮箱"
                          className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-black/40 text-white placeholder-white/30 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">密码</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                          </svg>
                        </div>
                        <input
                          type={showPasswordLogin ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="输入密码"
                          className="w-full pl-10 pr-12 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-black/40 text-white placeholder-white/30 transition-all duration-200 shadow-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                          aria-label={showPasswordLogin ? '隐藏密码' : '显示密码'}
                        >
                          {showPasswordLogin ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.375-2.03 1.05-2.925M6.223 6.223A10.026 10.026 0 0112 5c5 0 9 4 9 7 0 1.162-.41 2.256-1.134 3.2M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 06 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white text-black py-3 px-4 rounded-2xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base shadow-[0_20px_45px_-25px_rgba(255,255,255,0.9)]"
                    >
                      {isLoading ? '登录中...' : '登录'}
                    </button>
                    <p className="text-xs text-white/40 text-center">
                      登录即表示同意我们的
                      <button type="button" onClick={() => setIsPrivacyOpen(true)} className="ml-1 underline text-white hover:opacity-80">
                        隐私政策
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} id="register-panel" className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">用户名</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="请输入用户名"
                          className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-black/40 text-white placeholder-white/30 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">密码</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                          </svg>
                        </div>
                        <input
                          type={showPasswordRegister ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入密码"
                          className="w-full pl-10 pr-12 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-black/40 text-white placeholder-white/30 transition-all duration-200 shadow-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                          aria-label={showPasswordRegister ? '隐藏密码' : '显示密码'}
                        >
                          {showPasswordRegister ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.03.375-2.03 1.05-2.925M6.223 6.223A10.026 10.026 0 0112 5c5 0 9 4 9 7 0 1.162-.41 2.256-1.134 3.2M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 06 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-white/40">建议使用至少 8 位，包含大小写字母与数字的强密码</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">邮箱（可选）</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4M4 8l8-4 8 4v8l-8 4-8-4V8z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="请输入邮箱"
                          className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-black/40 text-white placeholder-white/30 transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white text-black py-3 px-4 rounded-2xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base shadow-[0_20px_45px_-25px_rgba(255,255,255,0.9)]"
                    >
                      {isLoading ? '注册中...' : '注册'}
                    </button>
                    <p className="text-xs text-white/40 text-center">
                      注册即表示同意我们的
                      <button type="button" onClick={() => setIsPrivacyOpen(true)} className="ml-1 underline text-white hover:opacity-80">
                        隐私政策
                      </button>
                    </p>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* 隐私政策弹窗 */}
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsPrivacyOpen(false)}></div>
            <div className="relative w-full max-w-2xl rounded-[32px] bg-[#050509]/92 border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">隐私政策</h3>
                <button onClick={() => setIsPrivacyOpen(false)} className="text-white/60 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-sm text-white/75 space-y-4 leading-relaxed">
                <p className="text-white/70">我们非常重视您的隐私与数据安全，仅会在提供服务所必需的情况下收集与使用您的信息，并采取合理的安全措施保护您的数据。</p>
                <div className="space-y-3 text-white/70">
                  <p>1. <span className="text-white">收集信息范围：</span>包括但不限于您在注册、登录与使用服务时主动提供的账号信息与必要的操作日志。</p>
                  <p>2. <span className="text-white">使用信息目的：</span>用于身份验证、服务提供与改进、客户支持与安全风控等。</p>
                  <p>3. <span className="text-white">数据存储与保护：</span>我们遵循最小化原则，采用必要的技术与管理措施保护数据安全，并尽量缩短数据保留时间。</p>
                  <p>4. <span className="text白">您的权利：</span>您可通过我们进行信息查询、更正、删除或撤回授权等操作。</p>
                </div>
                <p className="text-white/70">
                  如对本隐私政策有任何疑问，请
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(true)}
                    className="mx-1 underline text-white hover:opacity-80"
                  >
                    联系我们
                  </button>
                  。
                </p>
              </div>
              <div className="px-6 py-4 border-t border-white/10 flex justify-end">
                <button onClick={() => setIsPrivacyOpen(false)} className="px-5 py-2.5 rounded-xl bg-white text-[#050505] text-sm font-medium hover:bg-white/90 shadow-[0_16px_35px_-25px_rgba(255,255,255,0.9)]">我已了解</button>
              </div>
            </div>
          </div>
        )}

        {/* 联系我们弹窗 */}
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsContactOpen(false)}></div>
            <div className="relative w-full max-w-md rounded-[28px] bg-[#050509]/92 border border-white/10 shadow-[0_28px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">联系我们</h3>
                <button onClick={() => setIsContactOpen(false)} className="text-white/60 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-4 text-sm text-white/75 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4M4 8l8-4 8 4v8l-8 4-8-4V8z" />
                  </svg>
                  <span>邮箱：<a href="mailto:2358155969@qq.com" className="underline text-white hover:text-white/80">2358155969@qq.com</a></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l3 7-2 5h11l-2-5 3-7h2" />
                  </svg>
                  <span>联系电话：</span>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-white/10 flex justify-end">
                <button onClick={() => setIsContactOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#050505] hover:bg-white/90 text-sm font-medium shadow-[0_12px_30px_-20px_rgba(255,255,255,0.9)]">关闭</button>
              </div>
            </div>
          </div>
        )}

        {/* MFA 验证码弹窗 */}
        {renderMfaModal()}

        {/* 暂不支持功能弹窗 */}
        {isUnsupportedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsUnsupportedOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">当前暂不支持的功能</h3>
                <button onClick={() => setIsUnsupportedOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-600" />
                  <p>网页端不支持显示用户头像</p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setIsUnsupportedOpen(false)} className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">我已了解</button>
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 w-full px-3">
          <div className="pointer-events-auto mx-auto w-full max-w-[540px] px-4 sm:px-6 py-2 sm:py-3 rounded-[999px] bg-black/35 border border-white/12 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 sm:gap-4 text-[11px] sm:text-[13px] text-white/80">
            <span className="w-full sm:w-auto text-center sm:text-left text-white/70">
              Modern Account · Built by AndyJin
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-[150px]">
                <iframe
                  src="https://status.andyjin.website/badge?theme=system"
                  width="150"
                  height="24"
                  frameBorder="0"
                  scrolling="no"
                  style={{ colorScheme: 'normal', width: '100%', height: '24px' }}
                ></iframe>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text白 hover:text白 font-medium whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>返回首页</span>
            </button>
          </div>
        </div>
      </div>
  )
} 
