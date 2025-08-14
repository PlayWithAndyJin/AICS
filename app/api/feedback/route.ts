import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// API密钥验证
const API_KEY = process.env.FEEDBACK_API_KEY || ''

// 邮件配置
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '', // 发件人邮箱
    pass: process.env.SMTP_PASS || '', // 邮箱授权码
  },
}

// 开发者邮箱
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || ''

export async function POST(req: Request) {
  try {
    // 验证API密钥
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== API_KEY) {
      return NextResponse.json(
        { error: 'API密钥验证失败' },
        { status: 401 }
      )
    }

    const { name, qqContact, wechatContact, emailContact, phoneContact, title, type, content, appVersion } = await req.json()

    // 验证必填字段
    if (!title || !type || !content || !appVersion) {
      return NextResponse.json(
        { error: '请填写所有必填字段：标题、类型、反馈内容、App版本' },
        { status: 400 }
      )
    }

    // 检查邮件配置
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      return NextResponse.json(
        { error: '邮件服务未配置，请联系管理员' },
        { status: 500 }
      )
    }

    if (!DEVELOPER_EMAIL) {
      return NextResponse.json(
        { error: '开发者邮箱未配置' },
        { status: 500 }
      )
    }

    // 创建邮件传输器
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)

    // 构建邮件内容
    const mailOptions = {
      from: `"智能客服系统反馈" <${EMAIL_CONFIG.auth.user}>`,
      to: DEVELOPER_EMAIL,
      subject: `[${title}端用户反馈] ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">用户反馈</h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">反馈详情</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${name ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 120px;">姓名：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
              </tr>
              ` : ''}
              ${qqContact ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">QQ：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${qqContact}</td>
              </tr>
              ` : ''}
              ${wechatContact ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">微信：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${wechatContact}</td>
              </tr>
              ` : ''}
              ${emailContact ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">邮箱：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${emailContact}</td>
              </tr>
              ` : ''}
              ${phoneContact ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">电话：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${phoneContact}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">类型：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${type}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">App版本：</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${appVersion}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">反馈内容</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${content}</p>
            </div>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
            <p style="margin: 0;">提交时间：${new Date().toLocaleString('zh-CN')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">此邮件由智能客服系统自动发送</p>
          </div>
        </div>
      `,
      text: `
用户反馈

反馈详情：
${name ? `姓名：${name}` : ''}
${qqContact ? `QQ：${qqContact}` : ''}
${wechatContact ? `微信：${wechatContact}` : ''}
${emailContact ? `邮箱：${emailContact}` : ''}
${phoneContact ? `电话：${phoneContact}` : ''}
类型：${type}
App版本：${appVersion}

反馈内容：
${content}

提交时间：${new Date().toLocaleString('zh-CN')}
      `,
    }

    // 发送邮件
    await transporter.sendMail(mailOptions)

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '反馈提交成功，我们会尽快处理您的反馈',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Feedback API error:', error)

    return NextResponse.json(
      {
        error: '反馈提交失败，请稍后重试或联系客服',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 
