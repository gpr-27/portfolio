import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { BrandMark } from './BrandMark'

interface Props {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  index?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, description, index, align = 'left' }: Props) {
  return (
    <div className={`shead shead--${align}`}>
      <Reveal>
        <span className="eyebrow">
          {index ? (
            <span className="shead__idx mono">{index}</span>
          ) : (
            <BrandMark size={14} className="shead__mark" />
          )}
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="shead__title">{title}</h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className="shead__desc">{description}</p>
        </Reveal>
      )}
    </div>
  )
}
