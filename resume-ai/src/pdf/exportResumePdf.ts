import { jsPDF } from 'jspdf'
import type { PdfEntry, ResumePdfData } from './types'

const pageWidth = 210
const pageHeight = 297
const marginX = 16
const marginTop = 16
const marginBottom = 16
const contentWidth = pageWidth - marginX * 2

function hasText(value: string | undefined) {
  return (value ?? '').trim().length > 0
}

function cleanBullets(bullets?: string[]) {
  return (bullets ?? [])
    .map((bullet) => bullet.trim())
    .filter(Boolean)
    .map((bullet) => bullet.replace(/^\u2022\s*/, '').replace(/^-+\s*/, ''))
}

function ensureSpace(pdf: jsPDF, y: number, needed = 8) {
  if (y + needed <= pageHeight - marginBottom) return y
  pdf.addPage()
  return marginTop
}

function addWrappedText({
  pdf,
  text,
  x = marginX,
  y,
  maxWidth = contentWidth,
  lineHeight = 5,
}: {
  pdf: jsPDF
  text: string
  x?: number
  y: number
  maxWidth?: number
  lineHeight?: number
}) {
  const lines = pdf.splitTextToSize(text, maxWidth) as string[]
  let nextY = y

  lines.forEach((line) => {
    nextY = ensureSpace(pdf, nextY, lineHeight)
    pdf.text(line, x, nextY)
    nextY += lineHeight
  })

  return nextY
}

function addCenteredWrappedText(pdf: jsPDF, text: string, y: number, lineHeight = 4.5) {
  const lines = pdf.splitTextToSize(text, contentWidth) as string[]
  let nextY = y

  lines.forEach((line) => {
    nextY = ensureSpace(pdf, nextY, lineHeight)
    pdf.text(line, pageWidth / 2, nextY, { align: 'center' })
    nextY += lineHeight
  })

  return nextY
}

function addSectionTitle(pdf: jsPDF, title: string, y: number) {
  let nextY = ensureSpace(pdf, y, 10)
  pdf.setFont('times', 'bold')
  pdf.setFontSize(11)
  pdf.text(title.toUpperCase(), marginX, nextY)
  nextY += 2
  pdf.setLineWidth(0.2)
  pdf.line(marginX, nextY, pageWidth - marginX, nextY)
  return nextY + 5
}

function addEntry(pdf: jsPDF, entry: PdfEntry, y: number) {
  let nextY = ensureSpace(pdf, y, 12)
  const title = entry.titleLeft.trim()
  const date = entry.dateRight?.trim() ?? ''
  const subtitle = entry.subtitleItalic?.trim() ?? ''
  const bullets = cleanBullets(entry.bullets)

  if (title || date) {
    pdf.setFont('times', 'bold')
    pdf.setFontSize(11)
    if (title) pdf.text(title, marginX, nextY)
    if (date) pdf.text(date, pageWidth - marginX, nextY, { align: 'right' })
    nextY += 5
  }

  if (subtitle) {
    pdf.setFont('times', 'italic')
    pdf.setFontSize(10)
    nextY = addWrappedText({ pdf, text: subtitle, y: nextY, lineHeight: 4.6 })
  }

  if (bullets.length > 0) {
    pdf.setFont('times', 'normal')
    pdf.setFontSize(10)
    bullets.forEach((bullet) => {
      nextY = addWrappedText({
        pdf,
        text: `• ${bullet}`,
        x: marginX + 4,
        y: nextY,
        maxWidth: contentWidth - 4,
        lineHeight: 4.6,
      })
    })
  }

  return nextY + 2
}

function addLabelValue(pdf: jsPDF, label: string, value: string, y: number) {
  if (!hasText(value)) return y

  const nextY = ensureSpace(pdf, y, 6)
  pdf.setFont('times', 'bold')
  pdf.setFontSize(10)
  pdf.text(`${label}:`, marginX, nextY)

  const labelWidth = pdf.getTextWidth(`${label}: `)
  pdf.setFont('times', 'normal')
  return addWrappedText({
    pdf,
    text: value,
    x: marginX + labelWidth,
    y: nextY,
    maxWidth: contentWidth - labelWidth,
    lineHeight: 4.8,
  })
}

export async function exportResumePdf({
  data,
  filename,
}: {
  data: ResumePdfData
  filename: string
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let y = marginTop
  const contact = [
    data.personal.phone,
    data.personal.email,
    data.personal.linkedin,
    data.personal.github,
    data.personal.portfolio,
  ].filter(hasText)

  pdf.setTextColor(0, 0, 0)
  pdf.setFont('times', 'bold')
  pdf.setFontSize(20)
  pdf.text(data.personal.fullName.trim(), pageWidth / 2, y, { align: 'center' })
  y += 6

  if (contact.length > 0) {
    pdf.setFont('times', 'normal')
    pdf.setFontSize(10)
    y = addCenteredWrappedText(pdf, contact.join(' | '), y)
  }

  if (hasText(data.summary)) {
    y = addSectionTitle(pdf, 'Professional Summary', y + 3)
    pdf.setFont('times', 'normal')
    pdf.setFontSize(10)
    y = addWrappedText({ pdf, text: data.summary, y, lineHeight: 4.8 })
  }

  if (data.education.length > 0) {
    y = addSectionTitle(pdf, 'Education', y + 3)
    data.education.forEach((entry) => {
      y = addEntry(pdf, entry, y)
    })
  }

  if (Object.values(data.skills).some(hasText)) {
    y = addSectionTitle(pdf, 'Technical Skills', y + 3)
    y = addLabelValue(pdf, 'Languages', data.skills.languages, y)
    y = addLabelValue(pdf, 'Developer Tools', data.skills.developerTools, y)
    y = addLabelValue(pdf, 'Technologies/Frameworks', data.skills.technologies, y)
  }

  if (data.projects.length > 0) {
    y = addSectionTitle(pdf, 'Projects', y + 3)
    data.projects.forEach((entry) => {
      y = addEntry(pdf, entry, y)
    })
  }

  if (data.experience.length > 0) {
    y = addSectionTitle(pdf, 'Work Experience / Internships', y + 3)
    data.experience.forEach((entry) => {
      y = addEntry(pdf, entry, y)
    })
  }

  if (hasText(data.certifications) || hasText(data.achievements)) {
    y = addSectionTitle(pdf, 'Certifications & Achievements', y + 3)
    y = addLabelValue(pdf, 'Certifications', data.certifications, y)
    y = addLabelValue(pdf, 'Achievements', data.achievements, y)
  }

  if (hasText(data.activities)) {
    y = addSectionTitle(pdf, 'Extra-curricular Activities', y + 3)
    pdf.setFont('times', 'normal')
    pdf.setFontSize(10)
    addWrappedText({ pdf, text: data.activities, y, lineHeight: 4.8 })
  }

  pdf.save(filename)
}
