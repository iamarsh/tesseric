"use client";

export function EmptyGraphIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-32 h-32 mx-auto mb-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="nodeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="nodeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="nodeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
        </linearGradient>

        {/* Animated pulse */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines (dashed, subtle) */}
      <g opacity="0.3" strokeDasharray="4 4">
        <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="150" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="100" x2="75" y2="150" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="100" x2="125" y2="150" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Graph nodes (circles with gradients) */}
      {/* Top left node */}
      <g>
        <circle cx="50" cy="50" r="16" fill="url(#nodeGradient1)" stroke="#FF6B35" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="16;18;16" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="8" fill="#FF6B35" opacity="0.3" />
      </g>

      {/* Top right node */}
      <g>
        <circle cx="150" cy="50" r="16" fill="url(#nodeGradient2)" stroke="#0EA5E9" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="16;18;16" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="50" r="8" fill="#0EA5E9" opacity="0.3" />
      </g>

      {/* Center node (larger, main) */}
      <g>
        <circle cx="100" cy="100" r="22" fill="url(#nodeGradient3)" stroke="#10B981" strokeWidth="2.5" opacity="0.9" filter="url(#glow)">
          <animate attributeName="r" values="22;25;22" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="12" fill="#10B981" opacity="0.4" />

        {/* Center icon (graph symbol) */}
        <path
          d="M 95 100 L 100 95 L 105 100 L 100 105 Z"
          fill="currentColor"
          className="text-foreground"
          opacity="0.7"
        />
      </g>

      {/* Bottom left node */}
      <g>
        <circle cx="75" cy="150" r="14" fill="url(#nodeGradient1)" stroke="#FF6B35" strokeWidth="2" opacity="0.7">
          <animate attributeName="r" values="14;16;14" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="150" r="6" fill="#FF6B35" opacity="0.3" />
      </g>

      {/* Bottom right node */}
      <g>
        <circle cx="125" cy="150" r="14" fill="url(#nodeGradient2)" stroke="#0EA5E9" strokeWidth="2" opacity="0.7">
          <animate attributeName="r" values="14;16;14" dur="3s" begin="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="125" cy="150" r="6" fill="#0EA5E9" opacity="0.3" />
      </g>
    </svg>
  );
}
