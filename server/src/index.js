import 'dotenv/config'
import express from 'express'
import { z } from 'zod'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { GeminiHttpError, geminiGenerateText } from './gemini.js'
import { GroqHttpError, groqGenerateText } from './groq.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '1mb' }))

const PORT = Number(process.env.PORT || 8787)
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const AI_PROVIDER = (process.env.AI_PROVIDER || '').toLowerCase()

if (!GEMINI_API_KEY && !GROQ_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing API key. Set GROQ_API_KEY (recommended) or GEMINI_API_KEY in server/.env.',
  )
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const AiGenerateReq = z.object({
  section: z.enum(['summary', 'experience', 'project', 'skills']),
  inputs: z.unknown(),
  constraints: z.object({
    noFabrication: z.boolean().default(true),
    atsFriendly: z.boolean().default(true),
  }),
  temperature: z.number().min(0).max(2).default(0.4),
  topP: z.number().min(0).max(1).default(0.9),
})

function buildPrompt({ section, inputs, constraints }) {
  const rules = [
    'You are a career-domain assistant that writes ATS-friendly resumes.',
    'Return only resume content (no markdown headings, no explanations).',
    constraints.noFabrication
      ? 'Do NOT fabricate companies, degrees, dates, titles, metrics, or certifications. If info is missing, write a conservative version without inventing details.'
      : null,
    constraints.atsFriendly
      ? 'Prefer simple wording, strong action verbs, and measurable impact when provided. Keep it concise.'
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const sectionInstruction =
    section === 'summary'
      ? 'Write a 2–3 line professional summary.'
      : section === 'experience'
        ? 'Write 3–5 bullet points for a resume experience entry.'
        : section === 'project'
          ? 'Write 3–5 bullet points for a resume project entry.'
          : 'Suggest a compact, role-relevant skills list grouped by category.'

  return `${rules}\n\nTask: ${sectionInstruction}\n\nUser data (JSON):\n${JSON.stringify(
    inputs,
    null,
    2,
  )}`
}

app.post('/api/ai/resume/generate', async (req, res) => {
  const parsed = AiGenerateReq.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid request body',
      details: parsed.error.flatten(),
    })
  }

  const provider =
    AI_PROVIDER === 'groq' || AI_PROVIDER === 'gemini'
      ? AI_PROVIDER
      : GROQ_API_KEY
        ? 'groq'
        : 'gemini'

  if (provider === 'groq' && !GROQ_API_KEY) {
    return res.status(500).json({
      code: 'MISSING_API_KEY',
      message: 'Backend is missing GROQ_API_KEY',
    })
  }

  if (provider === 'gemini' && !GEMINI_API_KEY) {
    return res.status(500).json({
      code: 'MISSING_API_KEY',
      message: 'Backend is missing GEMINI_API_KEY',
    })
  }

  try {
    const { section, inputs, constraints, temperature, topP } = parsed.data
    const prompt = buildPrompt({ section, inputs, constraints })
    const out =
      provider === 'groq'
        ? await groqGenerateText({
            apiKey: GROQ_API_KEY,
            model: GROQ_MODEL,
            prompt,
            temperature,
            topP,
          })
        : await geminiGenerateText({
            apiKey: GEMINI_API_KEY,
            model: GEMINI_MODEL,
            prompt,
            temperature,
            topP,
          })
    return res.json({ text: out.text })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const lower = typeof message === 'string' ? message.toLowerCase() : ''
    const isInvalidKey =
      lower.includes('api key not valid') ||
      lower.includes('invalid api key') ||
      lower.includes('invalid_api_key') ||
      lower.includes('unauthorized')

    if (e instanceof GeminiHttpError) {
      return res.status(isInvalidKey ? 401 : 502).json({
        code: isInvalidKey ? 'INVALID_API_KEY' : 'GEMINI_ERROR',
        message,
        upstream: { httpStatus: e.status, status: e.geminiStatus ?? null },
      })
    }

    if (e instanceof GroqHttpError) {
      return res.status(isInvalidKey ? 401 : 502).json({
        code: isInvalidKey ? 'INVALID_API_KEY' : 'GROQ_ERROR',
        message,
        upstream: { httpStatus: e.status, type: e.type ?? null },
      })
    }

    return res.status(isInvalidKey ? 401 : 502).json({
      code: isInvalidKey ? 'INVALID_API_KEY' : 'GEMINI_ERROR',
      message,
    })
  }
})

// Serve built frontend
const distPath = join(__dirname, '../../resume-ai/dist')
app.use(express.static(distPath, { maxAge: '1d' }))

// SPA fallback - serve index.html for unmatched routes
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`)
})

