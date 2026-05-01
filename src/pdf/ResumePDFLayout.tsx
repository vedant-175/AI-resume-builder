import './ResumePDFLayout.css'
import type { PdfEntry, ResumePdfData } from './types'

function joinContact(parts: Array<string | undefined | null>) {
  return parts.filter((p) => (p ?? '').trim().length > 0) as string[]
}

function cleanBullets(bullets?: string[]) {
  return (bullets ?? [])
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => b.replace(/^\u2022\s*/, '').replace(/^-+\s*/, ''))
}

function hasText(value: string | undefined) {
  return (value ?? '').trim().length > 0
}

function PdfEntryBlock({ entry }: { entry: PdfEntry }) {
  const bullets = cleanBullets(entry.bullets)
  return (
    <div className="pdfEntry">
      <div className="pdfRow">
        <div className="pdfRowLeft">{entry.titleLeft}</div>
        <div className="pdfRowRight">{entry.dateRight ?? ''}</div>
      </div>
      {entry.subtitleItalic ? (
        <div className="pdfSubtitle">{entry.subtitleItalic}</div>
      ) : null}
      {bullets.length > 0 ? (
        <ul className="pdfBullets">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function ResumePDFLayout({ data }: { data: ResumePdfData }) {
  const contact = joinContact([
    data.personal.phone,
    data.personal.email,
    data.personal.linkedin,
    data.personal.github,
    data.personal.portfolio,
  ])

  return (
    <div className="resumePdfRoot">
      <h1 className="pdfName">{data.personal.fullName}</h1>
      {data.personal.address ? <p className="pdfAddress">{data.personal.address}</p> : null}
      <p className="pdfContact">
        {contact.map((c, i) => (
          <span key={c}>
            {c}
            {i < contact.length - 1 ? ' | ' : ''}
          </span>
        ))}
      </p>

      {contact.length > 0 ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Personal Information</h2>
          <hr className="pdfDivider" />
          <p className="pdfPara">
            {joinContact([
              data.personal.phone ? `Phone: ${data.personal.phone}` : undefined,
              data.personal.email ? `Email: ${data.personal.email}` : undefined,
              data.personal.linkedin ? `LinkedIn: ${data.personal.linkedin}` : undefined,
              data.personal.github ? `GitHub: ${data.personal.github}` : undefined,
              data.personal.portfolio ? `Portfolio: ${data.personal.portfolio}` : undefined,
            ]).join(' | ')}
          </p>
        </section>
      ) : null}

      {hasText(data.summary) ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Professional Summary</h2>
          <hr className="pdfDivider" />
          <p className="pdfPara">{data.summary}</p>
        </section>
      ) : null}

      {data.education.length > 0 ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Education</h2>
          <hr className="pdfDivider" />
          {data.education.map((e, i) => (
            <PdfEntryBlock key={i} entry={e} />
          ))}
        </section>
      ) : null}

      {Object.values(data.skills).some(hasText) ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Technical Skills</h2>
          <hr className="pdfDivider" />
          {hasText(data.skills.languages) ? (
            <p className="pdfPara">
              <span className="pdfInlineLabel">Languages:</span> {data.skills.languages}
            </p>
          ) : null}
          {hasText(data.skills.developerTools) ? (
            <p className="pdfPara">
              <span className="pdfInlineLabel">Developer Tools:</span> {data.skills.developerTools}
            </p>
          ) : null}
          {hasText(data.skills.technologies) ? (
            <p className="pdfPara">
              <span className="pdfInlineLabel">Technologies/Frameworks:</span>{' '}
              {data.skills.technologies}
            </p>
          ) : null}
        </section>
      ) : null}

      {data.projects.length > 0 ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Projects</h2>
          <hr className="pdfDivider" />
          {data.projects.map((p, i) => (
            <PdfEntryBlock key={i} entry={p} />
          ))}
        </section>
      ) : null}

      {data.experience.length > 0 ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Work Experience / Internships</h2>
          <hr className="pdfDivider" />
          {data.experience.map((x, i) => (
            <PdfEntryBlock key={i} entry={x} />
          ))}
        </section>
      ) : null}

      {hasText(data.certifications) || hasText(data.achievements) ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Certifications &amp; Achievements</h2>
          <hr className="pdfDivider" />
          {data.certifications ? (
            <p className="pdfPara">
              <span className="pdfInlineLabel">Certifications:</span> {data.certifications}
            </p>
          ) : null}
          {hasText(data.achievements) ? (
            <p className="pdfPara">
              <span className="pdfInlineLabel">Achievements:</span> {data.achievements}
            </p>
          ) : null}
        </section>
      ) : null}

      {hasText(data.activities) ? (
        <section className="pdfSection">
          <h2 className="pdfSectionTitle">Extra-curricular Activities</h2>
          <hr className="pdfDivider" />
          <p className="pdfPara">
            {data.activities}
          </p>
        </section>
      ) : null}
    </div>
  )
}
