import { NextResponse } from 'next/server'

// 通义千问云端知识库API配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || ''
const APP_ID = process.env.DASHSCOPE_APP_ID || ''
const API_URL = APP_ID ? `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion` : ''

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    // 检查API密钥和APP_ID
    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: '通义千问API密钥未配置，请在环境变量中设置DASHSCOPE_API_KEY' }, 
        { status: 500 }
      )
    }

    if (!APP_ID) {
      return NextResponse.json(
        { error: '通义千问APP_ID未配置，请在环境变量中设置DASHSCOPE_APP_ID' }, 
        { status: 500 }
      )
    }

    // 获取用户最新问题
    const userMessage = messages[messages.length - 1]
    if (!userMessage || userMessage.role !== 'user') {
      return NextResponse.json({ error: '无效的用户消息' }, { status: 400 })
    }

    // 构建云端知识库API请求
    const requestBody = {
      input: {
        prompt: userMessage.content
      },
      parameters: {
        // 可以在这里添加模型参数配置
        temperature: 0.7,
        max_tokens: 1000
      },
      debug: {}
    }

    // 调用云端知识库API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`云端知识库API请求失败: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.output && data.output.text) {
      return NextResponse.json({ 
        message: data.output.text,
        timestamp: new Date().toISOString(),
        sessionId: data.output.session_id,
        requestId: data.request_id,
        usage: data.usage
      })
    } else {
      throw new Error('云端知识库API响应格式错误')
    }
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    // 如果API调用失败，返回友好的错误信息
    return NextResponse.json(
      { 
        error: '抱歉，AI服务暂时不可用，请稍后再试或联系人工客服',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
} 