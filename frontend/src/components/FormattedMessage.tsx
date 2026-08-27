import React from 'react'

interface FormattedMessageProps {
  content: string
}

function renderInline(text: string): React.ReactNode[] {
  // Regex to split by inline markdown: **bold**, *italic*, `code`, [link](url)
  const tokens: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/)
    if (boldMatch) {
      tokens.push(<strong key={key++} className="msg-strong">{renderInline(boldMatch[2])}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Check for inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      tokens.push(<code key={key++} className="msg-code">{codeMatch[1]}</code>)
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Check for links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      tokens.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="msg-link"
        >
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Check for italic *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/)
    if (italicMatch) {
      tokens.push(<em key={key++} className="msg-em">{renderInline(italicMatch[2])}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Normal plain text up to the next special markdown character
    const nextSpecial = remaining.search(/[\*_`\[]/)
    if (nextSpecial === -1) {
      tokens.push(remaining)
      break
    } else if (nextSpecial === 0) {
      tokens.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      tokens.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return tokens
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  if (!content) return null

  // Split into lines and parse block structures
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inList: 'ul' | 'ol' | null = null
  let listItems: React.ReactNode[] = []
  let keyIndex = 0

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (inList === 'ul') {
        elements.push(
          <ul key={`list-${keyIndex++}`} className="msg-list msg-list--ul">
            {listItems}
          </ul>
        )
      } else {
        elements.push(
          <ol key={`list-${keyIndex++}`} className="msg-list msg-list--ol">
            {listItems}
          </ol>
        )
      }
      listItems = []
      inList = null
    }
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      flushList()
      i++
      continue
    }

    // Code block ```lang ... ```
    if (trimmed.startsWith('```')) {
      flushList()
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++ // skip closing ```
      elements.push(
        <div key={`code-${keyIndex++}`} className="msg-code-block">
          {lang && <span className="msg-code-lang">{lang}</span>}
          <pre>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      )
      continue
    }

    // Headings #, ##, ###
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const headingText = headingMatch[2]
      const tagName = `h${Math.min(level + 2, 6)}`
      elements.push(
        React.createElement(
          tagName,
          { key: `h-${keyIndex++}`, className: 'msg-heading' },
          renderInline(headingText)
        )
      )
      i++
      continue
    }

    // Bullet List: - or * or •
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/)
    if (bulletMatch) {
      if (inList !== 'ul') {
        flushList()
        inList = 'ul'
      }
      listItems.push(
        <li key={`li-${keyIndex++}`} className="msg-list-item">
          {renderInline(bulletMatch[3])}
        </li>
      )
      i++
      continue
    }

    // Numbered List: 1. 2. etc.
    const numMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/)
    if (numMatch) {
      if (inList !== 'ol') {
        flushList()
        inList = 'ol'
      }
      listItems.push(
        <li key={`li-${keyIndex++}`} className="msg-list-item">
          {renderInline(numMatch[3])}
        </li>
      )
      i++
      continue
    }

    // Standard Paragraph
    flushList()
    elements.push(
      <p key={`p-${keyIndex++}`} className="msg-paragraph">
        {renderInline(line)}
      </p>
    )
    i++
  }

  flushList()

  return <div className="msg-formatted">{elements}</div>
}
