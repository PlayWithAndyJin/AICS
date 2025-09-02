'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: number
  userId: string
  username: string
  email: string
  currentVersion: string
  status: string
  lastLoginAt: string
  loginCount: number
  createdAt: string
  updatedAt: string
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (userId: string, email: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USERS_API_KEY = process.env.NEXT_PUBLIC_USERS_API_KEY as string
if (!USERS_API_KEY) {
  console.warn('Missing NEXT_PUBLIC_USERS_API_KEY environment variable')
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化时检查本地存储的用户状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch (e) {
        console.error('解析用户数据失败:', e)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  // 登录函数
  const login = async (userId: string, email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('https://www.andyjin.website/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': USERS_API_KEY
        },
        body: JSON.stringify({
          userId: userId.trim(),
          email: email.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setIsLoggedIn(true)
        localStorage.setItem('user', JSON.stringify(data.user))
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: data.message || '登录失败' }
      }
    } catch (err) {
      console.error('Login error:', err)
      return { success: false, message: '网络错误，请稍后重试' }
    }
  }

  // 登出函数
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
  }

  // 刷新用户信息
  const refreshUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch (e) {
        console.error('刷新用户数据失败:', e)
        localStorage.removeItem('user')
        setUser(null)
        setIsLoggedIn(false)
      }
    }
  }

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    refreshUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 
