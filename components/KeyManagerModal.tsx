'use client'

import { useState, useEffect } from 'react'

interface KeyManagerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface UniqueKeyResponse {
  uniqueKey: string
  isActive: boolean
}

interface ApiKeyResponse {
  provider: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  apiKey?: string
}

interface AllKeysResponse {
  uniqueKey: {
    uniqueKey: string
    isActive: boolean
  }
  apiKeys: ApiKeyResponse[]
}

interface KeyData {
  aliyunApiKey: string
  deepseekApiKey: string
  volcengineApiKey: string
}

interface BrandInfo {
  name: string
  label: string
  key: keyof KeyData
  provider: string
}

const BRANDS: BrandInfo[] = [
  { name: '阿里云通义系列', label: 'aliyun', key: 'aliyunApiKey', provider: 'aliyun' },
  { name: 'DeepSeek Chat', label: 'deepseek', key: 'deepseekApiKey', provider: 'deepseek' },
  { name: '火山引擎豆包', label: 'volcengine', key: 'volcengineApiKey', provider: 'volcengine' }
]


export default function KeyManagerModal({ isOpen, onClose, userId }: KeyManagerModalProps) {
  const [uniqueKey, setUniqueKey] = useState<string>('')
  const [keys, setKeys] = useState<KeyData>({
    aliyunApiKey: '',
    deepseekApiKey: '',
    volcengineApiKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null)
  const [newApiKey, setNewApiKey] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Set<keyof KeyData>>(new Set())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (message && message.includes('成功')) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserKeys()
    }
  }, [isOpen, userId])

  // 注意：不再需要加载 CryptoJS 库，解密功能已移至服务端

  const fetchUserKeys = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setMessage('请先登录')
        return
      }


      const uniqueKeyResponse = await fetch('/api/proxy/keys/unique-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!uniqueKeyResponse.ok) {
        throw new Error('获取唯一密钥失败')
      }

      const uniqueKeyData: UniqueKeyResponse = await uniqueKeyResponse.json()
      setUniqueKey(uniqueKeyData.uniqueKey)
      const allKeysResponse = await fetch('/api/proxy/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uniqueKey: uniqueKeyData.uniqueKey
        })
      })

      if (allKeysResponse.ok) {
        const allKeysData: AllKeysResponse = await allKeysResponse.json()
        
        const savedBrands = new Set<keyof KeyData>()
        const newKeys: KeyData = {
          aliyunApiKey: '',
          deepseekApiKey: '',
          volcengineApiKey: ''
        }

        allKeysData.apiKeys.forEach(apiKey => {
          switch (apiKey.provider) {
            case 'aliyun':
              savedBrands.add('aliyunApiKey')
              newKeys.aliyunApiKey = apiKey.apiKey || ''
              break
            case 'deepseek':
              savedBrands.add('deepseekApiKey')
              newKeys.deepseekApiKey = apiKey.apiKey || ''
              break
            case 'volcengine':
              savedBrands.add('volcengineApiKey')
              newKeys.volcengineApiKey = apiKey.apiKey || ''
              break
          }
        })

        setSavedKeys(savedBrands)
        setKeys(newKeys)
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

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      setMessage('请先登录')
      setIsLoading(false)
      return
    }
    
    try {
      const uniqueKeyResponse = await fetch('/api/proxy/keys/unique-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!uniqueKeyResponse.ok) {
        throw new Error('获取唯一密钥失败')
      }

      const uniqueKeyData: UniqueKeyResponse = await uniqueKeyResponse.json()
      const currentUniqueKey = uniqueKeyData.uniqueKey

      const savePromises = []
      const newSavedKeys = new Set(savedKeys)

      for (const brand of BRANDS) {
        const apiKey = keys[brand.key]
        if (apiKey && apiKey.trim()) {
          const savePromise = fetch('/api/proxy/keys', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uniqueKey: currentUniqueKey,
              provider: brand.provider,
              apiKey: apiKey.trim()
            })
          })
          savePromises.push(savePromise)
          newSavedKeys.add(brand.key)
        }
      }

      if (savePromises.length === 0) {
        setMessage('请至少填写一个API密钥')
        setIsLoading(false)
        return
      }

      const responses = await Promise.all(savePromises)
      const allSuccessful = responses.every(response => response.ok)

      if (allSuccessful) {
        setMessage('API密钥保存成功')
        setUniqueKey(currentUniqueKey)
        setIsEditing(true)
        setIsSaved(true)
        setSavedKeys(newSavedKeys)
      } else {
        setMessage('部分API密钥保存失败，请重试')
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
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setMessage('请先登录')
        setIsUpdating(false)
        return
      }

      // 首先获取唯一密钥
      const uniqueKeyResponse = await fetch('/api/proxy/keys/unique-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!uniqueKeyResponse.ok) {
        throw new Error('获取唯一密钥失败')
      }

      const uniqueKeyData: UniqueKeyResponse = await uniqueKeyResponse.json()
      const currentUniqueKey = uniqueKeyData.uniqueKey

      const response = await fetch('/api/proxy/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueKey: currentUniqueKey,
          provider: selectedBrand.provider,
          apiKey: newApiKey.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const updatedKeys = {
          ...keys,
          [selectedBrand.key]: newApiKey.trim()
        }
        setKeys(updatedKeys)
        setMessage(`${selectedBrand.name} API密钥更新成功`)
        setShowUpdateModal(false)
        setSelectedBrand(null)
        setNewApiKey('')
        const newSavedKeys = new Set(savedKeys)
        newSavedKeys.add(selectedBrand.key)
        setSavedKeys(newSavedKeys)
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

  const handleDeleteApiKey = async (brand: BrandInfo) => {
    if (!confirm(`确定要删除 ${brand.name} 的API密钥吗？`)) {
      return
    }

    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setMessage('请先登录')
        return
      }

      // 首先获取唯一密钥
      const uniqueKeyResponse = await fetch('/api/proxy/keys/unique-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!uniqueKeyResponse.ok) {
        throw new Error('获取唯一密钥失败')
      }

      const uniqueKeyData: UniqueKeyResponse = await uniqueKeyResponse.json()
      const currentUniqueKey = uniqueKeyData.uniqueKey

      const response = await fetch('/api/proxy/keys', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueKey: currentUniqueKey,
          provider: brand.provider
        })
      })

      if (response.ok) {
        setMessage(`${brand.name} API密钥删除成功`)
        // 重新获取密钥列表
        await fetchUserKeys()
      } else {
        const data = await response.json()
        setMessage(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      setMessage('删除失败，请重试')
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

          {uniqueKey && (
            <div className="mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  您的唯一密钥
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono text-green-900 dark:text-green-100 break-all">
                    {uniqueKey}
                  </code>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(uniqueKey)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                      } catch (e) {
                        setCopied(false)
                      }
                    }}
                    className={`px-3 py-2 rounded text-sm transition-colors ${copied ? 'bg-green-600 text-white' : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800'}`}
                    title={copied ? '已复制' : '复制密钥'}
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                {!uniqueKey.match(/^KMUK-[A-Z0-9]{8}-SFFU$/) && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    ❌ 格式验证: 格式错误，请联系管理员或开发者！
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  请妥善保管您的唯一密钥，它将用于安全获取您的大模型API密钥。
                </p>
              </div>
            </div>
          )}

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
                  {savedKeys.has(brand.key) ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleUpdateBrand(brand)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                      >
                        更新
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(brand)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                      >
                        删除
                      </button>
                    </div>
                  ) : null}
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

      {/* 注意：解密弹窗已移除，唯一密钥现在由服务端直接返回解密后的值 */}
    </>
  )
} 
