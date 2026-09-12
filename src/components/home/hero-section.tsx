import { Search } from "lucide-react";

const BANNER = {
  mobile: {
    frame: "/home-banner/mobile/banner.svg",
    slots: [
      {
        src: "/home-banner/mobile/1.jpg",
        left: "24.939%",
        top: "0%",
        width: "38.499%",
        height: "46.377%",
        borderRadius: undefined,
      },
      {
        src: "/home-banner/mobile/3.jpg",
        left: "0%",
        top: "0%",
        width: "24.939%",
        height: "46.377%",
        borderRadius: "70.874% 76.042% 0 0",
      },
      {
        src: "/home-banner/mobile/2.jpg",
        left: "63.438%",
        top: "0%",
        width: "36.562%",
        height: "72.947%",
        borderRadius: "9999px",
      },
    ],
  },
  desktop: {
    frame: "/home-banner/desktop/banner.svg",
    slots: [
      {
        src: "/home-banner/desktop/1.jpg",
        left: "24.939%",
        top: "0%",
        width: "38.499%",
        height: "46.377%",
        borderRadius: undefined,
      },
      {
        src: "/home-banner/desktop/3.jpg",
        left: "0%",
        top: "0%",
        width: "24.939%",
        height: "46.377%",
        borderRadius: "70.874% 76.042% 0 0",
      },
      {
        src: "/home-banner/desktop/2.jpg",
        left: "63.438%",
        top: "0%",
        width: "36.562%",
        height: "72.947%",
        borderRadius: "9999px",
      },
    ],
  },
} as const;

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function BannerCollage({ variant }: { variant: "mobile" | "desktop" }) {
  const data = variant === "mobile" ? BANNER.mobile : BANNER.desktop;
  const visibility = variant === "mobile" ? "lg:hidden" : "hidden lg:block";

  return (
    <div
      className={`relative mb-8 block h-[50.1vw] w-full ${visibility} ${variant === "desktop" ? "lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:h-auto lg:w-[53.7%]" : ""}`}
    >
      <img
        src={data.frame}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full"
      />
      {data.slots.map((slot) => (
        <div
          key={slot.src}
          className="absolute overflow-hidden"
          style={{
            left: slot.left,
            top: slot.top,
            width: slot.width,
            height: slot.height,
            borderTopRightRadius: slot.borderRadius?.includes("70.874")
              ? "70.874% 76.042%"
              : undefined,
            borderRadius: slot.borderRadius === "9999px" ? "9999px" : undefined,
          }}
        >
          <img
            src={slot.src}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function HeroSection({ search, onSearchChange, onSubmit }: Props) {
  return (
    <div className="home-hero-shell">
      <BannerCollage variant="mobile" />
      <BannerCollage variant="desktop" />

      <div className="home-container relative z-10 px-4 lg:max-w-6xl lg:px-0">
        <div className="lg:w-[46.3%] lg:pt-20">
          <div className="mb-5 lg:mb-28">
            <h1 className="whitespace-pre-line font-normal text-[#383838] text-[43px] leading-tight tracking-[1px] lg:text-[61px] lg:leading-[1.12]">
              <strong className="font-semibold">За решение</strong>
              {"\n"}
              verno.bg
            </h1>
          </div>

          <form onSubmit={onSubmit}>
            <div className="relative font-semibold text-base tracking-wide">
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Търси марка, модел, продукт"
                aria-label="Търси марка, модел, продукт"
                className="home-hero-search pr-14 lg:pr-38"
              />
              <button
                type="submit"
                aria-label="Търси"
                className="absolute top-0 right-0 flex h-full w-14 items-center justify-center rounded-[2rem] bg-brand text-white lg:pointer-events-none lg:right-auto lg:left-4 lg:w-auto lg:bg-transparent lg:text-[#626692]"
              >
                <Search className="m-auto size-6" aria-hidden />
              </button>
              <button type="submit" className="home-search-btn">
                Търси
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
