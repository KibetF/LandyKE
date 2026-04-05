"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, FileIcon, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MobileNav from "@/components/ui/MobileNav";

const navItems = [
  { href: "/my/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/my/documents", label: "Documents", icon: FileIcon },
  { href: "/my/profile", label: "Profile", icon: User },
];

interface TenantNavProps {
  tenantName: string;
  propertyName: string;
  unitNumber: string | null;
}

export default function TenantNav({ tenantName, propertyName, unitNumber }: TenantNavProps) {
  const pathname = usePathname();
  const initial = tenantName.charAt(0).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/tenant-login";
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="tenant-sidebar sticky top-0 flex h-screen w-[200px] min-w-[200px] flex-col bg-ink py-8">
        {/* User info */}
        <div className="mb-6 border-b border-cream/8 px-5 pb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif text-xl font-semibold text-ink">
            {initial}
          </div>
          <h4 className="mb-0.5 text-[0.8rem] font-medium text-cream">
            {tenantName}
          </h4>
          <span className="text-[0.65rem] tracking-[0.05em] text-cream/35">
            {propertyName}{unitNumber ? ` · Unit ${unitNumber}` : ""}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2" role="navigation" aria-label="Tenant navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/my/dashboard" && pathname.startsWith(item.href));
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
            className="flex w-full items-center gap-2.5 rounded border-none bg-transparent px-3 py-2.5 text-[0.78rem] tracking-[0.03em] text-cream/45 transition-all cursor-pointer hover:bg-cream/5 hover:text-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>

        <div className="border-t border-cream/8 px-5 pt-4 text-[0.65rem] text-cream/20">
          LandyKe © 2026
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <MobileNav
        items={navItems}
        onLogout={handleLogout}
        className="tenant-mobile-nav"
      />
    </>
  );
}
