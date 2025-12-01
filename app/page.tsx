'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { fetchUserInfo, type UserData } from '@/lib/tokenManager'

function SupportToolbar() {
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserInfo()
      if (data) setUser(data)
    }
    loadUser()
  }, [])

  return (
    <div className="pointer-events-none fixed top-4 right-3 sm:right-6 z-30">
      <div className="pointer-events-auto flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <div className="hidden sm:flex items-center rounded-2xl bg-black/45 border border-white/12 backdrop-blur-2xl px-4 py-1.5">
          <iframe
            src="https://status.andyjin.website/badge?theme=system"
            width="150"
            height="24"
            frameBorder="0"
            scrolling="no"
            style={{ colorScheme: 'normal' }}
          ></iframe>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://www.andyjin.website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl border border-white/15 text-white/85 hover:bg-white/10 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>返回主页</span>
          </a>
          <a
            href="/feedback"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white text-[#050505] font-medium hover:bg-white/90 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>问题反馈</span>
          </a>
          <button
            onClick={() => router.push(user ? '/profile' : '/auth')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl border border-white/15 text-white/85 hover:bg-white/10 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{user ? '个人中心' : '前往登录'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#101018] via-[#050505] to-[#050505] text-white relative overflow-hidden">
      <SupportToolbar />

      {/* 背景柔光 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-32 w-96 h-96 rounded-full bg-[#63a1ff] opacity-35 blur-[95px]" />
        <div className="absolute -top-32 right-[-90px] w-[380px] h-[380px] rounded-full bg-[#ff79c6] opacity-35 blur-[120px]" />
        <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#78ffd6] opacity-30 blur-[140px]" />
        <div className="absolute top-1/3 left-[15%] w-64 h-64 rounded-full bg-[#9c6bff] opacity-25 blur-[110px]" />
        <div className="absolute bottom-16 right-[12%] w-72 h-72 rounded-full bg-[#5ee7df] opacity-20 blur-[100px]" />
        <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle_at_20%_20%,rgba(99,161,255,0.4),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,121,198,0.35),transparent_60%),radial-gradient(circle_at_60%_85%,rgba(120,255,214,0.3),transparent_55%)]" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 px-3 sm:px-6 py-8 sm:py-12 pt-20 sm:pt-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center space-y-2">
            <p className="uppercase tracking-[0.45em] text-[11px] text-white/40">Modern Support</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">小Mo · AI 客服助手</h1>
            <p className="text-sm text-white/60">通义千问驱动 · 24*7 智能支持 · 全平台一致体验</p>
          </div>
          <div className="bg-[#0f0f10]/85 backdrop-blur-2xl rounded-[32px] border border-white/5 shadow-[0_40px_80px_-35px_rgba(0,0,0,0.85)] p-4 sm:p-6">
            <ChatInterface />
          </div>
        </div>
      </div>
    </main>
  )
}
