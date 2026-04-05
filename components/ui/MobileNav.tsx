"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileNavProps {
  items: NavItem[];
  moreItems?: NavItem[];
  onLogout: () => void;
  className?: string;
}

export default function MobileNav({ items, moreItems, onLogout, className = "" }: MobileNavProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems?.some((item) => pathname === item.href) ?? false;

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 hidden border-t border-cream/8 bg-ink md:hidden ${className}`}
        style={{ padding: "0.5rem 0 env(safe-area-inset-bottom, 0.5rem)" }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[0.6rem] tracking-[0.03em] no-underline transition-colors ${
                  isActive ? "text-gold-light" : "text-cream/45 hover:text-cream/60"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
          {moreItems && moreItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              aria-label="More navigation options"
              className={`flex flex-col items-center gap-0.5 border-none bg-transparent px-3 py-1.5 text-[0.6rem] tracking-[0.03em] transition-colors cursor-pointer ${
                showMore || isMoreActive ? "text-gold-light" : "text-cream/45 hover:text-cream/60"
              }`}
            >
              {showMore ? <X size={20} /> : <MoreHorizontal size={20} />}
              More
            </button>
          )}
        </div>
      </nav>

      {/* More menu overlay + sheet */}
      {showMore && moreItems && (
        <>
          <div
            onClick={() => setShowMore(false)}
            className="fixed inset-0 z-[48] bg-black/30"
            aria-hidden="true"
          />
          <div className="fixed bottom-[60px] left-0 right-0 z-[49] rounded-t-xl border-t border-cream/8 bg-ink py-3">
            {moreItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-6 py-3 text-[0.82rem] no-underline transition-colors ${
                    isActive
                      ? "bg-gold/10 text-gold-light"
                      : "text-cream/60 hover:bg-cream/5"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mx-0 my-1 border-t border-cream/8" />
            <button
              onClick={() => { setShowMore(false); onLogout(); }}
              className="flex w-full items-center gap-3 border-none bg-transparent px-6 py-3 text-[0.82rem] text-cream/60 cursor-pointer hover:bg-cream/5"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}
