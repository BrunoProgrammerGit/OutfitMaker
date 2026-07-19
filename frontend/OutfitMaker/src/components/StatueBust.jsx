/**
 * Busto neoclásico troquelado (line-art B/N) para romper el marco de las
 * ventanas. SVG local — sin dependencias externas, apto para PWA offline.
 */
export default function StatueBust({ className = '', style }) {
  return (
    <svg
      className={`artwork-cutout ${className}`.trim()}
      style={style}
      viewBox="0 0 260 360"
      role="img"
      aria-label="Escultura clásica"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f2ec" />
          <stop offset="0.5" stopColor="#cfcabf" />
          <stop offset="1" stopColor="#8f8b82" />
        </linearGradient>
      </defs>
      <g fill="url(#marble)" stroke="#121212" strokeWidth="2.5" strokeLinejoin="round">
        {/* pedestal */}
        <path d="M92 356 L168 356 L160 322 L100 322 Z" />
        {/* cuello */}
        <path d="M108 322 Q108 288 112 268 L148 268 Q152 292 152 322 Z" />
        {/* rostro / cabeza */}
        <path d="M112 268 Q84 260 82 214 Q78 150 108 118 Q128 96 158 108 Q190 122 192 176 Q194 224 172 256 Q160 270 148 268 Z" />
        {/* cabello */}
        <path d="M108 118 Q96 78 132 66 Q176 54 194 96 Q204 122 190 150 Q188 118 168 106 Q140 92 122 108 Q112 116 108 118 Z" />
      </g>
      <g fill="none" stroke="#121212" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
        {/* rasgos: ceja, ojo, nariz, labios */}
        <path d="M108 168 Q120 160 134 166" />
        <path d="M150 168 Q162 160 176 166" />
        <path d="M120 178 Q126 174 132 178" />
        <path d="M158 178 Q164 174 170 178" />
        <path d="M142 176 L138 208 Q142 216 152 210" />
        <path d="M128 232 Q142 240 160 230" />
        <path d="M132 250 Q144 256 156 248" />
      </g>
    </svg>
  )
}
