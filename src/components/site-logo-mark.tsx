import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/verno-logo.png";
const LOGO_ASPECT = 1024 / 406;

type LogoTone = "default" | "on-dark" | "on-light";

function logoBlendClass(tone: LogoTone) {
  // Logo asset has a black canvas; screen blend hides black on light backgrounds.
  if (tone === "on-light" || tone === "default") return "mix-blend-screen";
  return "";
}

function LogoImage({
  size,
  tone = "default",
  className,
}: {
  size: number;
  tone?: LogoTone;
  className?: string;
}) {
  const height = size;
  const width = Math.round(size * LOGO_ASPECT);

  return (
    <img
      src={LOGO_SRC}
      alt="verno.bg"
      width={width}
      height={height}
      className={cn("object-contain object-left shrink-0 select-none", logoBlendClass(tone), className)}
      style={{ height, width: "auto", maxWidth: width }}
      decoding="async"
    />
  );
}

/** Site logo — navbar, footer, forms. */
export function SiteLogoMark({
  size = 36,
  linked = false,
  className = "",
  tone = "default",
}: {
  size?: number;
  linked?: boolean;
  className?: string;
  tone?: LogoTone;
}) {
  const logo = <LogoImage size={size} tone={tone} className={className} />;

  if (linked) {
    return (
      <Link to="/" className="inline-flex shrink-0" aria-label="Начало">
        {logo}
      </Link>
    );
  }
  return logo;
}

/** Inline logo inside body copy. */
export function SiteLogoInline({
  className = "",
  tone = "default",
  size = 24,
}: {
  size?: number;
  className?: string;
  tone?: LogoTone;
}) {
  return (
    <LogoImage
      tone={tone}
      size={size}
      className={cn("inline-block align-middle", className)}
    />
  );
}

/** Title block: logo + optional subtitle. */
export function SiteLogoTitle({
  subtitle,
  dark = false,
  className = "",
  subtitleClassName = "",
  logoSize = 40,
}: {
  subtitle?: ReactNode;
  logoSize?: number;
  dark?: boolean;
  className?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-4 sm:gap-5", className)}>
      <LogoImage size={logoSize} tone={dark ? "on-dark" : "default"} />
      {subtitle ? (
        <div
          className={cn(
            "font-display font-black text-[34px] sm:text-[48px] lg:text-[52px] leading-[1.05] tracking-[-0.03em]",
            dark ? "text-white" : "text-ink",
            subtitleClassName,
          )}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

/** Form / auth header. */
export function SiteLogoHeader({ badge }: { badge?: string }) {
  return (
    <Link to="/" className="flex flex-col items-center gap-2.5 mb-8" aria-label="Начало">
      <LogoImage size={44} tone="default" />
      {badge ? (
        <span className="text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-brand/20 to-accent-purple/20 text-brand px-2.5 py-1 rounded-full ring-1 ring-brand/25">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/** Navbar logo. */
export function SiteLogoNav({ size = 52 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center shrink-0 min-w-0 py-0.5" aria-label="Начало">
      <LogoImage size={size} tone="default" className="max-h-[52px] w-auto min-w-[120px]" />
    </Link>
  );
}
