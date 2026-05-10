export function MegaMillionsLogo({ size = 40 }) {
  return (
    <svg width={size * 3.5} height={size} viewBox="0 0 280 80" aria-label="Mega Millions">
      <defs>
        <linearGradient id="mm-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#c8960a" />
        </linearGradient>
      </defs>
      {/* Star cluster */}
      {[14, 28, 42].map((cx, i) => (
        <polygon
          key={i}
          points={star(cx, 20, 10, 5)}
          fill="url(#mm-gold)"
        />
      ))}
      <text x="58" y="26" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize="22" fill="url(#mm-gold)" letterSpacing="0.5">MEGA</text>
      <text x="4" y="54" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize="28" fill="url(#mm-gold)" letterSpacing="1">MILLIONS</text>
      <text x="4" y="72" fontFamily="Arial, sans-serif" fontWeight="400"
        fontSize="11" fill="#c8960a" letterSpacing="3">THE GAME THAT KEEPS GROWING</text>
    </svg>
  )
}

export function PowerballLogo({ size = 40 }) {
  return (
    <svg width={size * 3.2} height={size} viewBox="0 0 256 80" aria-label="Powerball">
      <defs>
        <radialGradient id="pb-ball" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ff6060" />
          <stop offset="100%" stopColor="#8a0000" />
        </radialGradient>
      </defs>
      {/* Red ball */}
      <circle cx="24" cy="36" r="22" fill="url(#pb-ball)" />
      <ellipse cx="18" cy="26" rx="8" ry="5" fill="rgba(255,255,255,0.25)" />
      <text x="15" y="43" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize="18" fill="white">PB</text>
      {/* Wordmark */}
      <text x="52" y="30" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize="20" fill="#e03030" letterSpacing="1">POWER</text>
      <text x="52" y="56" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize="26" fill="var(--text-primary)" letterSpacing="1">BALL</text>
      <text x="52" y="72" fontFamily="Arial, sans-serif" fontWeight="400"
        fontSize="10" fill="#cc3333" letterSpacing="2">AMERICA'S GAME</text>
    </svg>
  )
}

function star(cx, cy, outerR, innerR, points = 5) {
  const pts = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}
