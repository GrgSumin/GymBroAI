import { ArrowRight, Activity, Dumbbell, Timer } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { BrandMark } from "@/components/marketing/brand-mark";
import { CtaLink } from "@/components/marketing/cta-link";
import {
  Body,
  CardHeading,
  Eyebrow,
  Lead,
  Section,
  SectionHeading,
  SurfaceCard,
  TextLink,
} from "@/components/marketing/section";

const highlights = [
  {
    title: "Adaptive Workouts",
    description: "Plans tuned to your split, available equipment, and recovery level.",
    icon: Dumbbell,
  },
  {
    title: "Always-On Coach",
    description: "Get form cues, deload advice, and nutrition nudges in one chat.",
    icon: Activity,
  },
  {
    title: "Fast Iterations",
    description: "Adjust weekly with quick follow-ups and smarter progression decisions.",
    icon: Timer,
  },
];

const metrics = [
  { value: "24/7", label: "Coaching Access" },
  { value: "3x", label: "Faster Planning" },
  { value: "100%", label: "Built For Lifters" },
];

const steps = [
  {
    step: "01",
    title: "Tell your goal",
    text: "Cut, bulk, recomp, or strength block. Add your schedule and constraints.",
  },
  {
    step: "02",
    title: "Get your plan",
    text: "Receive structured sessions, progressions, and recovery recommendations.",
  },
  {
    step: "03",
    title: "Refine weekly",
    text: "Adjust loads and volume with quick follow-up chats as you improve.",
  },
];

const tracks = [
  { title: "Beginner", text: "Start with low complexity plans and build confidence each week." },
  { title: "Intermediate", text: "Progressive overload and volume tuning with recovery checks." },
  { title: "Advanced", text: "Dial in intensity blocks and fatigue management for peak output." },
];

const explorePages = [
  {
    title: "Programs",
    description: "See focused training splits for different goals and schedules.",
    href: "/programs",
  },
  {
    title: "Transformations",
    description: "Read realistic progress stories and consistency habits.",
    href: "/transformations",
  },
  {
    title: "Coaching",
    description: "Understand how GymBro coaching works week to week.",
    href: "/coaching",
  },
];

const workoutPhotos = [
  {
    title: "Upper Body Strength",
    subtitle: "Men training power and control",
    image:
      "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Athletic Conditioning",
    subtitle: "Women focused on speed and endurance",
    image:
      "https://images.unsplash.com/photo-1597452485677-d661b7ea03d5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Functional Sessions",
    subtitle: "Mixed routines for real-life performance",
    image:
      "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Core and Mobility",
    subtitle: "Balanced training for long-term progress",
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1400&q=80",
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const primaryHref = isSignedIn ? "/chat" : "/sign-up?redirect_url=%2Fchat";
  const secondaryHref = isSignedIn ? "/profile" : "/sign-in?redirect_url=%2Fchat";
  const primaryLabel = isSignedIn ? "Open Chat" : "Start Free";
  const secondaryLabel = isSignedIn ? "Profile" : "Sign In";

  return (
    <div className="min-h-dvh bg-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <header className="mb-14 flex items-center justify-between">
          <BrandMark wordmarkClassName="text-2xl sm:text-3xl" />
          <nav aria-label="Account" className="flex items-center gap-2">
            <CtaLink href={secondaryHref} variant="secondary" size="sm">
              {secondaryLabel}
            </CtaLink>
            <CtaLink href={primaryHref} size="sm">
              {primaryLabel}
            </CtaLink>
          </nav>
        </header>

        <main>
          <Section
            labelledBy="hero-title"
            className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <h1
              id="hero-title"
              className="type-sequence mt-5 max-w-4xl text-5xl font-semibold uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl"
            >
              <span className="type-line type-line-1">Train Harder.</span>
              <span className="type-line type-line-2">Recover Smarter.</span>
              <span className="type-line type-line-3">Stay Consistent.</span>
            </h1>
            <Lead className="mt-5 max-w-2xl text-base text-slate-200/85 sm:text-lg">
              GymBro gives you focused coaching in seconds. Build better plans, adjust your training load, and keep
              momentum without overthinking.
            </Lead>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href={primaryHref} className="hover:-translate-y-px">
                {primaryLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </CtaLink>
              <CtaLink href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </CtaLink>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-3">
              {metrics.map((item) => (
                <div key={item.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs uppercase tracking-eyebrow text-slate-300/80">{item.label}</dt>
                  <dd className="text-3xl font-semibold text-orange-300 sm:text-4xl">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <Section labelledBy="performance-stack" className="mt-0">
              <Eyebrow as="h2" id="performance-stack">
                Performance Stack
              </Eyebrow>
              <div className="mt-5 space-y-5">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.title} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex size-8 items-center justify-center rounded-full bg-zinc-900 text-orange-200">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <CardHeading className="font-medium text-white">{item.title}</CardHeading>
                        <Body className="mt-1">{item.description}</Body>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Section>

            <Section labelledBy="how-it-works" className="mt-0">
              <Eyebrow as="h2" id="how-it-works">
                How It Works
              </Eyebrow>
              <ol className="mt-5 space-y-5">
                {steps.map((item) => (
                  <li key={item.step} className="flex items-start gap-4">
                    <span aria-hidden="true" className="text-sm font-semibold tracking-wordmark text-orange-300">
                      {item.step}
                    </span>
                    <div>
                      <CardHeading className="font-medium text-white">{item.title}</CardHeading>
                      <Body className="mt-1">{item.text}</Body>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          </div>

          <Section labelledBy="training-inspiration">
            <Eyebrow as="h2" id="training-inspiration">
              Training Inspiration
            </Eyebrow>
            <Lead className="mt-3 max-w-3xl">
              Simple visuals. Real effort. Use GymBro to build sessions that match your pace and your goals.
            </Lead>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {workoutPhotos.map((photo, index) => (
                <SurfaceCard
                  key={photo.title}
                  className="group relative overflow-hidden p-0 animate-in fade-in slide-in-from-bottom-3"
                  style={{ animationDelay: `${index * 120}ms`, animationDuration: "700ms" }}
                >
                  <div
                    className="h-56 w-full bg-cover bg-center transition duration-500 group-hover:scale-105 sm:h-64"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.1)), url(${photo.image})`,
                    }}
                    role="img"
                    aria-label={photo.subtitle}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <CardHeading className="text-lg text-orange-100">{photo.title}</CardHeading>
                    <p className="mt-1 text-sm text-slate-200/90">{photo.subtitle}</p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </Section>

          <Section label="Experience levels" className="grid gap-8 rounded-3xl bg-zinc-900/70 p-6 sm:p-8 lg:grid-cols-3">
            {tracks.map((track) => (
              <article key={track.title}>
                <CardHeading as="h2">{track.title}</CardHeading>
                <Body className="mt-2">{track.text}</Body>
              </article>
            ))}
          </Section>

          <Section label="Get started" className="animate-in fade-in duration-700">
            <p className="text-center text-lg font-medium text-slate-100 sm:text-xl">
              <span className="text-orange-300">Simple look.</span> Serious coaching.
            </p>
            <div className="mt-6 flex justify-center">
              <CtaLink href={primaryHref}>
                {primaryLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </CtaLink>
            </div>
          </Section>

          <Section labelledBy="explore-pages">
            <Eyebrow>Explore Pages</Eyebrow>
            <SectionHeading id="explore-pages" className="mt-3">
              More Than One Screen
            </SectionHeading>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {explorePages.map((item) => (
                <SurfaceCard key={item.href}>
                  <CardHeading>{item.title}</CardHeading>
                  <Body className="mt-2">{item.description}</Body>
                  <TextLink href={item.href} className="mt-4">
                    Open page
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </TextLink>
                </SurfaceCard>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
