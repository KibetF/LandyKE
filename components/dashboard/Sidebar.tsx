"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  FileText,
  Wrench,
  FileIcon,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MobileNav from "@/components/ui/MobileNav";

const primaryNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Home },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/maintenance", label: "Repairs", icon: Wrench },
];

const secondaryNavItems = [
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/documents", label: "Documents", icon: FileIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

interface SidebarProps {
  userName: string;
  isAdmin?: boolean;
}

export default function Sidebar({ userName, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const initial = userName.charAt(0).toUpperCase();

  const desktopNavItems = isAdmin
    ? [...allNavItems, { href: "/admin", label: "Admin", icon: Shield }]
    : allNavItems;

  const moreItems = isAdmin
    ? [...secondaryNavItems, { href: "/admin", label: "Admin", icon: Shield }]
    : secondaryNavItems;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="portal-sidebar sticky top-0 flex h-screen w-[240px] min-w-[240px] flex-col bg-ink py-8">
        {/* User info */}
        <div className="sidebar-user mb-6 border-b border-cream/8 px-6 pb-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold font-serif text-xl font-semibold text-ink">
            {initial}
          </div>
          <h4 className="mb-0.5 text-[0.85rem] font-medium text-cream">
            {userName}
          </h4>
          <span className="text-[0.7rem] tracking-[0.05em] text-cream/35">
            {isAdmin ? "Administrator" : "Landlord Client"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3" role="navigation" aria-label="Main navigation">
          {desktopNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`mb-0.5 flex items-center gap-3 rounded px-3 py-2.5 text-[0.8rem] tracking-[0.03em] no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                  isActive
                    ? "bg-gold/12 text-gold-light"
                    : "text-cream/45 hover:bg-cream/5 hover:text-cream/70"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="sidebar-signout-wrap px-3 mb-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded border-none bg-transparent px-3 py-2.5 text-[0.8rem] tracking-[0.03em] text-cream/45 cursor-pointer transition-all hover:bg-cream/5 hover:text-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer border-t border-cream/8 px-6 pt-4 text-[0.7rem] text-cream/20">
          LandyKe © 2026 · v1.0
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <MobileNav
        items={primaryNavItems}
        moreItems={moreItems}
        onLogout={handleLogout}
        className="landlord-mobile-nav"
      />
    </>
  );
}
