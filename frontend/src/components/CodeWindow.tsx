import type { ReactNode } from 'react'

interface Props {
  filename?: string
  lang?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Dark navy code-editor mockup — traffic-light bar, filename, body, optional terminal footer. */
export function CodeWindow({ filename, lang, children, footer, className = '' }: Props) {
  return (
    <div className={`codewin ${className}`}>
      <div className="codewin__bar">
        <span className="codewin__dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        {filename && <span className="codewin__file mono">{filename}</span>}
        {lang && <span className="codewin__lang mono">{lang}</span>}
      </div>
      <pre className="codewin__body">
        <code>{children}</code>
      </pre>
      {footer && <div className="codewin__foot mono">{footer}</div>}
    </div>
  )
}
