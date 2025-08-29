import React from 'react'

export default function MacOSPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 页面标题 */}
          <div className="bg-green-600 px-6 py-8">
            <div className="flex items-center">
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-white">Modern Blog - macOS端用户隐私协议</h1>
                <p className="mt-2 text-green-100">最后更新：2025年8月</p>
              </div>
            </div>
          </div>

          {/* 协议内容 */}
          <div className="px-6 py-8 space-y-8">
            {/* 概述 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 概述</h2>
              <p className="text-gray-700 leading-relaxed">
                欢迎使用我们的Modern Blog APP macOS端应用（以下简称"APP"）。我们非常重视您的隐私保护，本隐私协议详细说明了我们如何收集、使用和保护您的个人信息。
                作为桌面应用，我们采用本地优先的设计理念，最大程度保护您的隐私安全。
              </p>
            </section>

            {/* 信息收集 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 信息收集</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 应用使用信息</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>应用版本：用于功能兼容性和问题诊断</li>
                <li>系统版本：macOS版本信息，用于优化用户体验</li>
                <li>错误日志：应用崩溃和错误信息（可选）</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.2 反馈信息（可选）</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>重要说明：</strong>反馈功能完全可选，仅在您主动联系开发者时收集必要信息
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>联系方式：邮箱、QQ、微信、电话（您选择提供）</li>
                <li>反馈内容：问题描述、功能建议等</li>
                <li>系统环境：macOS版本、应用版本等</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.3 本地存储信息</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>语音设置：语音识别和语音合成相关配置</li>
                <li>更新安装包清理设置：自动清理下载的更新安装包</li>
                <li>配置信息：应用配置和个性化设置</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.4 AI文本生成服务</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>重要说明：</strong>AI文本生成功能通过通义千问、deepseek(深度求索)、豆包等API服务提供商，对话历史保存在相应服务端
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>文本生成请求：从本地向多个AI服务提供商发送文本生成请求</li>
                <li>对话历史：保存在相应AI服务提供商的服务端，不在本地存储</li>
                <li>数据安全：对话内容受各AI服务提供商隐私政策保护</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.5 AI文生图服务</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>重要说明：</strong>AI文生图功能通过通义万相、豆包等API服务提供商，生成的图片保存在本地用户设备中
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>图片生成请求：从本地向多个AI服务提供商发送图片生成请求</li>
                <li>图片存储：生成的图片保存在本地macOS设备中</li>
                <li>数据安全：图片内容受各AI服务提供商隐私政策保护</li>
                <li>本地管理：您可以在本地设备上管理生成的图片</li>
              </ul>
            </section>

            {/* 信息使用 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 信息使用</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>服务提供：</strong>使用收集的信息提供和改进服务</li>
                <li><strong>问题诊断：</strong>分析错误日志解决技术问题</li>
                <li><strong>功能优化：</strong>根据使用统计优化用户体验</li>
                <li><strong>客户支持：</strong>通过反馈信息提供技术支持</li>
                <li><strong>AI文本生成服务：</strong>通过通义千问、deepseek(深度求索)、豆包等API提供AI文本生成服务</li>
                <li><strong>AI文生图服务：</strong>通过通义万相、豆包等API提供AI文生图服务</li>
              </ul>
            </section>

            {/* 信息保护 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 信息保护</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 本地数据安全</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>本地优先：</strong>所有用户数据都存储在您的本地设备上，我们无法访问
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本地存储：用户数据存储在您的macOS设备上</li>
                <li>数据加密：敏感信息使用系统级加密保护</li>
                <li>权限控制：应用仅请求必要的系统权限</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">4.2 API密钥安全</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>安全承诺：</strong>您的API密钥仅存储在本地设备上，永远不会上传到我们的服务器
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本地存储：API密钥存储在APP的管理机制中</li>
                <li>不上传：密钥永远不会传输到我们的服务器</li>
                <li>用户控制：您可以随时查看、修改或删除密钥</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">4.3 网络传输安全</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>HTTPS加密：所有网络通信都通过HTTPS协议</li>
                <li>证书验证：严格验证SSL证书的有效性</li>
                <li>数据最小化：仅传输必要的服务数据</li>
                <li>无追踪：不收集用户的浏览行为或网络活动</li>
              </ul>
            </section>

            {/* 用户权利 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 用户权利</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                根据相关法律法规，您享有以下权利：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>知情权：</strong>了解我们如何收集和使用您的信息</li>
                <li><strong>访问权：</strong>查看和获取您的个人信息副本</li>
                <li><strong>更正权：</strong>要求更正不准确或不完整的信息</li>
                <li><strong>删除权：</strong>要求删除您的个人信息（受法律限制除外）</li>
                <li><strong>撤回同意权：</strong>撤回之前给予的同意</li>
                <li><strong>投诉权：</strong>向相关监管机构投诉</li>
                <li><strong>本地数据管理权：</strong>完全控制APP在本地存储的所有数据</li>
              </ul>
            </section>

            {/* 本地数据管理 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 本地数据管理</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>完全控制：</strong>您可以完全控制应用在本地存储的所有数据
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>应用数据：</strong>在应用程序支持文件夹中管理</li>
                <li><strong>API密钥管理：</strong>通过APP内置的管理机制管理API密钥</li>
                <li><strong>偏好设置：</strong>通过系统偏好设置管理应用配置</li>
                <li><strong>完全删除：</strong>卸载应用时可以选择完全删除所有数据</li>
              </ul>
            </section>

            {/* 第三方服务 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 第三方服务</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                我们的应用可能使用以下第三方服务：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>AI服务：</strong>通过您的API密钥直接访问第三方AI服务</li>
                <li><strong>更新服务：</strong>应用自动更新检查（仅检查版本信息）</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                请注意，当您使用第三方AI服务时，您的对话内容将受到该服务的隐私政策约束。
                我们建议您仔细阅读相关服务的隐私政策。
              </p>
            </section>

            {/* 数据存储位置 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 数据存储位置</h2>
              <p className="text-gray-700 leading-relaxed">
                我们的服务器位于中国大陆，所有用户数据都存储在国内，不会传输到其他国家或地区。
                我们严格遵守中国的数据保护法律法规，确保您的数据安全。
              </p>
            </section>

            {/* 政策更新 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 政策更新</h2>
              <p className="text-gray-700 leading-relaxed">
                我们可能会不时更新本隐私协议。重大变更时，我们将通过应用内通知、
                邮件或其他方式通知您。建议您定期查看本协议的最新版本。
              </p>
            </section>

            {/* 联系我们 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. 联系我们</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                如果您对本隐私协议有任何疑问、意见或建议，请通过以下方式联系我们：
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>• 邮箱：2358155969@qq.com</li>
                  <li>• 应用内反馈渠道：关于->帮助->问题反馈</li>
                </ul>
              </div>
            </section>

            {/* 协议确认 */}
            <section className="border-t pt-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">协议确认</h3>
                <p className="text-green-800 leading-relaxed">
                  使用我们的Modern Blog APP macOS端应用即表示您已阅读、理解并同意本隐私协议的所有条款。
                  如果您不同意本协议的任何内容，请停止使用我们的服务。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 
