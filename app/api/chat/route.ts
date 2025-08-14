import { NextResponse } from 'next/server'

// 通义千问API配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const DASHSCOPE_APP_ID = process.env.DASHSCOPE_APP_ID

// 存储用户会话的Map（在生产环境中应该使用Redis等持久化存储）
const userSessions = new Map<string, any[]>()

// 生成会话ID
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export async function POST(req: Request) {
  try {
    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: '通义千问API密钥未配置' },
        { status: 500 }
      )
    }

    if (!DASHSCOPE_APP_ID) {
      return NextResponse.json(
        { error: '通义千问应用ID未配置' },
        { status: 500 }
      )
    }

    const { message, sessionId: clientSessionId } = await req.json()
    
    // 获取或创建会话ID
    const sessionId = clientSessionId || generateSessionId()
    
    // 获取用户会话历史
    let userMessages = userSessions.get(sessionId) || []
    
    // 添加用户新消息
    userMessages.push({
      role: 'user',
      content: message
    })

    // 构建请求体，包含会话历史
    const requestBody = {
      input: {
        prompt: userMessages[userMessages.length - 1].content
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.8
      }
    }

    // 调用通义千问API
    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/apps/${DASHSCOPE_APP_ID}/completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('通义千问API错误:', response.status, errorText)
      return NextResponse.json(
        { error: 'AI服务暂时不可用，请稍后重试' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (data.output && data.output.text) {
      const aiMessage = {
        role: 'assistant',
        content: data.output.text
      }
      
      // 添加AI回复到用户会话历史
      userMessages.push(aiMessage)
      
      // 更新会话存储
      userSessions.set(sessionId, userMessages)
      
      // 清理过长的会话历史（保留最近20条消息）
      if (userMessages.length > 20) {
        userMessages = userMessages.slice(-20)
        userSessions.set(sessionId, userMessages)
      }

      return NextResponse.json({
        message: aiMessage.content,
        sessionId: sessionId
      })
    } else {
      return NextResponse.json(
        { error: 'AI回复格式异常' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
} 
