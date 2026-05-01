export class ApiError extends Error {
  status: number
  code?: string
  requestId?: string

  constructor(message: string, status: number, opts?: { code?: string; requestId?: string }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = opts?.code
    this.requestId = opts?.requestId
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const controller = new AbortController()
  const timeoutMs = init?.timeoutMs ?? 30_000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(path, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      credentials: 'include',
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status, {
        code: body.code,
        requestId: body.requestId,
      })
    }

    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

