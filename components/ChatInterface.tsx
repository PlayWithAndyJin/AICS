'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '发送失败')
      }

      const data = await response.json()
      
      // 保存会话ID（如果是新会话）
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发送消息失败，请稍后重试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#050509]/70 backdrop-blur-2xl shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* 聊天消息区域 */}
      <div className="h-[calc(100vh-15rem)] sm:h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-y-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5 sm:space-y-7">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="mx-auto inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#63a1ff]/25 to-[#ff79c6]/25 border border-white/10 mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                你好！我是小Mo
              </h3>
              <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">
                有什么可以帮助你的吗？
              </p>
              <p className="text-xs text-white/50">
                你可以输入"小Mo，小Mo"试试
              </p>
            </div>
          ) : (
            <>
              {/* 清除会话按钮 */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setMessages([])
                    setSessionId('')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 bg-white/5 border border-white/15 rounded-2xl hover:bg-white/10 transition"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  新对话
                </button>
              </div>
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 sm:space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-[#63a1ff] to-[#ff79c6] border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div
                      className={`max-w-[min(85vw,600px)] min-w-[200px] rounded-[24px] px-4 py-3 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-[#63a1ff]/90 to-[#ff79c6]/90 text-white shadow-[0_15px_40px_rgba(0,0,0,0.35)]'
                          : 'bg-white/5 border border-white/10 text-white/85 shadow-[0_12px_35px_rgba(0,0,0,0.3)]'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-white/50'}`}>
                        {message.timestamp.toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div 
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-[24px] max-w-[min(85vw,600px)] min-w-[200px] shadow-[0_12px_35px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-slow"></div>
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-slow" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-white/65 font-medium">小Mo 正在思考中...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

      {/* 输入区域 */}
      <div className="border-t border-white/10 px-4 sm:px-6 py-5 bg-white/[0.04]">
        <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
          <div className="flex-1 relative group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入您的问题..."
              rows={1}
              className="w-full pr-14 pl-4 py-3 resize-none min-h-[60px] rounded-2xl border border-white/12 bg-gradient-to-br from-[#0d0d16]/92 via-[#09090f]/88 to-[#0d0d16]/92 text-sm text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-transparent transition shadow-[0_28px_55px_-35px_rgba(0,0,0,0.95)]"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none transition group-focus-within:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0 px-6 py-3 rounded-2xl bg-white text-[#050505] font-semibold hover:bg-white/90 shadow-[0_24px_50px_-28px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {/* 输入提示 */}
        <div className="mt-2 text-center">
          <p className="text-xs text-white/50">
            按 Enter 发送消息，Shift + Enter 换行
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            Built By AndyJin
          </p>
        </div>
      </div>
    </div>
  )
} 
