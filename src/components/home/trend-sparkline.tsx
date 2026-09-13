/** Mini sparkline — sikayetvar Trend 100 satırındaki yeşil çizgi. */
export function TrendSparkline({
  seed,
  rising = true,
}: {
  seed: string;
  rising?: boolean;
}) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const points = Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((h % 7) + i * 0.9) * 10;
    const trend = rising ? i * 3 : (7 - i) * 2;
    return 30 - wave - trend * 0.4;
  });
  const d = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${((i / 7) * 112).toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      width="112"
      height="44"
      viewBox="0 0 112 44"
      className="h-11 w-28"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="#03E5B6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
