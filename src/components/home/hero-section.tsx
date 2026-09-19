import { Search } from "lucide-react";

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

      <div className="container relative z-10 px-4 lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 lg:px-0">
        <div className="lg:py-16">
          <h1 className="mb-6 whitespace-pre-line font-normal text-[#383838] text-[36px] leading-[1.12] tracking-[0.5px] sm:text-[43px] lg:mb-10 lg:text-[56px]">
            <strong className="font-semibold">За решение</strong>
            {"\n"}
            verno.bg
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

        <div className="relative mx-auto hidden h-[520px] w-full max-w-[620px] lg:block xl:h-[580px] xl:max-w-[680px]">
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
