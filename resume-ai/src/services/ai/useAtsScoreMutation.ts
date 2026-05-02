import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../apiFetch'

export type AtsScoreReq = {
  resumeText: string
}

export type AtsScoreRes = {
  score: number
  tips: string[]
}

export function useAtsScoreMutation() {
  return useMutation({
    mutationFn: (body: AtsScoreReq) =>
      apiFetch<AtsScoreRes>('/api/ai/ats/score', {
        method: 'POST',
        body: JSON.stringify(body),
        timeoutMs: 30_000,
      }),
  })
}