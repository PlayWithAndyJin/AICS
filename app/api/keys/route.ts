import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import { encryptWithUniqueKey, decryptWithUniqueKey, validateUniqueKey, verifyRequestSignature } from '@/lib/crypto'

function generateUniqueKey(): string {
  return crypto.randomBytes(16).toString('hex')
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uniqueKey = searchParams.get('key')
    const userId = searchParams.get('userId')
    const model = searchParams.get('model')
    
    if (userId) {
      const result = await pool.query(
        'SELECT * FROM user_keys WHERE user_id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: null,
          message: '用户暂无密钥记录'
        })
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    }

    if (uniqueKey) {
      const requestUserId = searchParams.get('userId')
      const timestamp = searchParams.get('timestamp')
      const signature = searchParams.get('signature')
      
      if (!requestUserId || !timestamp || !signature) {
        return NextResponse.json(
          { error: '缺少必要参数：userId、timestamp、signature' },
          { status: 400 }
        )
      }

      // 验证时间戳（防止重放攻击，5分钟内有效）
      const currentTime = Math.floor(Date.now() / 1000)
      const requestTime = parseInt(timestamp)
      if (currentTime - requestTime > 300) { // 5分钟 = 300秒
        return NextResponse.json(
          { error: '请求已过期，请重新生成签名' },
          { status: 401 }
        )
      }

      // 验证签名
      if (!verifyRequestSignature(requestUserId, uniqueKey, requestTime, signature)) {
        return NextResponse.json(
          { error: '签名验证失败' },
          { status: 401 }
        )
      }

      // 查询密钥记录并验证所有者
      const result = await pool.query(
        'SELECT * FROM user_keys WHERE unique_key = $1 AND user_id = $2 AND is_active = true',
        [uniqueKey, requestUserId]
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
          // 如果不指定模型，返回所有可用的密钥信息（不包含具体值）
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
      // 直接返回加密数据，客户端使用唯一密钥解密
      apiKey = encryptedData

      // 更新使用统计
      await pool.query(
        'UPDATE user_keys SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [keyRecord.id]
      )

      // 返回API密钥
      return NextResponse.json({
        success: true,
        data: {
          model: model,
          apiKey: apiKey
        }
      })
    }

    return NextResponse.json(
      { error: '缺少必要参数：key或userId' },
      { status: 400 }
    )

  } catch (error) {
    console.error('获取API密钥失败:', error)
    return NextResponse.json(
      { error: '获取API密钥失败' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId, aliyunApiKey, deepseekApiKey, volcanoApiKey } = await req.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    // 检查是否已存在记录
    const existingRecord = await pool.query(
      'SELECT id, unique_key FROM user_keys WHERE user_id = $1',
      [userId]
    )

    let result
    if (existingRecord.rows.length > 0) {
      // 更新现有记录，使用现有唯一密钥加密
      const currentUniqueKey = existingRecord.rows[0].unique_key
      
      // 加密API密钥
      const encryptedAliyun = aliyunApiKey ? encryptWithUniqueKey(aliyunApiKey, currentUniqueKey) : null
      const encryptedDeepseek = deepseekApiKey ? encryptWithUniqueKey(deepseekApiKey, currentUniqueKey) : null
      const encryptedVolcano = volcanoApiKey ? encryptWithUniqueKey(volcanoApiKey, currentUniqueKey) : null
      
      result = await pool.query(`
        UPDATE user_keys 
        SET 
          aliyun_api_key = $2,
          deepseek_api_key = $3,
          volcano_api_key = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `, [
        userId, 
        encryptedAliyun ? JSON.stringify(encryptedAliyun) : null,
        encryptedDeepseek ? JSON.stringify(encryptedDeepseek) : null,
        encryptedVolcano ? JSON.stringify(encryptedVolcano) : null
      ])
    } else {
      // 创建新记录，自动生成唯一密钥
      const uniqueKey = generateUniqueKey()
      
      // 加密API密钥
      const encryptedAliyun = aliyunApiKey ? encryptWithUniqueKey(aliyunApiKey, uniqueKey) : null
      const encryptedDeepseek = deepseekApiKey ? encryptWithUniqueKey(deepseekApiKey, uniqueKey) : null
      const encryptedVolcano = volcanoApiKey ? encryptWithUniqueKey(volcanoApiKey, uniqueKey) : null
      
      result = await pool.query(`
        INSERT INTO user_keys 
        (unique_key, user_id, aliyun_api_key, deepseek_api_key, volcano_api_key)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        uniqueKey, 
        userId,
        encryptedAliyun ? JSON.stringify(encryptedAliyun) : null,
        encryptedDeepseek ? JSON.stringify(encryptedDeepseek) : null,
        encryptedVolcano ? JSON.stringify(encryptedVolcano) : null
      ])
    }

    const keyRecord = result.rows[0]
    
    return NextResponse.json({
      success: true,
      data: {
        uniqueKey: keyRecord.unique_key,
        message: existingRecord.rows.length > 0 ? '密钥更新成功' : '密钥创建成功，请保存您的唯一密钥',
        availableModels: {
          aliyun: !!keyRecord.aliyun_api_key,
          deepseek: !!keyRecord.deepseek_api_key,
          volcano: !!keyRecord.volcano_api_key
        }
      }
    })

  } catch (error) {
    console.error('保存密钥失败:', error)
    return NextResponse.json(
      { error: '保存密钥失败' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, aliyunApiKey, deepseekApiKey, volcanoApiKey, regenerateUniqueKey } = await req.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    // 检查用户记录是否存在
    const existingRecord = await pool.query(
      'SELECT id, unique_key FROM user_keys WHERE user_id = $1',
      [userId]
    )

    if (existingRecord.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到该用户的密钥记录' },
        { status: 404 }
      )
    }

    const currentUniqueKey = existingRecord.rows[0].unique_key

    if (regenerateUniqueKey) {
      // 重新生成唯一密钥
      const newUniqueKey = generateUniqueKey()
      const result = await pool.query(`
        UPDATE user_keys 
        SET unique_key = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING unique_key
      `, [userId, newUniqueKey])

      return NextResponse.json({
        success: true,
        data: {
          newUniqueKey: result.rows[0].unique_key,
          message: '唯一密钥已重新生成，请保存新的密钥'
        }
      })
    } else {
      // 更新API密钥
      const encryptedAliyun = aliyunApiKey ? encryptWithUniqueKey(aliyunApiKey, currentUniqueKey) : null
      const encryptedDeepseek = deepseekApiKey ? encryptWithUniqueKey(deepseekApiKey, currentUniqueKey) : null
      const encryptedVolcano = volcanoApiKey ? encryptWithUniqueKey(volcanoApiKey, currentUniqueKey) : null
      
      const result = await pool.query(`
        UPDATE user_keys 
        SET 
          aliyun_api_key = COALESCE($2, aliyun_api_key),
          deepseek_api_key = COALESCE($3, deepseek_api_key),
          volcano_api_key = COALESCE($4, volcano_api_key),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `, [
        userId, 
        encryptedAliyun ? JSON.stringify(encryptedAliyun) : null,
        encryptedDeepseek ? JSON.stringify(encryptedDeepseek) : null,
        encryptedVolcano ? JSON.stringify(encryptedVolcano) : null
      ])

      const keyRecord = result.rows[0]
      
      return NextResponse.json({
        success: true,
        data: {
          message: 'API密钥更新成功',
          availableModels: {
            aliyun: !!keyRecord.aliyun_api_key,
            deepseek: !!keyRecord.deepseek_api_key,
            volcano: !!keyRecord.volcano_api_key
          }
        }
      })
    }

  } catch (error) {
    console.error('更新密钥失败:', error)
    return NextResponse.json(
      { error: '更新密钥失败' },
      { status: 500 }
    )
  }
}

// 删除用户密钥记录
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