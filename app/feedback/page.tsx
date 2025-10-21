'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    qqContact: '',
    wechatContact: '',
    emailContact: '',
    phoneContact: '',
    title: '',
    type: '',
    content: '',
    platform: '',
    specificPlatform: '',
    version: '',
    feature: '',
    appVersion: 'Web版'
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitErrorMsg, setSubmitErrorMsg] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [showDisabledAlert, setShowDisabledAlert] = useState(false)
  const [disabledTypeName, setDisabledTypeName] = useState('')
  const [referrer, setReferrer] = useState<string | null>(null)
  const router = useRouter()

  // 动态加载状态页面脚本
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://andyjinwebsite.statuspage.io/embed/script.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // 清理脚本
      const existingScript = document.querySelector('script[src="https://andyjinwebsite.statuspage.io/embed/script.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  // 检测来源页面
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrerUrl = document.referrer
      if (referrerUrl) {
        try {
          const referrerUrlObj = new URL(referrerUrl)
          const referrerPath = referrerUrlObj.pathname
          setReferrer(referrerPath)
        } catch (error) {
          setReferrer('/')
        }
      } else {
        setReferrer('/')
      }
    }
  }, [])

  const platforms = [
    { value: 'modern-blog-series', label: 'Modern Blog 系列应用', description: 'Android、macOS、Windows、微信小程序等各平台应用' },
    { value: 'user-service', label: '用户服务站', description: '小Mo智能客服、个人中心、密钥管家' },
    { value: 'sii-platform', label: 'Sii 语言指南平台', description: 'Sii语言学习、CLI编译器、IDE工具、第三方库' },
    { value: 'other', label: '其他问题', description: '其他未分类的问题或建议' }
  ]

  // Modern Blog 系列应用的具体平台
  const modernBlogPlatforms = [
    { value: 'website', label: '主站（My Modern Blog）' },
    { value: 'android', label: 'Android版' },
    { value: 'macos', label: 'macOS版' },
    { value: 'windows', label: 'Windows版' },
    { value: 'wechat', label: '微信小程序版' }
  ]

  const featureCategories = [
    { value: 'browse-content', label: '内容浏览', description: '博客、教程、项目、工具库浏览相关问题' },
    { value: 'account-management', label: '账号管理', description: '登录、注册、注销、设备管理等功能' },
    { value: 'ai-services', label: 'AI智能服务', description: '文本生成、文生图等AI功能' },
    { value: 'local-authoring', label: '本地撰写', description: 'Markdown撰写、文本导出、本地存储等功能' },
    { value: 'update-system', label: '更新系统', description: '智能更新、版本管理等功能' },
    { value: 'key-management', label: '密钥管家', description: 'API密钥管理、唯一密钥生成等功能' },
    { value: 'development-tools', label: '开发工具', description: 'Sii语言学习、CLI编译器、IDE工具等' },
    { value: 'other-features', label: '其他功能', description: '其他未分类的功能问题' }
  ]

  // 平台功能支持矩阵
  const platformFeatureSupport = {
    website: ['browse-content'],
    android: ['browse-content', 'account-management', 'update-system'],
    macos: ['browse-content', 'account-management', 'ai-services', 'local-authoring', 'update-system', 'key-management'],
    windows: ['browse-content', 'account-management', 'local-authoring', 'update-system'],
    wechat: ['browse-content', 'account-management'],
    'user-service': ['account-management', 'key-management'],
    'sii-platform': ['development-tools'],
    'sii-website': ['browse-content', 'development-tools'],
    'sii-cli': ['development-tools'],
    'siideal': ['development-tools'],
    other: ['other-features']
  }

  // 平台版本数据
  const platformVersions = {
    website: [
      { value: '2025-09-16', label: '2025-09-16' },
      { value: '2025-07-26', label: '2025-07-26' },
      { value: '2025-07-25', label: '2025-07-25' },
      { value: '2025-07-24', label: '2025-07-24' },
      { value: '2025-07-23', label: '2025-07-23' },
      { value: '2025-07-22', label: '2025-07-22' }
    ],
    android: [
      { value: '4.6.100', label: '4.6.100' },
      { value: '4.5.600', label: '4.5.600' },
      { value: '4.5.200', label: '4.5.200' },
      { value: '4.1.0', label: '4.1.0' },
      { value: '4.0.100', label: '4.0.100' },
      { value: '3.0.0', label: '3.0.0' },
      { value: '2.5.5', label: '2.5.5' },
      { value: '2.0.1 Beta2', label: '2.0.1 Beta2' }
    ],
    macos: [
      { value: '2.2.0', label: '2.2.0' },
      { value: '2.1.0', label: '2.1.0' },
      { value: '2.0.1', label: '2.0.1' },
      { value: '2.0.0', label: '2.0.0' },
      { value: '1.5.5', label: '1.5.5' },
      { value: '1.0.0', label: '1.0.0' }
    ],
    windows: [
      { value: '2.0.0', label: '2.0.0' },
      { value: '1.0.0', label: '1.0.0' }
    ],
    wechat: [
      { value: '1.3.0', label: '1.3.0' },
      { value: '1.2.0', label: '1.2.0' },
      { value: '1.1.2', label: '1.1.2' },
      { value: '1.1.1', label: '1.1.1' },
      { value: '1.1.0', label: '1.1.0' },
      { value: '1.0.0', label: '1.0.0' }
    ],
    'user-service': [
      { value: 'current', label: '当前版本' }
    ],
    'sii-platform': [
      { value: 'current', label: '当前版本' }
    ],
    'sii-cli': [
      { value: '1.2.1', label: '1.2.1' },
      { value: '1.1.0', label: '1.1.0' },
      { value: '1.0.2', label: '1.0.2' }
    ],
    'siideal': [
      { value: '1.0.0', label: '1.0.0' }
    ],
    'sii-website': [
      { value: 'current', label: '当前版本' }
    ],
    other: [
      { value: 'current', label: '当前版本' }
    ]
  }

  // 已知问题公告数据 - 当前无公告，以下为添加模板
  const knownIssues: Array<{
    category: string
    categoryName: string
    issues: Array<{
      title: string
      description: string
      status: string
      priority: string
      expectedFix: string
    }>
  }> = [
    // 内容浏览相关已知问题
    {
       category: 'content-browsing',
       categoryName: '内容浏览',
       issues: [
         {
           title: '预览版申请问题',
           description: '由于数据库进行了更新，目前主站(www.andyjin.website)的预览版申请功能暂未对接数据库，同时目前尚未处于测试周期，我们预计将在下一测试周期进行修复，敬请期待。',
           status: '已知问题', // 可选：修复中、优化中、调查中、已知问题
           priority: 'low', // 可选：high、medium、low
           expectedFix: '下一测试周期开启前，目前尚未确定下一测试周期的具体时间'
         },
         {
          title: '微信小程序分享问题',
          description: '由于目前Modern Blog微信小程序功能方面的欠缺，分享功能目前并非重要功能，因此暂未开发，敬请期待。',
          status: '已知问题', // 可选：修复中、优化中、调查中、已知问题
          priority: 'low', // 可选：high、medium、low
          expectedFix: '暂无修复计划'
        }
       ]
     },
    
    // 用户账号管理相关已知问题
    // {
    //   category: 'user-account',
    //   categoryName: '用户账号管理',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '调查中',
    //       priority: 'high',
    //       expectedFix: '预计修复时间'
    //     }
    //   ]
    // },
    
    // AI智能服务相关已知问题
    // {
    //   category: 'ai-services',
    //   categoryName: 'AI智能服务',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '优化中',
    //       priority: 'high',
    //       expectedFix: '预计修复时间'
    //     }
    //   ]
    // },
    
    // 密钥管家相关已知问题
    // {
    //   category: 'key-management',
    //   categoryName: '密钥管家',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '已知问题',
    //       priority: 'low',
    //       expectedFix: '待定'
    //     }
    //   ]
    // },
    
    // 开发工具相关已知问题
    // {
    //   category: 'development-tools',
    //   categoryName: '开发工具',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '优化中',
    //       priority: 'medium',
    //       expectedFix: '预计修复时间'
    //     }
    //   ]
    // },
    
    // 内容创作相关已知问题
    // {
    //   category: 'content-creation',
    //   categoryName: '内容创作',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '修复中',
    //       priority: 'low',
    //       expectedFix: '预计修复时间'
    //     }
    //   ]
    // },
    
    // 应用功能相关已知问题
    // {
    //   category: 'application-features',
    //   categoryName: '应用功能',
    //   issues: [
    //     {
    //       title: '问题标题',
    //       description: '问题详细描述',
    //       status: '已知问题',
    //       priority: 'low',
    //       expectedFix: '待定'
    //     }
    //   ]
    // }
  ]

  const getFeedbackTypesByPlatform = (platform: string, specificPlatform?: string) => {
    const targetPlatform = specificPlatform || platform
    switch (targetPlatform) {
      case 'website':
        return [
          { value: '博客浏览问题', label: '博客浏览问题', enabled: true },
          { value: '教程查看问题', label: '教程查看问题', enabled: true },
          { value: '项目展示问题', label: '项目展示问题', enabled: true },
          { value: '工具库使用问题', label: '工具库使用问题', enabled: true },
          { value: '预览版申请问题', label: '预览版申请问题', enabled: false },
          { value: '其他网站问题', label: '其他网站问题', enabled: true }
        ]
      case 'android':
        return [
          { value: '浏览功能问题', label: '浏览功能问题', enabled: true },
          { value: '账号管理问题', label: '账号管理问题', enabled: true },
          { value: '设备管理问题', label: '设备管理问题', enabled: true },
          { value: '更新功能问题', label: '更新功能问题', enabled: true },
          { value: '界面显示问题', label: '界面显示问题', enabled: true },
          { value: '其他Android问题', label: '其他Android问题', enabled: true }
        ]
      case 'macos':
        return [
          { value: '浏览功能问题', label: '浏览功能问题', enabled: true },
          { value: 'AI文本生成问题', label: 'AI文本生成问题', enabled: true },
          { value: 'AI文生图问题', label: 'AI文生图问题', enabled: false }, // 示例：禁用状态
          { value: '本地撰写问题', label: '本地撰写问题', enabled: true },
          { value: '账号管理问题', label: '账号管理问题', enabled: true },
          { value: '其他macOS问题', label: '其他macOS问题', enabled: true }
        ]
      case 'windows':
        return [
          { value: '浏览功能问题', label: '浏览功能问题', enabled: true },
          { value: '本地撰写问题', label: '本地撰写问题', enabled: true },
          { value: '账号管理问题', label: '账号管理问题', enabled: true },
          { value: '更新功能问题', label: '更新功能问题', enabled: true },
          { value: '界面显示问题', label: '界面显示问题', enabled: true },
          { value: '其他Windows问题', label: '其他Windows问题', enabled: true }
        ]
      case 'wechat':
        return [
          { value: '博客浏览问题', label: '博客浏览问题', enabled: true },
          { value: '工具库使用问题', label: '工具库使用问题', enabled: true },
          { value: '账号管理问题', label: '账号管理问题', enabled: true },
          { value: '界面显示问题', label: '界面显示问题', enabled: true },
          { value: '分享功能问题', label: '分享功能问题', enabled: false },
          { value: '其他小程序问题', label: '其他小程序问题', enabled: true }
        ]
      case 'user-service':
        return [
          { value: '小Mo客服问题', label: '小Mo客服问题', enabled: true },
          { value: '个人中心问题', label: '个人中心问题', enabled: true },
          { value: '密钥管家问题', label: '密钥管家问题', enabled: true },
          { value: '登录注册问题', label: '登录注册问题', enabled: true },
          { value: '功能建议', label: '功能建议', enabled: true },
          { value: '其他用户服务问题', label: '其他用户服务问题', enabled: true }
        ]
      case 'sii-platform':
        return [
          { value: 'Sii语言学习问题', label: 'Sii语言学习问题', enabled: true },
          { value: 'Sii CLI问题', label: 'Sii CLI问题', enabled: true },
          { value: 'SiiDeal IDE问题', label: 'SiiDeal IDE问题', enabled: true },
          { value: '第三方库问题', label: '第三方库问题', enabled: true },
          { value: '镜像站问题', label: '镜像站问题', enabled: true },
          { value: '其他Sii平台问题', label: '其他Sii平台问题', enabled: true }
        ]
      case 'sii-cli':
        return [
          { value: 'Sii CLI问题', label: 'Sii CLI问题', enabled: true },
          { value: '编译问题', label: '编译问题', enabled: true },
          { value: '运行问题', label: '运行问题', enabled: true },
          { value: '安装问题', label: '安装问题', enabled: true },
          { value: '配置问题', label: '配置问题', enabled: true },
          { value: '其他CLI问题', label: '其他CLI问题', enabled: true }
        ]
      case 'siideal':
        return [
          { value: 'SiiDeal IDE问题', label: 'SiiDeal IDE问题', enabled: true },
          { value: '代码编辑问题', label: '代码编辑问题', enabled: true },
          { value: '调试问题', label: '调试问题', enabled: true },
          { value: '项目管理问题', label: '项目管理问题', enabled: true },
          { value: '插件问题', label: '插件问题', enabled: true },
          { value: '其他IDE问题', label: '其他IDE问题', enabled: true }
        ]
      case 'sii-website':
        return [
          { value: 'Sii语言学习问题', label: 'Sii语言学习问题', enabled: true },
          { value: '教程查看问题', label: '教程查看问题', enabled: true },
          { value: '文档浏览问题', label: '文档浏览问题', enabled: true },
          { value: '第三方库问题', label: '第三方库问题', enabled: true },
          { value: '镜像站问题', label: '镜像站问题', enabled: true },
          { value: '其他网站问题', label: '其他网站问题', enabled: true }
        ]
      case 'other':
        return [
          { value: '功能建议', label: '功能建议', enabled: true },
          { value: '界面优化建议', label: '界面优化建议', enabled: true },
          { value: '性能优化建议', label: '性能优化建议', enabled: true },
          { value: '新功能需求', label: '新功能需求', enabled: true },
          { value: 'Bug报告', label: 'Bug报告', enabled: true },
          { value: '其他问题', label: '其他问题', enabled: true }
        ]
      default:
        return []
    }
  }

  const getKnownIssuesByCategory = (category: string) => {
    return knownIssues.find(item => item.category === category)?.issues || []
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '修复中':
      case '优化中':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case '调查中':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case '已知问题':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 如果选择了业务类型，自动进入下一步
    if (name === 'platform' && value && currentStep === 1) {
      setCurrentStep(2)
    }
    // 如果选择了具体平台，清空版本选择
    if (name === 'specificPlatform') {
      setFormData(prev => ({
        ...prev,
        version: ''
      }))
    }
    // 如果选择了具体平台和版本，自动进入下一步
    if (name === 'version' && value && formData.specificPlatform && currentStep === 2) {
      setCurrentStep(3)
    }
    if (name === 'feature' && value && currentStep === 3) {
      setCurrentStep(4)
    }
    if (name === 'emailContact' && emailError) {
      setEmailError('')
    }
  }

  const handleTypeSelection = (typeValue: string, typeLabel: string, enabled: boolean) => {
    if (!enabled) {
      setDisabledTypeName(typeLabel)
      setShowDisabledAlert(true)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      type: typeValue
    }))
    
    // 如果选择了问题类型，自动进入下一步
    if (currentStep === 4) {
      setCurrentStep(5)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && formData.platform) {
      setCurrentStep(2)
    } else if (currentStep === 2 && formData.specificPlatform && formData.version) {
      setCurrentStep(3)
    } else if (currentStep === 3 && formData.feature) {
      setCurrentStep(4)
    } else if (currentStep === 4 && formData.type) {
      setCurrentStep(5)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 智能返回函数
  const handleSmartBack = () => {
    if (referrer && referrer !== '/feedback') {
      router.push(referrer)
    } else {
      router.back()
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitErrorMsg('')

    try {
      // 验证邮箱格式
      if (!validateEmail(formData.emailContact)) {
        setEmailError('请输入有效的邮箱地址')
        setSubmitStatus('error')
        setSubmitErrorMsg('邮箱格式不正确')
        setIsSubmitting(false)
        return
      } else {
        setEmailError('')
      }

      // 确保前端已配置公开的反馈密钥
      const clientApiKey = process.env.NEXT_PUBLIC_FEEDBACK_API_KEY
      if (!clientApiKey) {
        setSubmitStatus('error')
        setSubmitErrorMsg('前端未配置 NEXT_PUBLIC_FEEDBACK_API_KEY，请检查环境变量')
        setIsSubmitting(false)
        return
      }

      const selectedPlatform = platforms.find(platform => platform.value === formData.platform)
      const selectedSpecificPlatform = formData.specificPlatform ? 
        (formData.platform === 'modern-blog-series' ? 
          modernBlogPlatforms.find(p => p.value === formData.specificPlatform) :
          formData.platform === 'sii-platform' ?
            (formData.specificPlatform === 'sii-cli' ? { label: 'Sii CLI' } : 
             formData.specificPlatform === 'siideal' ? { label: 'SiiDeal' } : 
             formData.specificPlatform === 'sii-website' ? { label: 'Sii 语言指南网站' } : null) :
          platforms.find(p => p.value === formData.specificPlatform)
        ) : null
      const selectedVersion = platformVersions[formData.specificPlatform as keyof typeof platformVersions]?.find(version => version.value === formData.version)
      const selectedFeature = featureCategories.find(feature => feature.value === formData.feature)
      const enhancedContent = `业务类型：${selectedPlatform?.label || '未知业务类型'}
具体平台：${selectedSpecificPlatform?.label || '未知平台'}
相关版本：${selectedVersion?.label || '未知版本'}
相关功能：${selectedFeature?.label || '未知功能'}

${formData.content}`

      const apiData = {
        name: formData.name,
        qqContact: formData.qqContact,
        wechatContact: formData.wechatContact,
        emailContact: formData.emailContact,
        phoneContact: formData.phoneContact,
        title: formData.title,
        type: formData.type,
        content: enhancedContent,
        appVersion: formData.appVersion
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + clientApiKey
        },
        body: JSON.stringify(apiData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        // 表单
        setFormData({
          name: '',
          qqContact: '',
          wechatContact: '',
          emailContact: '',
          phoneContact: '',
          title: '',
          type: '',
          content: '',
          platform: '',
          specificPlatform: '',
          version: '',
          feature: '',
          appVersion: 'Web版'
        })
        setCurrentStep(1)
      } else {
        setSubmitStatus('error')
        try {
          const errorData = await response.json()
          if (response.status === 401) {
            setSubmitErrorMsg('接口鉴权失败：请检查 FEEDBACK_API_KEY 与 NEXT_PUBLIC_FEEDBACK_API_KEY 是否一致')
          } else if (response.status === 500) {
            // 针对常见邮件配置错误给出明确提示
            const msg = typeof errorData?.error === 'string' ? errorData.error : '服务器内部错误'
            setSubmitErrorMsg(`服务端错误：${msg}，请检查 SMTP_* 与 DEVELOPER_EMAIL 配置`)
          } else if (response.status === 400) {
            const msg = typeof errorData?.error === 'string' ? errorData.error : '请求不合法'
            setSubmitErrorMsg(`提交失败：${msg}`)
          } else {
            setSubmitErrorMsg('提交失败，请稍后重试')
          }
        } catch (_) {
          setSubmitErrorMsg('提交失败，请稍后重试')
        }
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitErrorMsg('网络或服务器异常，请检查网络连接或稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleSmartBack}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">用户反馈</h1>
            <div className="flex items-center">
              <iframe 
                src="https://status.andyjin.website/badge?theme=system" 
                width="150" 
                height="30" 
                frameBorder="0" 
                scrolling="no" 
                style={{ colorScheme: 'normal' }}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和描述 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            我们重视您的每一个声音
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            您的反馈是我们持续改进产品的重要动力。请详细描述您遇到的问题或建议，我们会认真对待每一条反馈。
          </p>
          
          {/* 公告按钮 */}
          {knownIssues.some(siteData => siteData.issues.length > 0) && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAnnouncement(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors duration-200 border border-orange-200 dark:border-orange-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                查看已知问题公告
              </button>
            </div>
          )}
        </div>

        {/* 步骤导航 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto px-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  currentStep >= step
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step === 1 ? '业务类型' : step === 2 ? '平台版本' : step === 3 ? '功能方向' : step === 4 ? '问题类型' : '详细信息'}
                </span>
                {step < 5 && (
                  <div className={`w-4 sm:w-8 h-0.5 ml-2 sm:ml-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 反馈表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 业务类型选择 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  请选择业务类型 <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-4">
                  {platforms.map((platform) => (
                    <label
                      key={platform.value}
                      className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.platform === platform.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="platform"
                        value={platform.value}
                        checked={formData.platform === platform.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {platform.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {platform.description}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ml-3 mt-1 ${
                        formData.platform === platform.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.platform === platform.value && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 平台和版本选择 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  请选择平台和版本 <span className="text-red-500">*</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 平台选择下拉框 */}
                  <div>
                    <label htmlFor="specificPlatform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      选择平台 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="specificPlatform"
                      name="specificPlatform"
                      value={formData.specificPlatform}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    >
                      <option value="">请选择平台</option>
                      {formData.platform === 'modern-blog-series' ? (
                        modernBlogPlatforms.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))
                      ) : formData.platform === 'sii-platform' ? (
                        <>
                          <option value="sii-website">Sii 语言指南网站</option>
                          <option value="sii-cli">Sii CLI</option>
                          <option value="siideal">SiiDeal</option>
                        </>
                      ) : (
                        <option value={formData.platform}>
                          {platforms.find(p => p.value === formData.platform)?.label}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* 版本选择下拉框 */}
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      选择版本 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="version"
                      name="version"
                      value={formData.version}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.specificPlatform}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">请选择版本</option>
                      {formData.specificPlatform && platformVersions[formData.specificPlatform as keyof typeof platformVersions]?.map((version) => (
                        <option key={version.value} value={version.value}>
                          {version.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤3: 功能选择 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  请选择功能方向 <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-4">
                  {featureCategories
                    .filter(feature => platformFeatureSupport[formData.specificPlatform as keyof typeof platformFeatureSupport]?.includes(feature.value))
                    .map((feature) => (
                    <label
                      key={feature.value}
                      className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.feature === feature.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feature"
                        value={feature.value}
                        checked={formData.feature === feature.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {feature.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ml-3 mt-1 ${
                        formData.feature === feature.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.feature === feature.value && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 问题类型选择 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  请选择问题类型 <span className="text-red-500">*</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {getFeedbackTypesByPlatform(formData.platform, formData.specificPlatform).map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleTypeSelection(type.value, type.label, type.enabled)}
                      className={`relative flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
                        !type.enabled
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                          : formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        !type.enabled
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {type.label}
                        {!type.enabled && (
                          <span className="ml-1 text-xs text-orange-500">(已知问题)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步骤5: 详细信息填写 */}
            {currentStep === 5 && (
              <>
                {/* 基本信息 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                    联系方式
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        用户名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        placeholder="请输入您的用户名称"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        邮箱 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="emailContact"
                        name="emailContact"
                        value={formData.emailContact}
                        onChange={handleInputChange}
                        required
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        title="请输入有效的邮箱地址，如：example@domain.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
                          emailError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="请输入您的邮箱"
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phoneContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        手机号
                      </label>
                      <input
                        type="tel"
                        id="phoneContact"
                        name="phoneContact"
                        value={formData.phoneContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        placeholder="请输入您的手机号（选填）"
                      />
                    </div>

                    <div>
                      <label htmlFor="qqContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        QQ
                      </label>
                      <input
                        type="text"
                        id="qqContact"
                        name="qqContact"
                        value={formData.qqContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        placeholder="请输入您的QQ号（选填）"
                      />
                    </div>

                    <div>
                      <label htmlFor="wechatContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        微信
                      </label>
                      <input
                        type="text"
                        id="wechatContact"
                        name="wechatContact"
                        value={formData.wechatContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        placeholder="请输入您的微信号（选填）"
                      />
                    </div>
                  </div>
                </div>

                {/* 反馈内容 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                    反馈内容 <span className="text-red-500">*</span>
                  </h3>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      placeholder="请简要描述您的问题或建议"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      详细描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 resize-none"
                      placeholder="请详细描述您遇到的问题、建议或需求。包括：&#10;1. 具体的问题现象&#10;2. 重现步骤&#10;3. 期望的结果&#10;4. 其他相关信息"
                    />
                  </div>
                </div>
              </>
            )}


            {/* 提交状态提示 */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    反馈提交成功！我们会尽快处理您的反馈，感谢您的支持。
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    {submitErrorMsg || '提交失败，请检查网络连接后重试。'}
                  </p>
                </div>
              </div>
            )}

            {/* 步骤导航按钮 */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 sm:px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
                  >
                    上一步
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSmartBack}
                  className="px-4 sm:px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
                >
                  取消
                </button>
              </div>
              
              <div className="flex">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !formData.platform) ||
                      (currentStep === 2 && (!formData.specificPlatform || !formData.version)) ||
                      (currentStep === 3 && !formData.feature) ||
                      (currentStep === 4 && !formData.type)
                    }
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </>
                    ) : (
                      '提交反馈'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* 联系信息 */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">其他联系方式</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>邮箱：2358155969@qq.com</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>智能客服：</span>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
              >
                小Mo在线服务
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 已知问题公告弹窗 */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                已知问题公告
              </h3>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      温馨提示
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      以下是我们已知的问题，正在积极修复中。如果您遇到的是以下问题，请耐心等待修复，避免重复反馈。
                    </p>
                  </div>
                </div>
              </div>

              {/* 各业务分类已知问题 */}
              {knownIssues.map((categoryData) => (
                <div key={categoryData.category} className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {categoryData.categoryName}
                  </h4>
                  
                  <div className="space-y-4">
                    {categoryData.issues.map((issue, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {issue.title}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                              {issue.priority === 'high' ? '高优先级' : 
                               issue.priority === 'medium' ? '中优先级' : '低优先级'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          预计修复时间：{issue.expectedFix}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* 底部提示 */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      感谢您的理解
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      如果您遇到的问题不在上述列表中，或者有其他建议，欢迎继续提交反馈。我们会优先处理新发现的问题。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => setShowAnnouncement(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 禁用问题类型提示弹窗 */}
      {showDisabledAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                问题已知
              </h3>
              <button
                onClick={() => setShowDisabledAlert(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              <div className="flex items-start mb-4">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    "{disabledTypeName}" 问题已知
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    该问题我们已经了解并正在积极修复中。请耐心等待官方修复，或选择其他问题类型进行反馈。
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 建议：您可以查看"已知问题公告"了解修复进度，或选择其他相关问题类型。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAnnouncement(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                查看公告
              </button>
              <button
                onClick={() => setShowDisabledAlert(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
