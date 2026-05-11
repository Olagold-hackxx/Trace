import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  iconSize?: number;
  textSize?: number;
  gap?: number;
  textColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  className?: string;
}

function TraceMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Dark rounded background */}
      <rect width="40" height="40" rx="10" fill="#141420" />

      {/* Horizontal bar of T — orange */}
      <rect x="7" y="9" width="26" height="5" rx="2.5" fill="#FF6B35" />

      {/* Vertical stem of T — gold gradient effect via two rects */}
      <rect x="17" y="14" width="6" height="17" rx="2" fill="url(#tGrad)" />

      {/* Small accent dot bottom-right — orange */}
      <circle cx="29" cy="29" r="3" fill="#FF6B35" opacity="0.7" />

      <defs>
        <linearGradient id="tGrad" x1="20" y1="14" x2="20" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  iconSize = 36,
  textSize = 21,
  gap = 10,
  textColor = "#ffffff",
  subtitle,
  subtitleColor = "#FF6B35",
  className,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{ display: "flex", alignItems: "center", gap, textDecoration: "none" }}
    >
      <TraceMark size={iconSize} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Epilogue', sans-serif",
            fontWeight: 700,
            fontSize: textSize,
            color: textColor,
            letterSpacing: "-0.03em",
          }}
        >
          Trace
        </span>
        {subtitle ? (
          <span
            style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: subtitleColor,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
