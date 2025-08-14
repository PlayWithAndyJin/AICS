'use client'

import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* 聊天界面 */}
          <ChatInterface />
        </div>
      </div>
    </main>
  )
} 
