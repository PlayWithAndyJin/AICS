import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import { verifyRequestSignature } from '@/lib/crypto'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uniqueKey = searchParams.get('key')
    const userId = searchParams.get('userId')
    const model = searchParams.get('model')
    const timestamp = searchParams.get('timestamp')
    const signature = searchParams.get('signature')
    
    if (!uniqueKey) {
      return NextResponse.json(
        { error: '缺少必要参数：key' },
        { status: 400 }
      )
    }

    if (!userId || !timestamp || !signature) {
      return NextResponse.json(
        { error: '缺少必要参数：userId、timestamp、signature' },
        { status: 400 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const requestTime = parseInt(timestamp)
    if (currentTime - requestTime > 300) {
      return NextResponse.json(
        { error: '请求已过期，请重新生成签名' },
        { status: 401 }
      )
    }

    if (!verifyRequestSignature(userId, uniqueKey, requestTime, signature)) {
      return NextResponse.json(
        { error: '签名验证失败' },
        { status: 401 }
      )
    }

    const result = await pool.query(
      'SELECT * FROM user_keys WHERE unique_key = $1 AND user_id = $2 AND is_active = true',
      [uniqueKey, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '无效的密钥或密钥不属于该用户' },
        { status: 401 }
      )
    }

    const keyRecord = result.rows[0]
    
    let apiKey = null
    let encryptedData = null
    
    switch (model?.toLowerCase()) {
      case 'aliyun':
        encryptedData = keyRecord.aliyun_api_key
        break
      case 'deepseek':
        encryptedData = keyRecord.deepseek_api_key
        break
      case 'volcano':
        encryptedData = keyRecord.volcano_api_key
        break
      default:
        return NextResponse.json({
          success: true,
          data: {
            availableModels: {
              aliyun: !!keyRecord.aliyun_api_key,
              deepseek: !!keyRecord.deepseek_api_key,
              volcano: !!keyRecord.volcano_api_key
            },
            usageCount: keyRecord.usage_count,
            lastUsedAt: keyRecord.last_used_at
          }
        })
    }

    if (!encryptedData) {
      return NextResponse.json(
        { error: `未找到${model}模型的API密钥` },
        { status: 404 }
      )
    }

    apiKey = encryptedData

    await pool.query(
      'UPDATE user_keys SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [keyRecord.id]
    )

    return NextResponse.json({
      success: true,
      data: {
        model: model,
        apiKey: apiKey
      }
    })

  } catch (error) {
    console.error('获取API密钥失败:', error)
    return NextResponse.json(
      { error: '获取API密钥失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM user_keys WHERE user_id = $1 RETURNING *',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到该用户的密钥记录' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '密钥记录删除成功'
    })

  } catch (error) {
    console.error('删除密钥失败:', error)
    return NextResponse.json(
      { error: '删除密钥失败' },
      { status: 500 }
    )
  }
} 
