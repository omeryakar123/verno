import { Play } from "lucide-react";
import { SITE_NAME } from "@/lib/seo";

type Props = {
  src: string;
  alt: string;
};

export function HomeMediaBlock({ src, alt }: Props) {
  return (
    <div className="relative mt-18 lg:mt-0 lg:min-w-173 lg:max-w-173">
      <div className="relative block w-full overflow-hidden rounded-3xl shadow-[0_24px_60px_rgb(16_20_31/0.16)]">
        <img
          alt={alt}
          width={1280}
          height={720}
          className="w-full"
          src={src}
          loading="lazy"
        />
        <span className="group/play absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-pop hover:bg-brand">
          <Play className="w-5 fill-brand text-white group-hover/play:fill-white group-hover/play:text-brand" />
        </span>
      </div>
    </div>
  );
}

export function HomeAwardsSeal() {
  return (
    <div className="relative mx-auto mt-14 flex w-full max-w-[22rem] flex-col items-center justify-center px-6 lg:mt-0 lg:min-w-[28rem] lg:max-w-[32rem]">
      <div className="relative grid place-items-center">
        <div
          className="absolute size-64 rounded-full bg-brand/35 blur-3xl animate-seal-glow lg:size-80"
          aria-hidden
        />
        <div
          className="absolute size-56 rounded-full border-2 border-primary/25 animate-seal-pulse-ring lg:size-72"
          aria-hidden
        />
        <img
          src="/home/seal.png"
          alt={`${SITE_NAME} печат`}
          width={640}
          height={640}
          className="relative z-10 w-56 drop-shadow-[0_22px_40px_rgb(16_20_31/0.22)] lg:w-72"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function HomeDecorBlobs() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden lg:block" aria-hidden>
      <div className="absolute top-8 right-8 size-40 rounded-full bg-primary/10" />
      <div className="absolute top-16 right-40 size-16 rounded-full bg-brand" />
      <div className="absolute bottom-0 right-0 h-36 w-56 rounded-tl-full bg-brand/25" />
      <div className="absolute bottom-6 right-48 size-10 rounded-full bg-[#F5D76E]" />
    </div>
  );
}
