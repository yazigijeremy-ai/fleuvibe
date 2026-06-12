export default function FleuVibeLogo({ size = "md", textColor = "#1a9e6e", showText = true }) {
  const iconSizes = { sm: 28, md: 34, lg: 48 };
  const fontSizes = { sm: "1rem", md: "1.2rem", lg: "1.65rem" };
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", flexShrink: 0 }}>
      {/* SVG icon mark: rounded square with F letterform + wave */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fv-icon-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a9e6e" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        {/* Background rounded square */}
        <rect width="36" height="36" rx="9" fill="url(#fv-icon-grad)" />

        {/* F letterform: vertical bar + top bar + middle bar */}
        <path
          d="M9 9h17v4H13v5h11v4H13v7H9V9z"
          fill="white"
        />

        {/* Wave decoration beneath the F */}
        <path
          d="M8 29 C11 26 14 29 18 29 C22 29 25 26 28 26"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontSize: fontSizes[size] || fontSizes.md,
            fontWeight: 800,
            color: textColor,
            letterSpacing: "-0.5px",
            fontFamily: "'Fraunces', Georgia, serif",
            lineHeight: 1,
          }}
        >
          FleuVibe
        </span>
      )}
    </div>
  );
}
