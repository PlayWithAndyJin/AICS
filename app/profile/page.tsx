'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KeyManagerModal from '@/components/KeyManagerModal'
import { performLogout } from '@/lib/auth'
import { QRCodeSVG } from 'qrcode.react'
import { fetchUserInfo, setupTokenStatusCheck, type UserData } from '@/lib/tokenManager'

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
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

    if (!accessToken || !refreshToken) {
      setIsUserLoading(false)
      router.replace('/auth')
      return
    }

    setupTokenStatusCheck()

    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }

    const loadUser = async () => {
      const userData = await fetchUserInfo()
      if (userData) {
        setUser(userData)
        setError('')
      } else {
        setError('无法获取账户信息，请重新登录')
        setTimeout(() => router.replace('/auth'), 1200)
      }
      setIsUserLoading(false)
    }

    loadUser()
  }, [router])

  const isUserLoggedIn = Boolean(user)

  const handleLogout = async () => {
    await performLogout()
    setUser(null)
    setShowUserDetails(false)
    router.push('/auth')
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
      if (data) {
        setUser(data)
        if (typeof data.mfaEnabled !== 'undefined') {
          setMfaEnabled(Boolean(data.mfaEnabled))
        }
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
    <div className="min-h-screen bg-gradient-to-b from-[#101018] via-[#050505] to-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-32 w-96 h-96 rounded-full bg-[#63a1ff] opacity-30 blur-[100px]" />
        <div className="absolute -top-32 right-[-100px] w-[380px] h-[380px] rounded-full bg-[#ff79c6] opacity-30 blur-[120px]" />
        <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-[#78ffd6] opacity-20 blur-[130px]" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="uppercase tracking-[0.42em] text-[11px] text-white/40">
              Modern Account
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                个人中心
              </h1>
              <span className="hidden sm:inline text-xs text-white/45">
                Profile &amp; Security Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUserLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserDetails}
                  className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user.username.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[11px] text-white/60">已登录</span>
                    <span className="text-xs text-white truncate max-w-[120px]">
                      {user.username}
                    </span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-white/70 transition-transform ${showUserDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 用户详细信息下拉面板（玻璃态） */}
                {showUserDetails && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#050509]/92 border border-white/12 shadow-[0_26px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden z-50">
                    <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/90 to-white/60 text-[#050505] flex items-center justify-center text-sm font-semibold">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{user.username}</p>
                          <p className="text-[11px] text-white/55 truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-2 text-[12px] text-white/75">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/8">
                        <span className="text-white/55">用户 ID</span>
                        <span className="font-mono text-[11px] text-white/90 truncate max-w-[180px]">
                          {user.userId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/8">
                        <span className="text-white/55">当前版本</span>
                        <span className="text-white/90">新版账号</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/8">
                        <span className="text-white/55">账户状态</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-400/40'
                          }`}
                        >
                          {user.status === 'active' ? '活跃' : '非活跃'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-white/55">最后登录</span>
                        <span className="text-white/85">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '未知'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-white/55">注册时间</span>
                        <span className="text-white/85">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '未知'}
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl bg-white text-[#050505] py-2.5 text-[13px] font-medium hover:bg-white/92 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)]"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/18 px-3 py-1.5 text-[11px] text-white/80 hover:text-white hover:bg-white/5 transition"
              >
                <span>前往登录</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-6 pb-32 pt-2 max-w-5xl mx-auto w-full">
          {!isUserLoggedIn ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-md rounded-3xl bg-[#050509]/88 border border-white/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] px-8 py-9 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#63a1ff] to-[#ff79c6] flex items-center justify-center shadow-[0_18px_40px_rgba(0,0,0,0.8)]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">需要登录</h2>
                  <p className="mt-2 text-sm text-white/65">
                    {isUserLoading ? '正在检测您的登录状态，请稍候…' : '登录状态已失效，请前往新版账号系统重新登录。'}
                  </p>
                </div>
                {error && (
                  <div className="text-sm text-rose-300 bg-rose-900/20 border border-rose-700/50 px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/auth')}
                    className="w-full bg-white text-[#050505] py-3 px-4 rounded-2xl text-sm font-medium hover:bg-white/90 shadow-[0_22px_60px_-28px_rgba(255,255,255,0.95)] transition"
                  >
                    前往登录
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewFeatureOpen(true)}
                    className="w-full inline-flex items-center justify-center rounded-2xl bg-white/5 text-white/85 px-4 py-2.5 text-xs font-medium border border-white/15 hover:bg-white/8 transition"
                  >
                    了解新版特性
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 功能模块 */
            <div className="space-y-6">

              {/* 密钥管家模块 */}
              <div className="rounded-3xl bg-[#050509]/78 border border-white/10 backdrop-blur-2xl px-6 py-5 sm:px-7 sm:py-6 shadow-[0_26px_70px_rgba(0,0,0,0.85)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#63a1ff]/18 to-[#78ffd6]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-1.5">密钥管家</h3>
                    <p className="text-xs sm:text-sm text-white/60">通过独立密钥调用用户存储的所有密钥，实现安全统一管理</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsKeyModalOpen(true)}
                      disabled={!user?.userId}
                      className="px-4 py-2 rounded-2xl bg-white text-[#050505] text-xs sm:text-sm font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      管理
                    </button>
                    <button
                      onClick={() => setShowPrivacyModal(true)}
                      className="px-4 py-2 rounded-2xl bg-white/5 text-white/80 text-xs sm:text-sm font-medium border border-white/20 hover:bg-white/10 transition"
                    >
                      隐私协议
                    </button>
                  </div>
                </div>
              </div>

              {/* 系统维护模块 */}
              <div className="rounded-3xl bg-[#050509]/78 border border-white/10 backdrop-blur-2xl px-6 py-5 sm:px-7 sm:py-6 shadow-[0_26px_70px_rgba(0,0,0,0.85)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/25 to-orange-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-1.5">系统维护</h3>
                    <p className="text-xs sm:text-sm text-white/65">清除缓存、重置登录状态，解决账号显示问题</p>
                  </div>
                  <button 
                    onClick={clearCache}
                    className="px-4 py-2 rounded-2xl bg-amber-400/15 text-amber-100 text-xs sm:text-sm font-medium border border-amber-300/40 hover:bg-amber-400/25 transition"
                  >
                    清除缓存
                  </button>
                </div>
              </div>

              {/* MFA 设置模块 */}
              <div className="rounded-3xl bg-[#050509]/78 border border-white/10 backdrop-blur-2xl px-6 py-5 sm:px-7 sm:py-6 shadow-[0_26px_70px_rgba(0,0,0,0.85)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.95)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400/25 to-indigo-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 20a7 7 0 10-14 0h14z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-white">多因素认证（MFA）</h3>
                        {mfaEnabled !== null && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                            mfaEnabled
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                              : 'bg-white/5 text-white/70 border-white/20'
                          }`}>
                            {mfaEnabled ? '已启用' : '未启用'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/65 mt-1">
                      启用后可以提升账户安全性，通过多重验证机制有效防止未授权访问，降低数据泄露风险。
                    </p>

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
                          className="px-4 py-2 rounded-2xl bg-white text-[#050505] text-xs sm:text-sm font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)]"
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
                          className="px-4 py-2 rounded-2xl bg-white/6 text-white/85 text-xs sm:text-sm hover:bg-white/10 transition"
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
                  <div className="absolute inset-0 bg-black/60" onClick={() => setIsMfaEnableModalOpen(false)} />
                  <div className="relative w-full max-w-md rounded-[28px] bg-[#050509]/92 border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-white">开启多因素认证</h3>
                      <button onClick={() => setIsMfaEnableModalOpen(false)} className="text-white/60 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-5 py-4 space-y-4 text-white/80 text-sm">
                      <p className="text-xs text-white/70">使用认证器 App（Google Authenticator、Microsoft Authenticator 等）扫描二维码完成绑定，然后输入当期 6 位验证码完成开启。</p>
                      <div className="flex items-center justify-center">
                        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                          {mfaOtpauth ? <QRCodeSVG value={mfaOtpauth} size={180} includeMargin={true} /> : <div className="text-xs text-white/60">加载二维码...</div>}
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <label className="block text-white/70">输入 6 位验证码</label>
                        <input
                          inputMode="numeric"
                          pattern="^[0-9]{6}$"
                          maxLength={6}
                          autoComplete="one-time-code"
                          value={mfaEnableModalCode}
                          onChange={(e) => setMfaEnableModalCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder=""
                          className="w-full px-3 py-2 rounded-2xl border border-white/20 bg-white/5 text-sm text-white tracking-[0.35em] placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setIsMfaEnableModalOpen(false)} className="px-3 py-2 rounded-2xl border border-white/15 text-white/70 hover:bg-white/5 hover:text-white transition">
                          取消
                        </button>
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
                          className="px-4 py-2 rounded-2xl bg-white text-[#050505] text-xs font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                  <div className="absolute inset-0 bg-black/60" onClick={() => setIsMfaDisableModalOpen(false)} />
                  <div className="relative w-full max-w-md rounded-[28px] bg-[#050509]/92 border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-white">关闭多因素认证</h3>
                      <button onClick={() => setIsMfaDisableModalOpen(false)} className="text-white/60 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-5 py-4 space-y-4 text-white/80 text-sm">
                      <p className="text-xs text-white/70">请输入当前时间步内认证器显示的 6 位验证码以关闭 MFA。</p>
                      <div className="space-y-2 text-xs">
                        <label className="block text-white/70">输入 6 位验证码</label>
                        <input
                          inputMode="numeric"
                          pattern="^[0-9]{6}$"
                          maxLength={6}
                          autoComplete="one-time-code"
                          value={mfaDisableModalCode}
                          onChange={(e) => setMfaDisableModalCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder=""
                          className="w-full px-3 py-2 rounded-2xl border border-white/20 bg-white/5 text-sm text-white tracking-[0.35em] placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setIsMfaDisableModalOpen(false)} className="px-3 py-2 rounded-2xl border border-white/15 text-white/70 hover:bg-white/5 hover:text-white transition">
                          取消
                        </button>
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
                          className="px-4 py-2 rounded-2xl bg-white text-[#050505] text-xs font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
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

      {/* 右侧悬浮旧版公告 */}
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
                用户您好，新版账号管理机制现已支持MFA多因素认证，用户可以在个人中心开启或关闭MFA，请用户悉知！
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
        userId={user?.userId || ''}
      />

      {/* 隐私协议弹窗 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-[32px] bg-[#050509]/95 border border-white/12 shadow-[0_36px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">密钥管家隐私协议</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-white/70 hover:text-white"
                aria-label="关闭"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-sm text-white/80">
              <p className="text-white/85">
                为保障您的数据安全与隐私，我们对“密钥管家”功能的数据处理方式做出如下说明：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/70">
                <li>我们仅在提供 MyBlog 与 Modern Blog 移动应用中的 AI 服务所必需的范围内收集与使用您提供的信息。</li>
                <li>我们会对您提供的 API Key 进行加密存储，不以明文保存与传输。</li>
                <li>当您从客户端请求密钥管家存储的数据时，我们会进行必要的身份核验，确保仅密钥所有者可以获取其数据。</li>
                <li>您的 API Key 仅用于为您提供密钥代管与调用相关功能，不会对外展示。</li>
                <li>除法律法规另有规定或取得您的授权外，我们不会对外提供您的个人信息。</li>
                <li>您可以随时更新或删除任意品牌的 API Key；删除账户将同步删除相关密钥记录。</li>
                <li>我们会在实现功能所需且符合法律要求的期限内保存您的信息，并在超过期限后及时删除或匿名化处理。</li>
                <li>请妥善保管与账户相关的凭据，不要在公共环境中泄露。</li>
              </ul>
              <p className="text-white/85">
                如您继续使用“密钥管家”，即表示您已阅读并同意本隐私说明。
              </p>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-white text-[#050505] text-sm font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)]"
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
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsNewFeatureOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#050509]/92 border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">新版特性</h3>
              <button
                type="button"
                onClick={() => setIsNewFeatureOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-white/80 space-y-3">
              {[
                '支持在网页端注册账号，流程清晰，上手更快',
                '更安全的注册与登录机制，显著降低用户数据泄露风险',
                '注册时可设置用户名、密码与邮箱，扩展用户信息维度',
                '不记录邮箱、密码等敏感信息；所有关键数据均加密存储',
                '更佳的视觉与交互体验，整体操作更顺畅'
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNewFeatureOpen(false)}
                className="rounded-2xl bg-white text-[#050505] px-4 py-2 text-sm font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)]"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 w-full px-3">
        <div className="pointer-events-auto mx-auto w-full max-w-[540px] px-4 sm:px-6 py-2 sm:py-3 rounded-[999px] bg-black/35 border border-white/14 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 sm:gap-4 text-[11px] sm:text-[13px] text-white/80">
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
            className="inline-flex items-center gap-1.5 text-white hover:text-white font-medium whitespace-nowrap"
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
