import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiGenerateMutation } from '../services/ai/useAiGenerateMutation'
import { useResumeStore, type ResumeDraft } from '../state/resumeStore'

export function BuilderPage() {
  const gen = useAiGenerateMutation()
  const navigate = useNavigate()
  const savedDraft = useResumeStore((s) => s.draft)
  const setDraft = useResumeStore((s) => s.setDraft)

  const [form, setForm] = useState<ResumeDraft>(() => savedDraft)

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [aiParams, setAiParams] = useState({ temperature: 0.4, topP: 0.9 })

  const requiredErrors = useMemo(() => {
    const errors: Record<string, string> = {}

    if (!form.personal.fullName.trim()) errors['personal.fullName'] = 'Required'
    if (!form.personal.targetRole.trim()) errors['personal.targetRole'] = 'Required'
    if (!form.personal.email.trim()) errors['personal.email'] = 'Required'
    if (!form.personal.phone.trim()) errors['personal.phone'] = 'Required'
    if (!form.summary.trim()) errors.summary = 'Required'

    if (!form.education.degree.trim()) errors['education.degree'] = 'Required'
    if (!form.education.college.trim()) errors['education.college'] = 'Required'
    if (!form.education.gradYear.trim()) errors['education.gradYear'] = 'Required'
    if (!form.education.cgpa.trim()) errors['education.cgpa'] = 'Required'

    if (!form.achievements.trim()) errors.achievements = 'Required'

    return errors
  }, [form])

  const isValid = useMemo(() => Object.keys(requiredErrors).length === 0, [requiredErrors])

  const summaryPromptContext = useMemo(() => {
    return {
      fullName: form.personal.fullName,
      targetRole: form.personal.targetRole,
      email: form.personal.email,
      phone: form.personal.phone,
      education: form.education,
      skills: form.skills,
    }
  }, [form.education, form.personal, form.skills])

  function setFieldTouched(path: string) {
    setTouched((t) => ({ ...t, [path]: true }))
  }

  function touchAllRequired() {
    setTouched((t) => {
      const next: Record<string, boolean> = { ...t }
      Object.keys(requiredErrors).forEach((k) => {
        next[k] = true
      })
      next.summary = true
      next.achievements = true
      return next
    })
  }

  function onGenerateResume() {
    if (!isValid) {
      touchAllRequired()
      return
    }

    setDraft(form)
    navigate('/preview')
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Resume Builder</h1>
            <p className="mt-1 text-sm text-slate-600">
              Fill in your details and generate the final resume from the preview page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onGenerateResume}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Generate Resume
            </button>
          </div>
        </div>

        <div className="h-[calc(100dvh-220px)] overflow-y-auto p-5">
          <FormSection title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Full Name"
                required
                value={form.personal.fullName}
                placeholder="John Doe"
                error={touched['personal.fullName'] ? requiredErrors['personal.fullName'] : undefined}
                onBlur={() => setFieldTouched('personal.fullName')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, fullName: v } }))
                }
              />
              <TextInput
                label="Target Role"
                required
                value={form.personal.targetRole}
                placeholder="Full Stack Developer"
                error={
                  touched['personal.targetRole'] ? requiredErrors['personal.targetRole'] : undefined
                }
                onBlur={() => setFieldTouched('personal.targetRole')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, targetRole: v } }))
                }
              />
              <TextInput
                label="Email"
                type="email"
                required
                value={form.personal.email}
                placeholder="john@example.com"
                error={touched['personal.email'] ? requiredErrors['personal.email'] : undefined}
                onBlur={() => setFieldTouched('personal.email')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, email: v } }))
                }
              />
              <TextInput
                label="Phone"
                type="tel"
                required
                value={form.personal.phone}
                placeholder="+91 98765 43210"
                error={touched['personal.phone'] ? requiredErrors['personal.phone'] : undefined}
                onBlur={() => setFieldTouched('personal.phone')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, phone: v } }))
                }
              />
              <TextInput
                label="LinkedIn (optional)"
                value={form.personal.linkedin}
                placeholder="linkedin.com/in/johndoe"
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, linkedin: v } }))
                }
              />
              <TextInput
                label="Portfolio/GitHub (optional)"
                value={form.personal.portfolio}
                placeholder="github.com/johndoe"
                onChange={(v) =>
                  setForm((s) => ({ ...s, personal: { ...s.personal, portfolio: v } }))
                }
              />
            </div>
          </FormSection>

          <FormSection
            title="Professional Summary"
            right={
              <button
                type="button"
                disabled={gen.isPending}
                onClick={async () => {
                  const res = await gen.mutateAsync({
                    section: 'summary',
                    inputs: summaryPromptContext,
                    constraints: { noFabrication: true, atsFriendly: true },
                    temperature: aiParams.temperature,
                    topP: aiParams.topP,
                  })
                  setForm((s) => ({ ...s, summary: res.text }))
                  setFieldTouched('summary')
                }}
                className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60"
              >
                {gen.isPending ? 'Generating…' : 'Generate with AI'}
              </button>
            }
          >
            <TextArea
              label="Career Summary"
              required
              value={form.summary}
              rows={5}
              placeholder="2–3 lines highlighting your strengths and impact…"
              error={touched.summary ? requiredErrors.summary : undefined}
              onBlur={() => setFieldTouched('summary')}
              onChange={(v) => setForm((s) => ({ ...s, summary: v }))}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Temperature"
                value={aiParams.temperature}
                min={0}
                max={1.5}
                step={0.1}
                hint="Lower = more deterministic"
                onChange={(v) => setAiParams((p) => ({ ...p, temperature: v }))}
              />
              <NumberInput
                label="Top-p"
                value={aiParams.topP}
                min={0.1}
                max={1}
                step={0.05}
                hint="Lower = safer token pool"
                onChange={(v) => setAiParams((p) => ({ ...p, topP: v }))}
              />
            </div>

            {gen.error ? (
              <div
                role="alert"
                className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
              >
                {gen.error.message}
              </div>
            ) : null}
          </FormSection>

          <FormSection title="Education">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Degree"
                required
                value={form.education.degree}
                placeholder="B.Tech in Computer Science"
                error={touched['education.degree'] ? requiredErrors['education.degree'] : undefined}
                onBlur={() => setFieldTouched('education.degree')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, education: { ...s.education, degree: v } }))
                }
              />
              <TextInput
                label="College/University"
                required
                value={form.education.college}
                placeholder="XYZ University"
                error={
                  touched['education.college'] ? requiredErrors['education.college'] : undefined
                }
                onBlur={() => setFieldTouched('education.college')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, education: { ...s.education, college: v } }))
                }
              />
              <TextInput
                label="Graduation Year"
                required
                value={form.education.gradYear}
                placeholder="2026"
                error={
                  touched['education.gradYear'] ? requiredErrors['education.gradYear'] : undefined
                }
                onBlur={() => setFieldTouched('education.gradYear')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, education: { ...s.education, gradYear: v } }))
                }
              />
              <TextInput
                label="CGPA/Percentage"
                required
                value={form.education.cgpa}
                placeholder="9.0/10 or 85%"
                error={touched['education.cgpa'] ? requiredErrors['education.cgpa'] : undefined}
                onBlur={() => setFieldTouched('education.cgpa')}
                onChange={(v) =>
                  setForm((s) => ({ ...s, education: { ...s.education, cgpa: v } }))
                }
              />
            </div>
          </FormSection>

          <FormSection title="Technical Skills" description="Comma-separated list for each category.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Languages"
                value={form.skills.languages}
                placeholder="JavaScript, Python, Java"
                onChange={(v) =>
                  setForm((s) => ({ ...s, skills: { ...s.skills, languages: v } }))
                }
              />
              <TextInput
                label="Developer Tools"
                value={form.skills.developerTools}
                placeholder="Git, Docker, VS Code, Postman"
                onChange={(v) =>
                  setForm((s) => ({ ...s, skills: { ...s.skills, developerTools: v } }))
                }
              />
              <TextInput
                label="Technologies/Frameworks"
                value={form.skills.technologies}
                placeholder="React, Node.js, Express, MongoDB"
                onChange={(v) =>
                  setForm((s) => ({ ...s, skills: { ...s.skills, technologies: v } }))
                }
              />
            </div>
          </FormSection>

          <FormSection
            title="Projects"
            right={
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                onClick={() =>
                  setForm((s) => ({
                    ...s,
                    projects: [...s.projects, { name: '', description: '' }],
                  }))
                }
              >
                + Add Project
              </button>
            }
          >
            <div className="space-y-4">
              {form.projects.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label={`Project Name ${i + 1}`}
                      value={p.name}
                      placeholder="AI Resume Builder"
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          projects: s.projects.map((x, idx) =>
                            idx === i ? { ...x, name: v } : x,
                          ),
                        }))
                      }
                    />
                    <TextInput
                      label="Tech Stack"
                      value={p.description}
                      placeholder="React, Tailwind, Groq API"
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          projects: s.projects.map((x, idx) =>
                            idx === i ? { ...x, description: v } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection
            title="Work Experience / Internships"
            right={
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                onClick={() =>
                  setForm((s) => ({
                    ...s,
                    experiences: [...s.experiences, { company: '', title: '', description: '' }],
                  }))
                }
              >
                + Add Experience
              </button>
            }
          >
            <div className="space-y-4">
              {form.experiences.map((x, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label={`Company ${i + 1}`}
                      value={x.company}
                      placeholder="Company Name"
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          experiences: s.experiences.map((e, idx) =>
                            idx === i ? { ...e, company: v } : e,
                          ),
                        }))
                      }
                    />
                    <TextInput
                      label="Role/Title"
                      value={x.title}
                      placeholder="Intern / Developer"
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          experiences: s.experiences.map((e, idx) =>
                            idx === i ? { ...e, title: v } : e,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <TextArea
                      label="Highlights (optional)"
                      value={x.description}
                      rows={3}
                      placeholder="What you did and what impact you made…"
                      onChange={(v) =>
                        setForm((s) => ({
                          ...s,
                          experiences: s.experiences.map((e, idx) =>
                            idx === i ? { ...e, description: v } : e,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Certifications & Achievements">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Certifications (comma-separated)"
                value={form.certifications}
                placeholder="AWS Developer, Google Cloud…"
                onChange={(v) => setForm((s) => ({ ...s, certifications: v }))}
              />
              <TextArea
                label="Achievements"
                required
                value={form.achievements}
                rows={3}
                placeholder="Hackathon finalist, scholarships, awards…"
                error={touched.achievements ? requiredErrors.achievements : undefined}
                onBlur={() => setFieldTouched('achievements')}
                onChange={(v) => setForm((s) => ({ ...s, achievements: v }))}
              />
            </div>
          </FormSection>

          <FormSection title="Extra-curricular Activities">
            <TextArea
              label="Activities & Leadership (optional)"
              value={form.activities}
              rows={3}
              placeholder="Clubs, volunteering, leadership roles…"
              onChange={(v) => setForm((s) => ({ ...s, activities: v }))}
            />
          </FormSection>
        </div>
      </section>
    </div>
  )
}

function FormSection({
  title,
  description,
  right,
  children,
}: {
  title: string
  description?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  error,
  onBlur,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  error?: string
  onBlur?: () => void
}) {
  const id = useMemo(() => `f_${label.replace(/\s+/g, '_').toLowerCase()}`, [label])
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={[
          'mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1',
          error
            ? 'ring-rose-300 focus:ring-2 focus:ring-rose-500'
            : 'ring-slate-200 focus:ring-2 focus:ring-violet-500',
        ].join(' ')}
        aria-invalid={!!error}
      />
      {error ? <div className="mt-1 text-xs text-rose-700">{error}</div> : null}
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  hint?: string
}) {
  const id = useMemo(() => `n_${label.replace(/\s+/g, '_').toLowerCase()}`, [label])
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className="mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500"
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  error,
  onBlur,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  error?: string
  onBlur?: () => void
}) {
  const id = useMemo(() => `a_${label.replace(/\s+/g, '_').toLowerCase()}`, [label])
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={[
          'mt-1 block w-full resize-y rounded-md bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1',
          error
            ? 'ring-rose-300 focus:ring-2 focus:ring-rose-500'
            : 'ring-slate-200 focus:ring-2 focus:ring-violet-500',
        ].join(' ')}
        aria-invalid={!!error}
      />
      {error ? <div className="mt-1 text-xs text-rose-700">{error}</div> : null}
    </div>
  )
}
