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
    
    // 如果获取成功且包含加密的唯一密钥，则解密它
    if (response.ok && data.uniqueKey) {
      try {
        const decryptedKey = decryptUniqueKey(data.uniqueKey)
        data.uniqueKey = decryptedKey
      } catch (decryptError) {
        console.error('解密唯一密钥失败:', decryptError)
        return NextResponse.json(
          { error: '解密唯一密钥失败' },
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
