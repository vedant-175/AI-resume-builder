import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type CvAnalysis = {
  score: number
  improvements: string[]
  enhancedSuggestions: string[]
}

function hasPattern(text: string, pattern: RegExp) {
  return pattern.test(text)
}

function analyzeCv(text: string): CvAnalysis {
  const normalized = text.toLowerCase()
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const checks = [
    hasPattern(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i),
    hasPattern(text, /(\+?\d[\d\s().-]{8,}\d)/),
    hasPattern(normalized, /linkedin|github|portfolio/),
    hasPattern(normalized, /summary|profile|objective/),
    hasPattern(normalized, /skills|technical skills/),
    hasPattern(normalized, /experience|internship|work history/),
    hasPattern(normalized, /project|projects/),
    hasPattern(normalized, /education|degree|university|college/),
    hasPattern(text, /\b\d+%|\b\d+x|\b\d+\+|\b\d{4}\b/),
    wordCount >= 250 && wordCount <= 850,
  ]

  const improvements: string[] = []
  const enhancedSuggestions: string[] = []

  if (!checks[0] || !checks[1]) {
    improvements.push('Add a clear email and phone number in the header.')
  }
  if (!checks[2]) {
    improvements.push('Add LinkedIn, GitHub, or portfolio links if relevant.')
  }
  if (!checks[3]) {
    improvements.push('Add a short professional summary with role keywords.')
    enhancedSuggestions.push('Open with your target role, strongest skills, and measurable impact.')
  }
  if (!checks[4]) {
    improvements.push('Create a Technical Skills section with exact job keywords.')
  }
  if (!checks[5] && !checks[6]) {
    improvements.push('Add experience or project sections to prove role fit.')
  }
  if (!checks[8]) {
    improvements.push('Use measurable results such as percentages, counts, timelines, or scale.')
    enhancedSuggestions.push('Rewrite bullets as action verb + task + tool + measurable result.')
  }
  if (!checks[9]) {
    improvements.push('Keep the resume concise, ideally one page for fresher or early-career roles.')
  }

  if (enhancedSuggestions.length === 0) {
    enhancedSuggestions.push('Use standard ATS headings: Summary, Skills, Experience, Projects, Education.')
    enhancedSuggestions.push('Match important job-description keywords without adding skills you do not have.')
  }

  return {
    score: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    improvements,
    enhancedSuggestions,
  }
}

export function TemplatesPage() {
  const [fileName, setFileName] = useState('')
  const [cvText, setCvText] = useState('')
  const [fileError, setFileError] = useState('')

  const analysis = useMemo(() => (cvText.trim() ? analyzeCv(cvText) : null), [cvText])
  const score = analysis?.score ?? 0
  const improvements = analysis?.improvements.length
    ? analysis.improvements
    : ['Upload or paste CV text to generate ATS improvement points.']
  const suggestions = analysis?.enhancedSuggestions.length
    ? analysis.enhancedSuggestions
    : [
        'Clear sections and role keywords improve parser accuracy.',
        'Measurable bullets make the resume stronger for recruiters and ATS ranking.',
      ]

  async function onUpload(file: File | undefined) {
    setFileError('')
    setFileName(file?.name ?? '')
    setCvText('')

    if (!file) return

    try {
      const text = await file.text()
      const readableText = Array.from(text)
        .map((char) => {
          const code = char.charCodeAt(0)
          return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126)
            ? char
            : ' '
        })
        .join('')
        .trim()

      if (readableText.length < 80) {
        setFileError('This file could not be read as resume text. Paste the CV text below.')
      }

      setCvText(readableText)
    } catch {
      setFileError('Could not read this CV file. Paste the CV text below.')
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-112px)] gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Start Your Resume</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Choose a fresh custom resume flow or improve an existing CV with ATS feedback.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-center ring-1 ring-slate-200">
            <div>
              <div className="text-lg font-bold text-violet-700">2</div>
              <div className="text-xs text-slate-600">Options</div>
            </div>
            <div>
              <div className="text-lg font-bold text-violet-700">{score}</div>
              <div className="text-xs text-slate-600">ATS</div>
            </div>
            <div>
              <div className="text-lg font-bold text-violet-700">PDF</div>
              <div className="text-xs text-slate-600">Ready</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Custom Resume</h2>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  Manual
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Build a complete resume from your own details, then generate the preview and PDF
                from the builder.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  ['Personal details', 'Name, role, contact, portfolio'],
                  ['Education', 'Degree, college, year, CGPA or percentage'],
                  ['Skills', 'Languages, developer tools, technologies'],
                  ['Projects and experience', 'Work, internships, outcomes'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="mt-1 text-xs text-slate-600">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/builder"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Start Builder
            </Link>
          </div>
        </section>

        <section className="min-h-[520px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid h-full gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">CV Enhancer</h2>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  ATS Check
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Upload or paste your CV to see ATS strength and targeted improvement points.
              </p>

              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={(event) => onUpload(event.target.files?.[0])}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-700"
                />
                {fileName ? <p className="mt-2 text-xs text-slate-500">{fileName}</p> : null}
                {fileError ? <p className="mt-2 text-sm text-rose-700">{fileError}</p> : null}
              </div>

              <label htmlFor="cvText" className="mt-5 block text-sm font-medium text-slate-700">
                CV Text
              </label>
              <textarea
                id="cvText"
                value={cvText}
                rows={10}
                onChange={(event) => setCvText(event.target.value)}
                placeholder="Paste CV text here if the uploaded file cannot be read."
                className="mt-1 min-h-56 flex-1 resize-y rounded-md bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex flex-col rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-900">ATS Analysis</h3>
              <div className="mt-4 flex items-end gap-2">
                <div className="text-5xl font-bold text-violet-700">{score}</div>
                <div className="pb-2 text-sm font-medium text-slate-600">/100</div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-violet-600"
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-900">Ways to Improve</h4>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {improvements.map((item) => (
                    <li key={item} className="rounded-md bg-white px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-900">Enhancement Suggestions</h4>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {suggestions.map((item) => (
                    <li key={item} className="rounded-md bg-white px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
