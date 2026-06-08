import type { ProjectLinks as Links } from '../data/projects'
import { ExternalLink, Github } from './Icons'

/** Live demo / Code / Kaggle buttons for whatever links exist. */
export function ProjectLinks({ links, compact = false }: { links: Links; compact?: boolean }) {
  if (!links.github && !links.demo && !links.kaggle) return null
  const size = compact ? 15 : 16
  const sm = compact ? ' btn-sm' : ''
  return (
    <div className="project-links">
      {links.demo && (
        <a className={`btn btn-primary${sm}`} href={links.demo} target="_blank" rel="noreferrer">
          <ExternalLink width={size} height={size} /> Live demo
        </a>
      )}
      {links.github && (
        <a className={`btn btn-secondary${sm}`} href={links.github} target="_blank" rel="noreferrer">
          <Github width={size} height={size} /> Code
        </a>
      )}
      {links.kaggle && (
        <a className={`btn btn-secondary${sm}`} href={links.kaggle} target="_blank" rel="noreferrer">
          <ExternalLink width={size} height={size} /> Kaggle
        </a>
      )}
    </div>
  )
}
