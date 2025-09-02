'use client'

import { useState, useEffect } from 'react'

interface KeyManagerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface KeyResponse {
  uniqueKey: string
  message: string
  availableModels: {
    aliyun: boolean
    deepseek: boolean
    volcano: boolean
  }
}

interface KeyData {
  aliyunApiKey: string
  deepseekApiKey: string
  volcanoApiKey: string
}

interface BrandInfo {
  name: string
  label: string
  key: keyof KeyData
}

const BRANDS: BrandInfo[] = [
  { name: '阿里云通义系列', label: 'aliyun', key: 'aliyunApiKey' },
  { name: 'DeepSeek Chat', label: 'deepseek', key: 'deepseekApiKey' },
  { name: '火山引擎豆包', label: 'volcano', key: 'volcanoApiKey' }
]

export default function KeyManagerModal({ isOpen, onClose, userId }: KeyManagerModalProps) {
  const [uniqueKey, setUniqueKey] = useState<string>('')
  const [keys, setKeys] = useState<KeyData>({
    aliyunApiKey: '',
    deepseekApiKey: '',
    volcanoApiKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Set<keyof KeyData>>(new Set())
  
  // 更新弹窗状态
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null)
  const [newApiKey, setNewApiKey] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // 自动隐藏成功消息
  useEffect(() => {
    if (message && message.includes('成功')) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [message])

  // 获取用户密钥信息
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserKeys()
    }
  }, [isOpen, userId])

  const fetchUserKeys = async () => {
    try {
      const response = await fetch(`/api/keys?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // 记录哪些品牌已经保存过
        const savedBrands = new Set<keyof KeyData>()
        if (data.data.aliyun_api_key) savedBrands.add('aliyunApiKey')
        if (data.data.deepseek_api_key) savedBrands.add('deepseekApiKey')
        if (data.data.volcano_api_key) savedBrands.add('volcanoApiKey')
        
        setSavedKeys(savedBrands)
        setUniqueKey(data.data.unique_key || '')
        setIsEditing(true)
        setIsSaved(true)
      } else {
        setSavedKeys(new Set())
        setIsEditing(false)
        setIsSaved(false)
      }
    } catch (error) {
      console.error('获取密钥失败:', error)
      setMessage('获取密钥信息失败')
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')
    
    if (!userId) {
      setMessage('错误：缺少用户ID，请重新登录')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...keys
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(data.message)
        setUniqueKey(data.data.uniqueKey)
        setIsEditing(true)
        setIsSaved(true)
        
        // 将新保存的品牌添加到savedKeys中
        const newSavedKeys = new Set(savedKeys)
        Object.keys(keys).forEach(key => {
          if (keys[key as keyof KeyData]) {
            newSavedKeys.add(key as keyof KeyData)
          }
        })
        setSavedKeys(newSavedKeys)
      } else {
        setMessage(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      setMessage('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof KeyData, value: string) => {
    setKeys(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateBrand = (brand: BrandInfo) => {
    setSelectedBrand(brand)
    setNewApiKey('')
    setShowUpdateModal(true)
  }

  const handleUpdateApiKey = async () => {
    if (!selectedBrand || !newApiKey.trim()) {
      setMessage('请输入新的API密钥')
      return
    }

    setIsUpdating(true)
    setMessage('')

    try {
      const updatedKeys = {
        ...keys,
        [selectedBrand.key]: newApiKey.trim()
      }

      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updatedKeys
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setKeys(updatedKeys)
        setMessage(`${selectedBrand.name} API密钥更新成功`)
        setShowUpdateModal(false)
        setSelectedBrand(null)
        setNewApiKey('')
      } else {
        setMessage(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新失败:', error)
      setMessage('更新失败，请重试')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          {/* 标题和关闭按钮 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">密钥管家</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 密钥信息显示 */}
          {uniqueKey && (
            <div className="mb-6 space-y-4">
              {/* 唯一密钥 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  您的唯一密钥
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
                    {uniqueKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(uniqueKey)}
                    className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded text-sm"
                    title="复制密钥"
                  >
                    复制
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                请妥善保管您的唯一密钥，它将用于安全获取您的大模型API密钥。
              </p>
            </div>
          )}

          {/* API密钥输入表单 */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>使用说明：</strong>大模型API需要API Key，请从各平台获取您的API Key并填入对应字段。
            </p>
          </div>
          
          <div className="space-y-4">
            {BRANDS.map((brand) => (
              <div key={brand.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {brand.name}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="API Key (选填)"
                    value={savedKeys.has(brand.key) ? '••••••••••••••' : keys[brand.key]}
                    onChange={(e) => handleInputChange(brand.key, e.target.value)}
                    disabled={savedKeys.has(brand.key)}
                    className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      savedKeys.has(brand.key) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {savedKeys.has(brand.key) && (
                    <button
                      onClick={() => handleUpdateBrand(brand)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                    >
                      填写一个新的
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('成功') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 更新API密钥弹窗 */}
      {showUpdateModal && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                更新 {selectedBrand.name} API密钥
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                新的API密钥
              </label>
              <input
                type="text"
                placeholder="请输入新的API密钥"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateApiKey}
                disabled={isUpdating || !newApiKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 