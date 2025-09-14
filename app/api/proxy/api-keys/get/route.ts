import { NextResponse } from 'next/server'
import { decryptUniqueKey } from '@/lib/crypto'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '缺少Authorization头' },
        { status: 401 }
      )
    }

    const response = await fetch('https://api.andyjin.website/api/keys/unique-key', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (response.ok && data.uniqueKey) {
      try {
        console.log('开始解密唯一密钥...')
        console.log('加密的唯一密钥:', data.uniqueKey)
        console.log('环境变量UNIQUE_KEY_ENCRYPTION_KEY是否存在:', !!process.env.UNIQUE_KEY_ENCRYPTION_KEY)
        
        const decryptedKey = decryptUniqueKey(data.uniqueKey)
        console.log('解密后的唯一密钥:', decryptedKey)
        
        data.uniqueKey = decryptedKey
      } catch (decryptError) {
        console.error('解密唯一密钥失败:', decryptError)
        const errorMessage = decryptError instanceof Error ? decryptError.message : String(decryptError);
        console.error('错误详情:', errorMessage)
        return NextResponse.json(
          { error: '解密唯一密钥失败: ' + errorMessage },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('代理请求失败:', error)
    return NextResponse.json(
      { error: '代理请求失败' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
