import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  heightClass?: string;
};

export function HomeWordmark({ className, heightClass = "h-7 lg:h-10" }: Props) {
  return (
    <img
      src="/mainlogo.png"
      alt="verno"
      width={220}
      height={45}
      className={cn("w-auto object-contain object-left", heightClass, className)}
    />
  );
}
