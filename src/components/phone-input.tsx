import { Phone } from "lucide-react";
import { formatTrPhone } from "@/lib/phone";

export function PhoneInput({
  value, onChange, required, placeholder = "+359 (8XX) XXX XXX",
}: { value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-navy-mid" />
      <input
        type="tel"
        inputMode="tel"
        required={required}
        placeholder={placeholder}
        value={value}
        onFocus={(e) => { if (!e.target.value) onChange("+359"); }}
        onChange={(e) => onChange(formatTrPhone(e.target.value))}
        className="w-full h-[52px] lg:h-12 rounded-xl ring-1 ring-rule bg-card pl-10 pr-3 text-[16px] lg:text-[15px] text-ink placeholder:text-navy-mid/70 focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
      />
    </div>
  );
}
