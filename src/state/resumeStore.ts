import { create } from 'zustand'

export type ResumeDraft = {
  personal: {
    fullName: string
    targetRole: string
    email: string
    phone: string
    linkedin: string
    portfolio: string
  }
  summary: string
  education: {
    degree: string
    college: string
    gradYear: string
    cgpa: string
  }
  skills: {
    languages: string
    developerTools: string
    technologies: string
  }
  certifications: string
  achievements: string
  activities: string
  projects: Array<{ name: string; description: string }>
  experiences: Array<{ company: string; title: string; description: string }>
}

export type AiParams = {
  temperature: number
  topP: number
}

type LegacyDraft = {
  basics?: {
    fullName?: string
    targetRole?: string
    email?: string
    phone?: string
  }
  summary?: string
  skills?: unknown
}

type ResumeState = {
  draft: ResumeDraft
  aiParams: AiParams
  setDraft: (draft: ResumeDraft) => void
  setAiParams: (patch: Partial<AiParams>) => void
  reset: () => void
}

const STORAGE_KEY = 'resume-ai:draft:v1'
const SETTINGS_KEY = 'resume-ai:settings:v1'

export const defaultDraft: ResumeDraft = {
  personal: {
    fullName: '',
    targetRole: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  education: {
    degree: '',
    college: '',
    gradYear: '',
    cgpa: '',
  },
  skills: {
    languages: '',
    developerTools: '',
    technologies: '',
  },
  certifications: '',
  achievements: '',
  activities: '',
  projects: [{ name: '', description: '' }],
  experiences: [{ company: '', title: '', description: '' }],
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function normalizeDraft(raw: unknown): ResumeDraft {
  if (!raw || typeof raw !== 'object') return defaultDraft

  const draft = raw as Partial<ResumeDraft> & LegacyDraft
  const legacyBasics = draft.basics ?? {}
  const skills = draft.skills && typeof draft.skills === 'object' ? draft.skills : {}
  const legacySkills = skills as Partial<ResumeDraft['skills']> & {
    frontend?: string
    backend?: string
    databases?: string
    devops?: string
    other?: string
  }

  return {
    personal: {
      ...defaultDraft.personal,
      ...draft.personal,
      fullName: draft.personal?.fullName ?? legacyBasics.fullName ?? '',
      targetRole: draft.personal?.targetRole ?? legacyBasics.targetRole ?? '',
      email: draft.personal?.email ?? legacyBasics.email ?? '',
      phone: draft.personal?.phone ?? legacyBasics.phone ?? '',
    },
    summary: draft.summary ?? '',
    education: {
      ...defaultDraft.education,
      ...draft.education,
    },
    skills: {
      languages: legacySkills.languages ?? '',
      developerTools:
        legacySkills.developerTools ?? legacySkills.devops ?? legacySkills.other ?? '',
      technologies:
        legacySkills.technologies ??
        [legacySkills.frontend, legacySkills.backend, legacySkills.databases]
          .filter(Boolean)
          .join(', '),
    },
    certifications: draft.certifications ?? '',
    achievements: draft.achievements ?? '',
    activities: draft.activities ?? '',
    projects: draft.projects?.length ? draft.projects : defaultDraft.projects,
    experiences: draft.experiences?.length ? draft.experiences : defaultDraft.experiences,
  }
}

export const useResumeStore = create<ResumeState>((set, get) => {
  const storedDraft = safeParseJson<unknown>(localStorage.getItem(STORAGE_KEY))
  const storedSettings = safeParseJson<AiParams>(localStorage.getItem(SETTINGS_KEY))

  const persist = () => {
    const { draft, aiParams } = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiParams))
  }

  return {
    draft: normalizeDraft(storedDraft),
    aiParams: storedSettings ?? { temperature: 0.4, topP: 0.9 },

    setDraft: (draft) => {
      set({ draft })
      persist()
    },
    setAiParams: (patch) => {
      set((s) => ({ aiParams: { ...s.aiParams, ...patch } }))
      persist()
    },
    reset: () => {
      set({ draft: defaultDraft })
      persist()
    },
  }
})
