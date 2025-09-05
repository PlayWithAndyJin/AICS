import { getValidAccessToken } from '@/lib/tokenManager'

export interface DeviceInfo {
  deviceId: string
  lastActiveAt: string
}

async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const accessToken = getValidAccessToken()
  if (!accessToken) throw new Error('No access token')
  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Bearer ${accessToken}`)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(input, { ...init, headers })
}

export async function listDevices(): Promise<DeviceInfo[]> {
  const res = await authorizedFetch('/api/auth/devices', { method: 'GET' })
  if (!res.ok) throw new Error(`List devices failed: ${res.status}`)
  const data = await res.json()
  return data.devices || []
}

export async function kickDevice(deviceId: string): Promise<boolean> {
  const res = await authorizedFetch('/api/auth/devices', {
    method: 'DELETE',
    body: JSON.stringify({ deviceId })
  })
  if (!res.ok) return false
  const data = await res.json()
  return !!data.success
}

// 只保留最近活跃的一台设备，踢掉其它设备（网页端仅单会话）
export async function enforceSingleWebSession(): Promise<void> {
  try {
    const devices = await listDevices()
    if (devices.length <= 1) return
    const sorted = [...devices].sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    )
    const toKick = sorted.slice(1)
    for (const d of toKick) {
      await kickDevice(d.deviceId)
    }
  } catch {
    // 忽略错误确保流程不中断
  }
}
