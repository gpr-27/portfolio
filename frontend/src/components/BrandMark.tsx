interface Props {
  size?: number
  className?: string
}

/**
 * Praneeth's mark — a two-tone editorial spark (north-star sparkle).
 * Deliberately distinct from Anthropic's even asterisk: a 4-point
 * twinkle in ink with a small coral companion spark.
 */
export function BrandMark({ size = 22, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M11.4 1.8c.45 6.1 2.1 8.95 9 9.4-6.9.45-8.55 3.3-9 9.4-.45-6.1-2.1-8.95-9-9.4 6.9-.45 8.55-3.3 9-9.4Z"
        fill="currentColor"
      />
      <path
        d="M19.2 3.2c.16 2.1.74 3.08 2.8 3.25-2.06.17-2.64 1.15-2.8 3.25-.16-2.1-.74-3.08-2.8-3.25 2.06-.17 2.64-1.15 2.8-3.25Z"
        fill="var(--primary)"
      />
    </svg>
  )
}
