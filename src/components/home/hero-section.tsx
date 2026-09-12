import { Search } from "lucide-react";

const MOBILE_SLOTS = [
  {
    src: "/home-banner/mobile/1.jpg",
    left: "24.939%",
    top: "0%",
    width: "38.499%",
    height: "46.377%",
  },
  {
    src: "/home-banner/mobile/3.jpg",
    left: "0%",
    top: "0%",
    width: "24.939%",
    height: "46.377%",
    borderTopRightRadius: "70.874% 76.042%",
  },
  {
    src: "/home-banner/mobile/2.jpg",
    left: "63.438%",
    top: "0%",
    width: "36.562%",
    height: "72.947%",
    rounded: true,
  },
] as const;

const DESKTOP_SLOTS = [
  {
    src: "/home-banner/desktop/1.jpg",
    left: "0%",
    top: "0%",
    width: "38.628%",
    height: "38.824%",
  },
  {
    src: "/home-banner/desktop/2.jpg",
    left: "38.628%",
    top: "16.471%",
    width: "36.608%",
    height: "35.556%",
    rounded: true,
  },
  {
    src: "/home-banner/desktop/3.jpg",
    left: "25.168%",
    top: "64.967%",
    width: "26.918%",
    height: "23.66%",
    borderTopRightRadius: "36.5% 40.331%",
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
};

function SlotImage({ slot }: { slot: Slot }) {
  return (
    <div
      className={`absolute overflow-hidden${slot.rounded ? " rounded-full" : ""}`}
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
    <div className="relative pt-4 pb-20 lg:pb-[247px] lg:before:absolute lg:before:top-[31px] lg:before:right-0 lg:before:bottom-auto lg:before:block lg:before:h-[270px] lg:before:w-[calc(50%-720px)] lg:before:bg-[#e4e7f3] lg:before:content-['']">
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

      <div className="absolute inset-0 -top-24 mx-auto hidden max-w-[1440px] justify-end lg:flex">
        <div className="relative h-[648px] w-[630px] xl:h-[765px] xl:w-[743px]">
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

      <div className="relative z-10 container px-4 lg:max-w-6xl lg:px-0">
        <div className="lg:w-[46.3%] lg:pt-20">
          <h1 className="mb-5 whitespace-pre-line font-normal text-[#383838] text-[43px] leading-tight tracking-[1px] lg:mb-28 lg:text-[61px] lg:leading-[1.12]">
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
                className="home-search-field placeholder:truncate"
              />
              <button
                type="submit"
                aria-label="Търси"
                className="absolute top-0 right-0 flex h-full w-22 rounded-4xl bg-[#3ad08f] text-white lg:pointer-events-none lg:right-auto lg:left-4 lg:w-auto lg:bg-transparent lg:text-[#626692]"
              >
                <Search className="m-auto size-6" aria-hidden />
              </button>
              <button
                type="submit"
                className="absolute top-0 right-0 z-10 hidden h-full w-32 cursor-pointer items-center justify-center rounded-full bg-[#3ad08f] font-semibold text-lg text-white transition-opacity hover:bg-[#42e29d] lg:flex"
              >
                Търси
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
