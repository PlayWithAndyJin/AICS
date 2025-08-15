import React from 'react'

export default function WeChatPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 页面标题 */}
          <div className="bg-green-500 px-6 py-8">
            <div className="flex items-center">
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-white">Modern Blog - 微信小程序端用户隐私协议</h1>
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
                欢迎使用我们的Modern Blog APP微信小程序（以下简称"APP"）。我们非常重视您的隐私保护，本隐私协议详细说明了我们如何收集、使用和保护您的个人信息。
                我们承诺以透明、负责任的方式处理您的数据，确保您的隐私得到充分保护。
              </p>
            </section>

            {/* 信息收集 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 信息收集</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 账号注册信息</h3>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>重要说明：</strong>注册时需要提供用户名和邮箱，所有信息都会加密存储
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>用户名：您选择的个人标识符</li>
                <li>邮箱地址：用于账号验证和重要通知</li>
                <li>注册时间：系统自动记录</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.2 登录信息</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>用户名：您注册时设置的用户名</li>
                <li>邮箱地址：用于身份验证</li>
                <li>登录时间：用于安全审计</li>
              </ul>
            </section>

            {/* 信息使用 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 信息使用</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>账号管理：</strong>用户名和邮箱用于账号识别和登录验证</li>
                <li><strong>服务提供：</strong>使用收集的信息提供和改进服务</li>
                <li><strong>安全保护：</strong>登录记录用于检测异常登录行为</li>
              </ul>
            </section>

            {/* 信息保护 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 信息保护</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 加密存储</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>安全承诺：</strong>所有用户信息都经过高强度加密后存储在数据库中
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>数据库加密：采用业界标准的安全加密技术保护所有敏感数据</li>
                <li>传输加密：所有数据传输都通过HTTPS协议进行</li>
                <li>访问控制：严格的权限管理和身份验证机制</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">4.2 数据安全</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>服务器安全：部署在安全的数据中心，具备多重防护</li>
                <li>备份安全：定期备份数据，备份文件同样加密存储</li>
                <li>定期审计：定期进行安全评估和漏洞扫描</li>
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
                <li><strong>数据导出权：</strong>导出您的个人数据</li>
              </ul>
            </section>

            {/* 数据保留 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 数据保留</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                我们保留您的个人信息的时间取决于以下因素：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>账号信息：</strong>在您的账号存在期间保留</li>
                <li><strong>使用数据：</strong>匿名化后保留用于服务改进</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                当您删除账号时，我们将删除所有相关个人信息，除非法律要求保留。
              </p>
            </section>

            {/* 数据存储位置 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 数据存储位置</h2>
              <p className="text-gray-700 leading-relaxed">
                我们的服务器位于中国大陆，所有用户数据都存储在国内，不会传输到其他国家或地区。
                我们严格遵守中国的数据保护法律法规，确保您的数据安全。
              </p>
            </section>

            {/* 政策更新 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 政策更新</h2>
              <p className="text-gray-700 leading-relaxed">
                我们可能会不时更新本隐私协议。重大变更时，我们将通过邮件或其他方式通知您。建议您定期查看本协议的最新版本。
              </p>
            </section>

            {/* 联系我们 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 联系我们</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                如果您对本隐私协议有任何疑问、意见或建议，请通过以下方式联系我们：
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>• 邮箱：2358155969@qq.com</li>
                  <li>• 小程序客服：通过设置中的联系客服可以与人工客服取得联系</li>
                  <li>• 意见反馈：通过设置中的意见反馈可以向开发者反馈问题以及相关建议</li>
                </ul>
              </div>
            </section>

            {/* 协议确认 */}
            <section className="border-t pt-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">协议确认</h3>
                <p className="text-green-800 leading-relaxed">
                  使用我们的APP即表示您已阅读、理解并同意本隐私协议的所有条款。
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