"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { BrandMark } from "@/components/marketing/brand-mark";
import { cn } from "@/lib/utils";

const routes = [
  { name: "Home", href: "/" },
  { name: "Chat", href: "/chat" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/chat" className="focus-ring group inline-flex items-center gap-3">
          <BrandMark
            badgeClassName="transition group-hover:scale-105"
            wordmarkClassName="tracking-eyebrow text-orange-100"
          />
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-2 rounded-full bg-zinc-950 px-2 py-1">
            {routes.map((route) => {
              const isActive = pathname === route.href;

              return (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "focus-ring block rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-nav transition sm:text-sm",
                      isActive ? "bg-zinc-800 text-orange-200" : "text-slate-300/80 hover:text-orange-100"
                    )}
                  >
                    {route.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="rounded-full bg-zinc-900 p-1.5">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
