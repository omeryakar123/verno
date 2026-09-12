import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

/**
 * Şikayet sahibinin, kendi şikayetinin SONUCUNU yıldızladığı kutu.
 *
 * Bu not markanın site genelindeki yıldız ortalamasına doğrudan girer, bu
 * yüzden oy hakkı istemcide değil SUNUCUDA belirlenir: /api/complaint-rating
 * GET yalnızca şikayet sahibine `can_rate: true` döner (anonim şikayetlerde
 * user_id istemciye hiç gönderilmediği için başka yolu yok).
 */
export function ComplaintRating({
  complaintId,
  onChange,
}: {
  complaintId: string;
  onChange?: () => void;
}) {
  const [canRate, setCanRate] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/complaint-rating?complaintId=${complaintId}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        can_rate: boolean;
        rating: number | null;
      };
      setCanRate(data.can_rate);
      setRating(data.rating);
    } catch {
      // Sessiz: oy kutusunun görünmemesi sayfayı bozmaz.
    }
  }, [complaintId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(value: number) {
    setBusy(true);
    const res = await fetch("/api/complaint-rating", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, rating: value }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      return toast.error(j.error ?? "Оценката не можа да бъде запазена");
    }
    setRating(value);
    toast.success("Оценката ви е запазена");
    onChange?.();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch("/api/complaint-rating", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      return toast.error(j.error ?? "Оценката не можа да бъде премахната");
    }
    setRating(null);
    toast.success("Оценката е премахната");
    onChange?.();
  }

  if (!canRate) return null;

  const shown = hover || rating || 0;

  return (
    <div className="mt-6 bg-card rounded-2xl ring-1 ring-rule p-5">
      <p className="text-sm font-semibold text-ink">
        {rating ? "Вашата оценка" : "Доволни ли сте от резултата на жалбата?"}
      </p>
      <p className="text-xs text-navy-mid mt-0.5">
        Оценката се дава след приключване на жалбата и влиза в общия рейтинг на
        марката (оценка от 100).
      </p>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              aria-label={`${n} звезди`}
              onMouseEnter={() => setHover(n)}
              onClick={() => send(n)}
              className="disabled:opacity-60"
            >
              <Star
                className={`size-7 transition-transform ${
                  shown >= n
                    ? "fill-amber-400 text-amber-400 scale-105"
                    : "text-navy-mid"
                }`}
              />
            </button>
          ))}
        </div>

        {rating && (
          <button
            onClick={remove}
            disabled={busy}
            className="text-[12.5px] text-navy-mid hover:text-danger underline disabled:opacity-60"
          >
            Премахни оценката
          </button>
        )}
      </div>
    </div>
  );
}
