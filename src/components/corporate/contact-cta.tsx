import { Mail, Phone } from "lucide-react";
import { SITE_CONTACT_EMAIL, siteContactMailto } from "@/lib/contact";
import { Link } from "@tanstack/react-router";

type CorporateContactCtaProps = {
  variant?: "mail" | "phone";
  className?: string;
};

export function CorporateContactCta({ variant = "mail", className = "" }: CorporateContactCtaProps) {
  const label = "Свържете се с нас за корпоративно членство";

  if (variant === "phone") {
    return (
      <Link
        to="/iletisim"
        className={`inline-flex max-w-full cursor-pointer items-center gap-4 rounded-2xl bg-white px-6 py-4 transition hover:shadow-md ${className}`}
        aria-label={`${label}: ${SITE_CONTACT_EMAIL}`}
      >
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#3ad08f]">
          <Phone className="size-6 text-white" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-base font-semibold leading-snug text-[#272635] lg:text-lg lg:leading-none">{label}</p>
          <span className="text-[28px] font-semibold leading-none text-[#3ad08f] lg:text-[32px]">{SITE_CONTACT_EMAIL}</span>
        </div>
      </Link>
    );
  }

  return (
    <a
      href={siteContactMailto("Pro корпоративно членство")}
      className={`inline-flex max-w-full cursor-pointer items-center gap-4 rounded-2xl bg-white px-6 py-4 transition hover:shadow-md ${className}`}
      aria-label={`${label}: ${SITE_CONTACT_EMAIL}`}
    >
      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#3ad08f]">
        <Mail className="size-6 text-white" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-base font-semibold leading-snug text-[#272635] lg:text-lg lg:leading-none">{label}</p>
        <span className="break-all text-xl font-semibold leading-none text-[#3ad08f] sm:text-[28px] lg:text-[32px]">
          {SITE_CONTACT_EMAIL}
        </span>
      </div>
    </a>
  );
}
