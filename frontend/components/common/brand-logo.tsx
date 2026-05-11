import Image from "next/image";
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

export function BrandLogo({
  href = "/",
  iconSize = 36,
  textSize = 21,
  gap = 10,
  textColor = "#ffffff",
  subtitle,
  subtitleColor = "#ff6b00",
  className,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{ display: "flex", alignItems: "center", gap, textDecoration: "none" }}
    >
      <Image
        src="/icon.svg"
        alt="Trace logo"
        width={iconSize}
        height={iconSize}
        style={{ flexShrink: 0, borderRadius: Math.round(iconSize * 0.2) }}
      />
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
