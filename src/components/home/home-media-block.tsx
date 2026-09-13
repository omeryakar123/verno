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
        <span className="group/play absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-pop hover:bg-[#3ad08f]">
          <Play className="w-5 fill-emerald-400 text-white group-hover/play:fill-white group-hover/play:text-[#3ad08f]" />
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
          className="absolute size-64 rounded-full bg-[#3ad08f]/35 blur-3xl animate-seal-glow lg:size-80"
          aria-hidden
        />
        <div
          className="absolute size-56 rounded-full border-2 border-[#695de9]/25 animate-seal-pulse-ring lg:size-72"
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
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center">
        <img
          src="/mainlogo.png"
          alt="verno.bg"
          width={220}
          height={45}
          className="h-8 w-auto object-contain lg:h-10"
        />
        <p className="font-semibold tracking-[0.18em] text-[#695de9] uppercase text-sm lg:text-base">
          verno награди
        </p>
      </div>
    </div>
  );
}

export function HomeDecorBlobs() {
  return (
    <div className="hidden lg:block" aria-hidden>
      <div className="absolute top-10 left-80/100 size-75 rounded-full bg-indigo-100" />
      <div className="absolute top-5 left-72/100 size-28 rounded-full bg-emerald-400" />
      <div className="absolute top-80.5 left-70/100 h-60 w-125 -rotate-30 rounded-t-full bg-indigo-500" />
      <div className="absolute bottom-0 left-80/100 h-46 w-94 rounded-t-full bg-emerald-300" />
      <div className="absolute bottom-0 left-73/100 size-15 rounded-full bg-yellow-400" />
    </div>
  );
}
