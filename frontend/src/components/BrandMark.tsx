interface Props {
  size?: number
  className?: string
}

/**
 * Praneeth's mark — an isometric tensor block: three faces of a
 * compact cube (ML lattice / structured data), top face in coral.
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
      <path d="M5 10.5 12 14v8.5L5 19V10.5Z" fill="currentColor" />
      <path
        d="M12 14 19 10.5V19L12 22.5V14Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path d="M5 10.5 12 7l7 3.5-7 3.5-7-3.5Z" fill="var(--primary)" />
    </svg>
  )
}
