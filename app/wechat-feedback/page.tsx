'use client'

import { useState, useEffect } from 'react'

export default function WeChatFeedbackPage() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto')
  const [themeClass, setThemeClass] = useState('')
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageIndex, setPreviewImageIndex] = useState(0)
  const [previewImageUrls] = useState([
    '/images/feedback1.png',
    '/images/feedback2.png',
    '/images/feedback3.png',
    '/images/feedback4.png'
  ])
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // 初始化主题
  useEffect(() => {
    const getStoredThemeMode = (): 'light' | 'dark' | 'auto' => {
      if (typeof window === 'undefined') return 'auto'
      try {
        const stored = localStorage.getItem('themeMode')
        return (stored as 'light' | 'dark' | 'auto') || 'auto'
      } catch {
        return 'auto'
      }
    }

    const resolveEffectiveTheme = (mode: 'light' | 'dark' | 'auto'): 'light' | 'dark' => {
      if (mode === 'auto') {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
      }
      return mode
    }

    const computeThemeClass = (effective: 'light' | 'dark'): string => {
      return effective === 'dark' ? 'dark' : ''
    }

    const mode = getStoredThemeMode()
    const effective = resolveEffectiveTheme(mode)
    setThemeMode(mode)
    setThemeClass(computeThemeClass(effective))

    // 监听系统主题变化
    if (mode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newEffective = resolveEffectiveTheme('auto')
        setThemeClass(computeThemeClass(newEffective))
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // 复制反馈地址
  const copyFeedbackUrl = async () => {
    const url = 'https://cs.andyjin.website/feedback'
    try {
      await navigator.clipboard.writeText(url)
      // 可以添加 toast 提示
      alert('反馈地址已复制')
    } catch (err) {
      alert('复制失败')
    }
  }

  // 预览图片
  const previewImage = (src: string) => {
    const current = previewImageUrls.indexOf(src)
    setPreviewImageUrl(src)
    setPreviewImageIndex(current >= 0 ? current : 0)
    setShowImagePreview(true)
    setImageLoading(true)
  }

  // 关闭图片预览
  const closeImagePreview = () => {
    setShowImagePreview(false)
  }

  // 切换图片（左右滑动）
  const switchImage = (direction: 'prev' | 'next') => {
    let newIndex = previewImageIndex

    if (direction === 'prev' && previewImageIndex > 0) {
      newIndex = previewImageIndex - 1
    } else if (direction === 'next' && previewImageIndex < previewImageUrls.length - 1) {
      newIndex = previewImageIndex + 1
    }

    if (newIndex !== previewImageIndex) {
      setPreviewImageIndex(newIndex)
      setPreviewImageUrl(previewImageUrls[newIndex])
      setImageLoading(true)
    }
  }

  // 图片加载成功
  const onImageLoad = () => {
    setImageLoading(false)
  }

  // 图片加载失败
  const onImageError = () => {
    setImageLoading(false)
    alert('图片加载失败，图片尺寸过大，建议压缩图片后使用。当前图片尺寸：2934x1520像素')
  }

  return (
    <div className={`min-h-screen ${themeClass === 'dark' ? 'bg-[#111]' : 'bg-[#f5f5f5]'} py-5 px-2.5 pb-32`}>
      <div className="max-w-4xl mx-auto">
        {/* 反馈介绍 */}
        <div className={`${themeClass === 'dark' ? 'text-[#e6e6e6]' : 'text-[#333]'} px-7.5 py-7.5 mb-5`}>
          <p className="text-base leading-relaxed text-left whitespace-pre-wrap break-words">
            亲爱的用户您好，欢迎您使用我们的智能客户服务反馈平台，在这里您可以反馈我们所有业务的问题，同时也可以向我们提出相关建议。接下来您可以对照下面的步骤来向我们反馈在您使用小程序遇到的问题。
            {'\n'}【反馈地址】(点击地址即可复制)
          </p>
          <button
            onClick={copyFeedbackUrl}
            className={`block text-base leading-relaxed mt-2.5 break-all underline ${
              themeClass === 'dark' ? 'text-[#25c2a0]' : 'text-[#2E8555]'
            } active:opacity-70`}
          >
            https://cs.andyjin.website/feedback
          </button>
        </div>

        {/* 反馈步骤 */}
        <div className="w-[90%] max-w-4xl mx-auto flex flex-col gap-6">
          {/* 步骤1 */}
          <div className={`flex flex-col rounded-2xl p-5 shadow-md ${
            themeClass === 'dark' ? 'bg-[#1a1a1a] shadow-white/5' : 'bg-white'
          }`}>
            <div className="flex justify-center mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                themeClass === 'dark' ? 'bg-[#25c2a0]' : 'bg-[#2E8555]'
              }`}>
                1
              </div>
            </div>
            <div className="w-full flex flex-col gap-5">
              <p className={`text-sm leading-relaxed mb-2.5 ${
                themeClass === 'dark' ? 'text-[#bbb]' : 'text-[#666]'
              }`}>
                打开反馈页面，选择"Modern Blog系列应用"业务，点击"下一步"。
              </p>
              <img
                src="/images/feedback1.png"
                alt="步骤1"
                className="w-full block rounded-xl shadow-md cursor-pointer"
                onClick={() => previewImage('/images/feedback1.png')}
              />
              <p className={`text-xs text-center mt-1 ${
                themeClass === 'dark' ? 'text-[#888]' : 'text-[#999]'
              }`}>
                点击图片查看原图
              </p>
            </div>
          </div>

          {/* 步骤2 */}
          <div className={`flex flex-col rounded-2xl p-5 shadow-md ${
            themeClass === 'dark' ? 'bg-[#1a1a1a] shadow-white/5' : 'bg-white'
          }`}>
            <div className="flex justify-center mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                themeClass === 'dark' ? 'bg-[#25c2a0]' : 'bg-[#2E8555]'
              }`}>
                2
              </div>
            </div>
            <div className="w-full flex flex-col gap-5">
              <p className={`text-sm leading-relaxed mb-2.5 ${
                themeClass === 'dark' ? 'text-[#bbb]' : 'text-[#666]'
              }`}>
                平台选择"微信小程序版"，版本号请选择您当前使用的版本，因为新版本推送可能有延迟。点击"下一步"
              </p>
              <img
                src="/images/feedback2.png"
                alt="步骤2"
                className="w-full block rounded-xl shadow-md cursor-pointer"
                onClick={() => previewImage('/images/feedback2.png')}
              />
              <p className={`text-xs text-center mt-1 ${
                themeClass === 'dark' ? 'text-[#888]' : 'text-[#999]'
              }`}>
                点击图片查看原图
              </p>
            </div>
          </div>

          {/* 步骤3 */}
          <div className={`flex flex-col rounded-2xl p-5 shadow-md ${
            themeClass === 'dark' ? 'bg-[#1a1a1a] shadow-white/5' : 'bg-white'
          }`}>
            <div className="flex justify-center mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                themeClass === 'dark' ? 'bg-[#25c2a0]' : 'bg-[#2E8555]'
              }`}>
                3
              </div>
            </div>
            <div className="w-full flex flex-col gap-5">
              <p className={`text-sm leading-relaxed mb-2.5 ${
                themeClass === 'dark' ? 'text-[#bbb]' : 'text-[#666]'
              }`}>
                第三步点击"内容浏览"进入下一步。第四步请选择您在使用时具体遇到的问题类别，若您遇到的问题类别并不在我们提供的选项中，您可以选择"其他小程序问题"。点击"下一步"。
              </p>
              <img
                src="/images/feedback3.png"
                alt="步骤3"
                className="w-full block rounded-xl shadow-md cursor-pointer"
                onClick={() => previewImage('/images/feedback3.png')}
              />
              <p className={`text-xs text-center mt-1 ${
                themeClass === 'dark' ? 'text-[#888]' : 'text-[#999]'
              }`}>
                点击图片查看原图
              </p>
            </div>
          </div>

          {/* 步骤4 */}
          <div className={`flex flex-col rounded-2xl p-5 shadow-md ${
            themeClass === 'dark' ? 'bg-[#1a1a1a] shadow-white/5' : 'bg-white'
          }`}>
            <div className="flex justify-center mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                themeClass === 'dark' ? 'bg-[#25c2a0]' : 'bg-[#2E8555]'
              }`}>
                4
              </div>
            </div>
            <div className="w-full flex flex-col gap-5">
              <p className={`text-sm leading-relaxed mb-2.5 ${
                themeClass === 'dark' ? 'text-[#bbb]' : 'text-[#666]'
              }`}>
                最后填写您需要反馈的具体内容，完成后请点击"提交"。我们收到您的反馈后将立即进行处理，感谢您的反馈！
              </p>
              <img
                src="/images/feedback4.png"
                alt="步骤4"
                className="w-full block rounded-xl shadow-md cursor-pointer"
                onClick={() => previewImage('/images/feedback4.png')}
              />
              <p className={`text-xs text-center mt-1 ${
                themeClass === 'dark' ? 'text-[#888]' : 'text-[#999]'
              }`}>
                点击图片查看原图
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={closeImagePreview}
        >
          <div
            className="w-full h-full flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 预览头部 */}
            <div className="absolute top-0 left-0 right-0 py-10 px-7.5 flex justify-between items-center z-[10000]">
              <span className="text-sm text-white bg-black/50 px-5 py-2.5 rounded-full">
                {previewImageIndex + 1} / {previewImageUrls.length}
              </span>
              <button
                onClick={closeImagePreview}
                className="text-4xl text-white leading-none w-20 h-20 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>

            {/* 预览主体 */}
            <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
              {/* 上一张按钮 */}
              {previewImageIndex > 0 && (
                <button
                  onClick={() => switchImage('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-black/50 rounded-full z-[10001] hover:bg-black/70 active:bg-black/70 transition-colors"
                >
                  <span className="text-4xl text-white leading-none font-bold">‹</span>
                </button>
              )}

              {/* 加载提示 */}
              {imageLoading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] text-white text-sm">
                  <span className="text-white bg-black/60 px-10 py-5 rounded-lg">图片加载中...</span>
                </div>
              )}

              {/* 预览图片 */}
              <img
                src={previewImageUrl}
                alt="预览"
                className="w-full h-auto block visible opacity-100 z-10 flex-shrink-0 relative object-contain"
                style={{ 
                  maxHeight: '100vh',
                  width: '100%',
                  height: 'auto',
                  imageRendering: 'auto'
                }}
                onLoad={onImageLoad}
                onError={onImageError}
              />

              {/* 下一张按钮 */}
              {previewImageIndex < previewImageUrls.length - 1 && (
                <button
                  onClick={() => switchImage('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-black/50 rounded-full z-[10001] hover:bg-black/70 active:bg-black/70 transition-colors"
                >
                  <span className="text-4xl text-white leading-none font-bold">›</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

