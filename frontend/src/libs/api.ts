const baseUrl = import.meta.env.VITE_API_URL ?? '/api'

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })

  if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อระบบได้')
  return response.json() as Promise<T>
}
