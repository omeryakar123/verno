import { Search } from "lucide-react";
import { HomeWordmark } from "@/components/home/home-wordmark";

const PEOPLE = {
  phone: "/home-banner/people/phone.png",
  sit: "/home-banner/people/sit.png",
  celebrate: "/home-banner/people/celebrate.png",
} as const;

const MOBILE_SLOTS = [
  {
    src: PEOPLE.phone,
    left: "24.939%",
    top: "0%",
    width: "38.499%",
    height: "46.377%",
    position: "50% 18%",
  },
  {
    src: PEOPLE.sit,
    left: "0%",
    top: "0%",
    width: "24.939%",
    height: "46.377%",
    borderTopRightRadius: "70.874% 76.042%",
    position: "50% 22%",
  },
  {
    src: PEOPLE.celebrate,
    left: "63.438%",
    top: "0%",
    width: "36.562%",
    height: "72.947%",
    rounded: true,
    position: "50% 18%",
  },
] as const;

const DESKTOP_SLOTS = [
  {
    src: PEOPLE.celebrate,
    left: "0%",
    top: "0%",
    width: "38.628%",
    height: "38.824%",
    position: "50% 18%",
  },
  {
    src: PEOPLE.phone,
    left: "38.628%",
    top: "16.471%",
    width: "36.608%",
    height: "35.556%",
    rounded: true,
    position: "50% 16%",
  },
  {
    src: PEOPLE.sit,
    left: "25.168%",
    top: "64.967%",
    width: "26.918%",
    height: "23.66%",
    borderTopRightRadius: "36.5% 40.331%",
    position: "48% 28%",
  },
] as const;

type Slot = {
  src: string;
  left: string;
  top: string;
  width: string;
  height: string;
  rounded?: boolean;
  borderTopRightRadius?: string;
  position?: string;
};

function SlotImage({ slot }: { slot: Slot }) {
  return (
    <div
      className={`absolute overflow-hidden bg-white${slot.rounded ? " rounded-full" : ""}`}
      style={{
        left: slot.left,
        top: slot.top,
        width: slot.width,
        height: slot.height,
        borderTopRightRadius: slot.borderTopRightRadius,
      }}
    >
      <img
        src={slot.src}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition: slot.position ?? "50% 20%" }}
      />
    </div>
  );
}

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function HeroSection({ search, onSearchChange, onSubmit }: Props) {
  return (
    <section className="relative overflow-hidden bg-white pb-10 lg:pb-16">
      <div className="relative mb-8 block h-[50.1vw] w-full lg:hidden">
        <img
          src="/home-banner/mobile/banner.svg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full"
        />
        {MOBILE_SLOTS.map((slot) => (
          <SlotImage key={slot.src} slot={slot} />
        ))}
      </div>

      <div className="container relative z-10 px-4 lg:grid lg:max-w-[1280px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:items-center lg:gap-8 lg:px-0">
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
          aria-hidden
        >
          <div className="absolute top-[8%] left-[6%] size-20 rounded-full bg-primary/18" />
          <div className="absolute top-[18%] left-[36%] size-8 rounded-full bg-brand" />
          <div className="absolute top-[42%] left-[28%] size-4 rounded-full bg-[#F5D76E]" />
          <div className="absolute bottom-[22%] left-[4%] size-14 rounded-full bg-primary" />
          <div className="absolute right-[46%] bottom-[28%] size-24 rounded-full bg-brand/20" />
          <div className="absolute top-[62%] left-[40%] size-10 rounded-full bg-[#C4B5FD]" />
          <div className="absolute top-[4%] right-[42%] size-6 rounded-full bg-[#F5D76E]/90" />
        </div>
        <div className="relative z-10 lg:py-16">
          <h1 className="mb-6 font-normal text-[#383838] text-[36px] leading-[1.12] tracking-[0.5px] sm:text-[43px] lg:mb-10 lg:text-[56px]">
            <strong className="block font-semibold">За решение</strong>
            <HomeWordmark heightClass="mt-3 h-9 sm:h-11 lg:h-14" />
          </h1>
          <form onSubmit={onSubmit}>
            <div className="relative font-semibold text-base tracking-wide">
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Търси марка, модел, продукт"
                aria-label="Търси марка, модел, продукт"
                autoComplete="off"
                spellCheck={false}
                className="home-search-field"
              />
              <button
                type="submit"
                aria-label="Търси"
                className="absolute top-0 right-0 flex h-full w-22 rounded-4xl bg-brand text-white lg:hidden"
              >
                <Search className="m-auto size-6" aria-hidden />
              </button>
              <button
                type="submit"
                className="absolute top-0 right-0 z-10 hidden h-full w-32 cursor-pointer items-center justify-center rounded-full bg-brand font-semibold text-lg text-white transition-opacity hover:bg-brand-hover lg:flex"
              >
                Търси
              </button>
            </div>
          </form>
        </div>

        <div className="relative z-10 mx-auto hidden h-[640px] w-full max-w-[780px] lg:block xl:h-[760px] xl:max-w-[900px]">
          <img
            src="/home-banner/desktop/banner.svg"
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full"
          />
          {DESKTOP_SLOTS.map((slot) => (
            <SlotImage key={slot.src} slot={slot} />
          ))}
        </div>
      </div>
    </section>
  );
}
