import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { exportResumePdf } from '../pdf/exportResumePdf'
import type { ResumePdfData } from '../pdf/types'
import { useResumeStore, type ResumeDraft } from '../state/resumeStore'
import { useAtsScoreMutation } from '../services/ai/useAtsScoreMutation'

function hasText(value: string) {
  return value.trim().length > 0
}

function hasAnyDraftContent(draft: ResumeDraft) {
  return [
    draft.personal.fullName,
    draft.personal.targetRole,
    draft.personal.email,
    draft.personal.phone,
    draft.personal.linkedin,
    draft.personal.portfolio,
    draft.summary,
    draft.education.degree,
    draft.education.college,
    draft.education.gradYear,
    draft.education.cgpa,
    draft.skills.languages,
    draft.skills.developerTools,
    draft.skills.technologies,
    draft.certifications,
    draft.achievements,
    draft.activities,
    ...draft.projects.flatMap((p) => [p.name, p.description]),
    ...draft.experiences.flatMap((x) => [x.company, x.title, x.description]),
  ].some(hasText)
}

function draftToText(draft: ResumeDraft): string {
  const sections = []

  // Personal
  if (hasText(draft.personal.fullName)) sections.push(`${draft.personal.fullName}`)
  if (hasText(draft.personal.targetRole)) sections.push(`${draft.personal.targetRole}`)
  if (hasText(draft.personal.email)) sections.push(`Email: ${draft.personal.email}`)
  if (hasText(draft.personal.phone)) sections.push(`Phone: ${draft.personal.phone}`)
  if (hasText(draft.personal.linkedin)) sections.push(`LinkedIn: ${draft.personal.linkedin}`)
  if (hasText(draft.personal.portfolio)) sections.push(`Portfolio: ${draft.personal.portfolio}`)

  // Summary
  if (hasText(draft.summary)) sections.push(`\nSUMMARY\n${draft.summary}`)

  // Education
  if (hasText(draft.education.degree) || hasText(draft.education.college)) {
    sections.push(`\nEDUCATION\n${draft.education.degree} from ${draft.education.college}${hasText(draft.education.gradYear) ? ` (${draft.education.gradYear})` : ''}${hasText(draft.education.cgpa) ? ` - CGPA: ${draft.education.cgpa}` : ''}`)
  }

  // Skills
  const skills = []
  if (hasText(draft.skills.languages)) skills.push(`Languages: ${draft.skills.languages}`)
  if (hasText(draft.skills.developerTools)) skills.push(`Developer Tools: ${draft.skills.developerTools}`)
  if (hasText(draft.skills.technologies)) skills.push(`Technologies: ${draft.skills.technologies}`)
  if (skills.length > 0) sections.push(`\nSKILLS\n${skills.join('\n')}`)

  // Experience
  if (draft.experiences.length > 0) {
    sections.push(`\nEXPERIENCE`)
    draft.experiences.forEach(exp => {
      if (hasText(exp.company) || hasText(exp.title)) {
        sections.push(`${exp.title} at ${exp.company}`)
        if (hasText(exp.description)) sections.push(exp.description)
      }
    })
  }

  // Projects
  if (draft.projects.length > 0) {
    sections.push(`\nPROJECTS`)
    draft.projects.forEach(proj => {
      if (hasText(proj.name)) {
        sections.push(proj.name)
        if (hasText(proj.description)) sections.push(proj.description)
      }
    })
  }

  // Certifications
  if (hasText(draft.certifications)) sections.push(`\nCERTIFICATIONS\n${draft.certifications}`)

  // Achievements
  if (hasText(draft.achievements)) sections.push(`\nACHIEVEMENTS\n${draft.achievements}`)

  // Activities
  if (hasText(draft.activities)) sections.push(`\nACTIVITIES\n${draft.activities}`)

  return sections.join('\n\n')
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function toPdfData(draft: ResumeDraft): ResumePdfData {
  const githubMaybe =
    draft.personal.portfolio.toLowerCase().includes('github.com') ? draft.personal.portfolio : ''

  return {
    personal: {
      fullName: draft.personal.fullName,
      phone: draft.personal.phone,
      email: draft.personal.email,
      linkedin: draft.personal.linkedin,
      github: githubMaybe || undefined,
      portfolio: githubMaybe ? undefined : draft.personal.portfolio,
    },
    summary: draft.summary,
    education: [
      {
        titleLeft: draft.education.college,
        dateRight: draft.education.gradYear,
        subtitleItalic: draft.education.degree,
        bullets: draft.education.cgpa ? [`CGPA/Percentage: ${draft.education.cgpa}`] : [],
      },
    ].filter((entry) =>
      [entry.titleLeft, entry.dateRight, entry.subtitleItalic, ...(entry.bullets ?? [])].some(hasText),
    ),
    skills: {
      languages: draft.skills.languages,
      developerTools: draft.skills.developerTools,
      technologies: draft.skills.technologies,
    },
    projects: draft.projects
      .filter((p) => hasText(p.name) || hasText(p.description))
      .map((p) => ({
        titleLeft: p.name,
        subtitleItalic: p.description,
        bullets: [],
      })),
    experience: draft.experiences
      .filter((x) => hasText(x.company) || hasText(x.title) || hasText(x.description))
      .map((x) => ({
        titleLeft: x.company,
        subtitleItalic: x.title,
        bullets: splitLines(x.description),
      })),
    certifications: draft.certifications,
    achievements: draft.achievements,
    activities: draft.activities,
  }
}

async function downloadResumePdf(draft: ResumeDraft) {
  const safeName = (draft.personal.fullName || 'resume').replace(/[^\w\s-]/g, '').trim()
  const filename = `${(safeName || 'resume').replace(/\s+/g, '_')}.pdf`
  await exportResumePdf({ data: toPdfData(draft), filename })
}

export function PreviewPage() {
  const draft = useResumeStore((s) => s.draft)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const hasDraft = hasAnyDraftContent(draft)

  const atsMutation = useAtsScoreMutation()
  const resumeText = draftToText(draft)

  // Auto-run ATS scoring when resume has content
  useEffect(() => {
    if (hasDraft && resumeText.trim().length > 50 && !atsMutation.isPending && !atsMutation.data) {
      atsMutation.mutate({ resumeText })
    }
  }, [hasDraft, resumeText, atsMutation])

  const atsResult = atsMutation.data
  const atsScore = atsResult?.score ?? 0
  const atsTips = atsResult?.tips ?? []

  const contact = [
    draft.personal.email,

    draft.personal.phone,
    draft.personal.linkedin,
    draft.personal.portfolio,
  ].filter(hasText)
  const hasEducation = Object.values(draft.education).some(hasText)
  const skills = [
    ['Languages', draft.skills.languages],
    ['Developer Tools', draft.skills.developerTools],
    ['Technologies/Frameworks', draft.skills.technologies],
  ].filter(([, value]) => hasText(value))

  async function handleDownloadPdf() {
    setDownloadError('')
    setIsDownloading(true)

    try {
      await downloadResumePdf(draft)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown export error'
      setDownloadError(`PDF download failed: ${message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!hasDraft) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Preview / PDF</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your resume preview will appear after you generate it from the builder.
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Go to Builder
          </Link>
        </div>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No resume generated yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Fill the builder form and click Generate Resume to see the preview, PDF view, ATS score,
            and improvement tips here.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="print-hidden flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Preview / PDF</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review the resume and download a clean PDF copy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/builder"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>
        {downloadError ? (
          <p className="text-sm text-rose-700 sm:text-right">{downloadError}</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="resume-print-area rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
          <header className="border-b border-slate-200 pb-3 print:border-slate-300">
            {hasText(draft.personal.fullName) ? (
              <h2 className="text-2xl font-semibold text-slate-900">{draft.personal.fullName}</h2>
            ) : null}
            {hasText(draft.personal.targetRole) ? (
              <p className="mt-1 text-sm font-medium text-slate-700">
                {draft.personal.targetRole}
              </p>
            ) : null}
            {contact.length > 0 ? (
              <p className="mt-1 text-xs text-slate-600">{contact.join(' | ')}</p>
            ) : null}
          </header>

          <div className="mt-4 space-y-5">
            {hasText(draft.summary) ? (
              <ResumeSection title="Professional Summary">
                <p className="whitespace-pre-wrap text-sm text-slate-800">{draft.summary}</p>
              </ResumeSection>
            ) : null}

            {hasEducation ? (
              <ResumeSection title="Education">
                <div className="text-sm text-slate-800">
                  {hasText(draft.education.degree) ? (
                    <div className="font-semibold text-slate-900">{draft.education.degree}</div>
                  ) : null}
                  {hasText(draft.education.college) ? <div>{draft.education.college}</div> : null}
                  {[draft.education.gradYear, draft.education.cgpa].filter(hasText).length > 0 ? (
                    <div className="text-slate-600">
                      {[draft.education.gradYear, draft.education.cgpa].filter(hasText).join(' | ')}
                    </div>
                  ) : null}
                </div>
              </ResumeSection>
            ) : null}

            {skills.length > 0 ? (
              <ResumeSection title="Technical Skills">
                <div className="space-y-1 text-sm text-slate-800">
                  {skills.map(([label, value]) => (
                    <p key={label}>
                      <span className="font-semibold text-slate-900">{label}:</span> {value}
                    </p>
                  ))}
                </div>
              </ResumeSection>
            ) : null}

            {draft.projects.some((p) => hasText(p.name) || hasText(p.description)) ? (
              <ResumeSection title="Projects">
                <div className="space-y-3">
                  {draft.projects
                    .filter((p) => hasText(p.name) || hasText(p.description))
                    .map((p, i) => (
                      <EntryBlock
                        key={i}
                        title={p.name}
                        subtitle={p.description}
                      />
                    ))}
                </div>
              </ResumeSection>
            ) : null}

            {draft.experiences.some(
              (x) => hasText(x.company) || hasText(x.title) || hasText(x.description),
            ) ? (
              <ResumeSection title="Work Experience / Internships">
                <div className="space-y-3">
                  {draft.experiences
                    .filter((x) => hasText(x.company) || hasText(x.title) || hasText(x.description))
                    .map((x, i) => (
                      <EntryBlock
                        key={i}
                        title={x.company}
                        subtitle={x.title}
                        bullets={splitLines(x.description)}
                      />
                    ))}
                </div>
              </ResumeSection>
            ) : null}

            {hasText(draft.certifications) || hasText(draft.achievements) ? (
              <ResumeSection title="Certifications & Achievements">
                {hasText(draft.certifications) ? (
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold text-slate-900">Certifications:</span>{' '}
                    {draft.certifications}
                  </p>
                ) : null}
                {hasText(draft.achievements) ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    <span className="font-semibold text-slate-900">Achievements:</span>{' '}
                    {draft.achievements}
                  </p>
                ) : null}
              </ResumeSection>
            ) : null}

            {hasText(draft.activities) ? (
              <ResumeSection title="Extra-curricular Activities">
                <p className="whitespace-pre-wrap text-sm text-slate-800">{draft.activities}</p>
              </ResumeSection>
            ) : null}
          </div>
        </section>

        <aside className="print-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">ATS Score</h2>
          <div className="mt-4 flex items-end gap-2">
            <div className="text-4xl font-bold text-violet-700">
              {atsMutation.isPending ? '...' : atsScore}
            </div>
            <div className="pb-1 text-sm font-medium text-slate-600">/100</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: atsMutation.isPending ? '0%' : `${atsScore}%` }}
            />
          </div>

          {atsMutation.isPending ? (
            <p className="mt-5 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Calculating ATS score...
            </p>
          ) : atsMutation.isError ? (
            <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              Failed to calculate ATS score. Please try again.
            </p>
          ) : atsScore < 80 ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-900">Improve ATS Score</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {atsTips.map((tip) => (
                  <li key={tip} className="rounded-md bg-slate-50 px-3 py-2">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Strong ATS coverage. Keep role keywords aligned with each job description.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function EntryBlock({
  title,
  subtitle,
  bullets = [],
}: {
  title: string
  subtitle?: string
  bullets?: string[]
}) {
  return (
    <div className="text-sm text-slate-800">
      {hasText(title) ? <div className="font-semibold text-slate-900">{title}</div> : null}
      {subtitle && hasText(subtitle) ? <div className="text-slate-700">{subtitle}</div> : null}
      {bullets.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
