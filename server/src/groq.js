import { z } from 'zod'

export class GroqHttpError extends Error {
  status
  type
  constructor(message, status, type) {
    super(message)
    this.name = 'GroqHttpError'
    this.status = status
    this.type = type
  }
}

const GroqResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().optional() }),
      }),
    )
    .optional(),
  error: z
    .object({
      message: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
})

export async function groqGenerateText({ apiKey, model, prompt, temperature, topP }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      top_p: topP,
      messages: [
        {
          role: 'system',
          content:
            'You are a career-domain assistant that writes ATS-friendly resumes. Return only the resume content requested.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const json = await res.json().catch(() => ({}))
  const parsed = GroqResponseSchema.safeParse(json)
  const data = parsed.success ? parsed.data : {}

  if (!res.ok) {
    const msg = data?.error?.message || `Groq request failed (${res.status})`
    throw new GroqHttpError(msg, res.status, data?.error?.type)
  }

  const text = data?.choices?.[0]?.message?.content ?? ''
  return { text }
}

