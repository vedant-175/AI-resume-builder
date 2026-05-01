import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../apiFetch'

export type AiGenerateReq = {
  section: 'summary' | 'experience' | 'project' | 'skills'
  inputs: unknown
  constraints: { noFabrication: boolean; atsFriendly: boolean }
  temperature: number
  topP: number
}

export type AiGenerateRes = {
  text: string
  usage?: { inputTokens: number; outputTokens: number }
}

export function useAiGenerateMutation() {
  return useMutation({
    mutationFn: (body: AiGenerateReq) =>
      apiFetch<AiGenerateRes>('/api/ai/resume/generate', {
        method: 'POST',
        body: JSON.stringify(body),
        timeoutMs: 45_000,
      }),
  })
}

