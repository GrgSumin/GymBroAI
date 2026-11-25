import * as React from "react";

import { Eyebrow, Lead, PageHeading, TextLink } from "@/components/marketing/section";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
};

/**
 * Shell for the standalone marketing pages (`/coaching`, `/programs`,
 * `/transformations`). These render outside the `(app)` route group, so they own
 * their own `main` landmark and their own "back to home" escape hatch.
 */
export function ContentPage({ eyebrow, title, lead, children }: ContentPageProps) {
  return (
    <div className="min-h-dvh bg-black px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <PageHeading className="mt-3">{title}</PageHeading>
        <Lead className="mt-3 max-w-2xl">{lead}</Lead>

        <div className="mt-8">{children}</div>

        <TextLink href="/" className="mt-8">
          Back to Home
        </TextLink>
      </main>
    </div>
  );
}
