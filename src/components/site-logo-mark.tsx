import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Transparent PNG logos: `mainlogo` has the dark wordmark (light backgrounds),
 * `mainlogo-light` has the white wordmark (dark backgrounds). Sizes below are
 * the real wordmark height — the asset carries no padding.
 */
const LOGO_DARK = "/mainlogo.png";
const LOGO_LIGHT = "/mainlogo-light.png";
const LOGO_W = 1542;
const LOGO_H = 313;
const LOGO_ASPECT = LOGO_W / LOGO_H;

type LogoTone = "default" | "on-dark" | "on-light";

function srcForTone(tone: LogoTone) {
  return tone === "on-dark" ? LOGO_LIGHT : LOGO_DARK;
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
  return (
    <img
      src={srcForTone(tone)}
      alt="verno.bg"
      width={Math.round(size * LOGO_ASPECT)}
      height={size}
      className={cn(
        "block w-auto shrink-0 select-none object-contain object-left",
        className,
      )}
      style={{ height: size }}
      decoding="async"
    />
  );
}

/**
 * Logo whose height comes from Tailwind classes instead of an inline style —
 * use when the size needs to change across breakpoints.
 */
export function SiteLogoResponsive({
  className = "",
  tone = "default",
}: {
  className?: string;
  tone?: LogoTone;
}) {
  return (
    <img
      src={srcForTone(tone)}
      alt="verno.bg"
      width={LOGO_W}
      height={LOGO_H}
      className={cn(
        "block w-auto shrink-0 select-none object-contain object-left",
        className,
      )}
      decoding="async"
    />
  );
}

/** Site logo — navbar, footer, forms. */
export function SiteLogoMark({
  size = 26,
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
  size = 18,
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
  logoSize = 28,
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
    <Link
      to="/"
      className="flex flex-col items-center gap-2.5 mb-8"
      aria-label="Начало"
    >
      <LogoImage size={28} tone="default" />
      {badge ? (
        <span className="text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-brand/20 to-accent-purple/20 text-brand px-2.5 py-1 rounded-full ring-1 ring-brand/25">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/** Navbar logo. */
export function SiteLogoNav({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center py-0.5"
      aria-label="Начало"
    >
      <SiteLogoResponsive className={cn("h-[26px] sm:h-[30px]", className)} />
    </Link>
  );
}
