import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type HeadingLevel = "h2" | "h3" | "p";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** Use a heading tag when the eyebrow is the real label for its section. */
  as?: HeadingLevel;
  id?: string;
};

/** Small uppercase kicker that opens every marketing section. */
export function Eyebrow({ children, className, as: Tag = "p", id }: EyebrowProps) {
  return (
    <Tag id={id} className={cn("text-xs font-semibold uppercase tracking-eyebrow text-orange-200", className)}>
      {children}
    </Tag>
  );
}

type HeadingProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/** Page-level display heading (one per page). */
export function PageHeading({ children, className, id }: HeadingProps) {
  return (
    <h1 id={id} className={cn("text-4xl font-semibold uppercase text-white sm:text-5xl", className)}>
      {children}
    </h1>
  );
}

/** Section-level display heading. */
export function SectionHeading({ children, className, id }: HeadingProps) {
  return (
    <h2 id={id} className={cn("text-3xl font-semibold uppercase text-white sm:text-4xl", className)}>
      {children}
    </h2>
  );
}

/** Card/list-item heading. Pick the level that keeps the document outline in order. */
export function CardHeading({ children, className, id, as: Tag = "h3" }: HeadingProps & { as?: "h2" | "h3" }) {
  return (
    <Tag id={id} className={cn("text-xl font-semibold uppercase text-orange-200", className)}>
      {children}
    </Tag>
  );
}

type ProseProps = {
  children: React.ReactNode;
  className?: string;
};

/** Supporting copy under a heading. */
export function Lead({ children, className }: ProseProps) {
  return <p className={cn("text-sm text-slate-300/85 sm:text-base", className)}>{children}</p>;
}

/** Body copy inside cards and list items. */
export function Body({ children, className }: ProseProps) {
  return <p className={cn("text-sm text-slate-300/85", className)}>{children}</p>;
}

type SurfaceCardProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** The raised zinc panel used for every marketing card and list row. */
export function SurfaceCard<T extends React.ElementType = "article">({
  as,
  className,
  children,
  ...props
}: SurfaceCardProps<T>) {
  const Comp = (as ?? "article") as React.ElementType;

  return (
    <Comp className={cn("rounded-3xl bg-zinc-900 p-5", className)} {...props}>
      {children}
    </Comp>
  );
}

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  /** id of the heading that labels this section. */
  labelledBy?: string;
  /** Accessible name for sections that have no visible heading. */
  label?: string;
};

/** Marketing section with the shared vertical rhythm. */
export function Section({ children, className, labelledBy, label }: SectionProps) {
  return (
    <section aria-labelledby={labelledBy} aria-label={label} className={cn("mt-16", className)}>
      {children}
    </section>
  );
}

type TextLinkProps = React.ComponentProps<typeof Link>;

/** Small uppercase text link ("Open page", "Back to Home"). */
export function TextLink({ className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "focus-ring inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-label text-orange-300 transition hover:text-orange-200",
        className
      )}
      {...props}
    />
  );
}
