import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ctaLinkVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 font-semibold transition",
  {
    variants: {
      variant: {
        primary: "bg-orange-400 text-zinc-950 shadow-brand-cta hover:bg-orange-300",
        secondary: "bg-zinc-900 text-slate-100 hover:bg-zinc-800 hover:text-orange-100",
      },
      size: {
        sm: "rounded-xl px-4 py-2 text-sm",
        lg: "rounded-2xl px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

type CtaLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

/** The orange/zinc call-to-action pair used by the landing page header, hero, and closing CTA. */
export function CtaLink({ className, variant, size, ...props }: CtaLinkProps) {
  return <Link className={cn(ctaLinkVariants({ variant, size, className }))} {...props} />;
}

export { ctaLinkVariants };
