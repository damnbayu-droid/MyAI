// MyAI Chat brand wordmark: a text lockup rendered as an SVG so it inherits
// currentColor and scales with `size` like the other icons. The 182:24 viewBox
// ratio is kept for layout continuity with the previous mark.

import type { IconProps } from './icons/props.ts'

/**
 * Render the full brand wordmark.
 * @param props.size - height in px (default 24; width keeps the 182:24 ratio).
 * @param props.className - extra class for layout placement.
 * @returns the wordmark svg (aria-hidden decorative brand art).
 */
export function BrandWordmark({ size = 24, className }: IconProps) {
  return (
    <svg
      width={(size * 182) / 24}
      height={size}
      className={className}
      viewBox="0 0 182 24"
      fill="none"
      aria-hidden="true"
    >
      <text
        x="0"
        y="17"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontSize="16"
        fontWeight="700"
      >
        MyAI Chat
      </text>
    </svg>
  )
}
