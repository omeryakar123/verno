import { Play } from "lucide-react";

type Props = {
  src: string;
  alt: string;
};

/** Ödül / trust bölümlerindeki video kapak + play butonu. */
export function HomeMediaBlock({ src, alt }: Props) {
  return (
    <div className="relative mt-18 lg:mt-0 lg:min-w-173 lg:max-w-173">
      <div className="relative block w-full">
        <img
          alt={alt}
          width={1280}
          height={720}
          className="w-full"
          src={src}
          loading="lazy"
        />
        <span className="group/play absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgb(16_20_31/0.18)] transition hover:scale-105 hover:bg-brand">
          <Play className="w-5 fill-brand text-white group-hover/play:fill-white group-hover/play:text-brand" />
        </span>
      </div>
    </div>
  );
}

export function HomeDecorBlobs() {
  return (
    <div className="hidden lg:block" aria-hidden>
      <div className="absolute top-10 left-80/100 size-75 rounded-full bg-primary/15" />
      <div className="absolute top-5 left-72/100 size-28 rounded-full bg-brand" />
      <div className="absolute top-80.5 left-70/100 h-60 w-125 -rotate-30 rounded-t-full bg-primary" />
      <div className="absolute bottom-0 left-80/100 h-46 w-94 rounded-t-full bg-brand/70" />
      <div className="absolute bottom-0 left-73/100 size-15 rounded-full bg-primary/40" />
    </div>
  );
}
