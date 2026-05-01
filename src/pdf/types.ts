export type PdfBulletItem = string

export type PdfEntry = {
  titleLeft: string
  dateRight?: string
  subtitleItalic?: string
  bullets?: PdfBulletItem[]
}

export type ResumePdfData = {
  personal: {
    fullName: string
    address?: string
    phone: string
    email: string
    linkedin?: string
    github?: string
    portfolio?: string
  }
  summary: string
  education: PdfEntry[]
  skills: {
    languages: string
    developerTools: string
    technologies: string
  }
  projects: PdfEntry[]
  experience: PdfEntry[]
  certifications: string
  achievements: string
  activities: string
}
