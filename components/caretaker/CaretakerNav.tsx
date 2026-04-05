"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MobileNav from "@/components/ui/MobileNav";

const navItems = [
  { href: "/caretaker/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

interface CaretakerNavProps {
  caretakerName: string;
  propertyNames: string[];
}

export default function CaretakerNav({ caretakerName, propertyNames }: CaretakerNavProps) {
  const pathname = usePathname();
  const initial = caretakerName.charAt(0).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="caretaker-sidebar sticky top-0 flex h-screen w-[200px] min-w-[200px] flex-col bg-ink py-8">
        {/* User info */}
        <div className="mb-6 border-b border-cream/8 px-5 pb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif text-xl font-semibold text-ink">
            {initial}
          </div>
          <h4 className="mb-0.5 text-[0.8rem] font-medium text-cream">
            {caretakerName}
          </h4>
          <span className="label-upper text-[0.6rem] text-cream/35">
            Caretaker
          </span>
          <div className="mt-2 text-[0.65rem] leading-relaxed text-cream/30">
            {propertyNames.map((name) => (
              <div key={name}>{name}</div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2" role="navigation" aria-label="Caretaker navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`mb-0.5 flex items-center gap-2.5 rounded px-3 py-2.5 text-[0.78rem] tracking-[0.03em] no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                  isActive
                    ? "bg-gold/12 text-gold-light"
                    : "text-cream/45 hover:bg-cream/5 hover:text-cream/70"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-2 mb-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded border-none bg-transparent px-3 py-2.5 text-[0.78rem] tracking-[0.03em] text-cream/45 cursor-pointer transition-all hover:bg-cream/5 hover:text-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>

        <div className="border-t border-cream/8 px-5 pt-4 text-[0.65rem] text-cream/20">
          LandyKe &copy; 2026
        </div>
      </aside>

      {/* Mobile bottom nav — caretaker has only 1 nav item, so include logout directly */}
      <MobileNav
        items={navItems}
        onLogout={handleLogout}
        className="caretaker-mobile-nav"
      />
    </>
  );
}
