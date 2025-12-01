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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#050509]/94 border border-white/12 shadow-[0_40px_120px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-white px-6 py-7 space-y-6">
          {/* 标题 */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/45">Key Manager</p>
              <h2 className="text-2xl font-semibold mt-2">密钥管家</h2>
              <p className="text-sm text-white/60 mt-1">集中管理三方模型 API Key，统一加密存储。</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/5 hover:bg-white/10 border border-white/15 p-2 text-white/70 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {uniqueKey && (
            <div className="rounded-2xl border border-white/12 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">您的唯一密钥</span>
                {!uniqueKey.match(/^KMUK-[A-Z0-9]{8}-SFFU$/) && (
                  <span className="text-xs text-rose-300">格式异常</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-2xl border border-white/10 bg-black/30 text-sm font-mono text-white break-all">
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
                  className={`px-4 py-2 rounded-2xl text-xs font-medium transition ${
                    copied ? 'bg-white text-[#050505]' : 'border border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <p className="text-xs text-white/55">
                唯一密钥仅用于在服务器侧加密/解密您的 API Key，请妥善保管。
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 text-sm text-white/70">
            💡 <span className="font-medium text-white/80">使用说明：</span>从各平台控制台复制 API Key，粘贴到对应品牌后保存，全程加密传输。
          </div>

          <div className="space-y-5">
            {BRANDS.map((brand) => (
              <div key={brand.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/85 font-medium">{brand.name}</span>
                  {savedKeys.has(brand.key) && (
                    <span className="text-xs text-emerald-300/80">已保存</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="API Key (选填)"
                    value={savedKeys.has(brand.key) ? '••••••••••••••' : keys[brand.key]}
                    onChange={(e) => handleInputChange(brand.key, e.target.value)}
                    disabled={savedKeys.has(brand.key)}
                    className={`flex-1 px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/25 ${
                      savedKeys.has(brand.key) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {savedKeys.has(brand.key) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateBrand(brand)}
                        className="px-4 py-2 rounded-2xl bg-white text-[#050505] text-xs font-medium hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)]"
                      >
                        更新
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(brand)}
                        className="px-4 py-2 rounded-2xl border border-white/20 text-white/80 text-xs font-medium hover:bg-white/10 transition"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded-2xl text-sm border ${
                message.includes('成功')
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-white/18 text-white/80 text-sm font-medium hover:bg-white/8 transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-white text-[#050505] text-sm font-semibold hover:bg-white/90 shadow-[0_22px_60px_-28px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {showUpdateModal && selectedBrand && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUpdateModal(false)} />
          <div className="relative w-full max-w-md rounded-[28px] bg-[#050509]/94 border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-[0.3em]">Update Key</p>
                <h3 className="text-lg font-semibold text-white mt-1">更新 {selectedBrand.name} API 密钥</h3>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="rounded-full bg-white/5 hover:bg白/10 border border白/15 p-2 text白/70 hover:text白 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <label className="text-white/75">新的 API Key</label>
              <input
                type="text"
                placeholder="请输入新的 API Key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/25"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-3 rounded-2xl border border-white/18 text-white/80 text-sm font-medium hover:bg-white/8 transition"
              >
                取消
              </button>
              <button
                onClick={handleUpdateApiKey}
                disabled={isUpdating || !newApiKey.trim()}
                className="flex-1 px-4 py-3 rounded-2xl bg-white text-[#050505] text-sm font-semibold hover:bg-white/90 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.95)] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
