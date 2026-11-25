import { Dumbbell } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  badgeClassName?: string;
  wordmarkClassName?: string;
};

/** Dumbbell badge + GymBro wordmark, shared by the landing header and the app navbar. */
export function BrandMark({ className, badgeClassName, wordmarkClassName }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full bg-orange-400 text-black shadow-brand-glow",
          badgeClassName
        )}
      >
        <Dumbbell aria-hidden="true" className="size-4" />
      </span>
      <span
        className={cn(
          "text-xl font-semibold uppercase tracking-wordmark text-orange-200",
          wordmarkClassName
        )}
      >
        GymBro
      </span>
    </span>
  );
}
