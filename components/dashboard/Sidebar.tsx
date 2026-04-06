"use client";

import { useState } from "react";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [showMore, setShowMore] = useState(false);

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

  // Check if active page is in "More" menu
  const isMoreActive = moreItems.some(
    (item) => pathname === item.href
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="flex flex-col portal-sidebar"
        style={{
          background: "var(--ink)",
          padding: "2rem 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "240px",
          minWidth: "240px",
        }}
      >
        {/* User info */}
        <div
          className="sidebar-user"
          style={{
            padding: "0 1.5rem 1.5rem",
            borderBottom: "1px solid rgba(245,240,232,0.08)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="font-serif flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--gold)",
              color: "var(--ink)",
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: "0.8rem",
            }}
          >
            {initial}
          </div>
          <h4
            style={{
              color: "var(--cream)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "0.2rem",
            }}
          >
            {userName}
          </h4>
          <span
            style={{
              fontSize: "0.7rem",
              color: "rgba(245,240,232,0.35)",
              letterSpacing: "0.05em",
            }}
          >
            {isAdmin ? "Administrator" : "Landlord Client"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1" style={{ padding: "0 0.75rem" }}>
          {desktopNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center no-underline ${isActive ? "" : "sidebar-link"}`}
                style={{
                  gap: "0.75rem",
                  padding: "0.7rem 0.75rem",
                  fontSize: "0.8rem",
                  color: isActive
                    ? "var(--gold-light)"
                    : "rgba(245,240,232,0.45)",
                  borderRadius: "4px",
                  marginBottom: "0.2rem",
                  transition: "all 0.2s",
                  letterSpacing: "0.03em",
                  background: isActive ? "rgba(200,150,62,0.12)" : "transparent",
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="sidebar-signout-wrap" style={{ padding: "0 0.75rem", marginBottom: "0.5rem" }}>
          <button
            onClick={handleLogout}
            className="flex items-center sidebar-signout"
            style={{
              gap: "0.75rem",
              padding: "0.7rem 0.75rem",
              fontSize: "0.8rem",
              color: "rgba(245,240,232,0.45)",
              borderRadius: "4px",
              letterSpacing: "0.03em",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div
          className="sidebar-footer"
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(245,240,232,0.08)",
            fontSize: "0.7rem",
            color: "rgba(245,240,232,0.2)",
          }}
        >
          LandyKe © 2026 · v1.0
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="landlord-mobile-nav"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--ink)",
          borderTop: "1px solid rgba(245,240,232,0.08)",
          zIndex: 50,
          justifyContent: "space-around",
          padding: "0.5rem 0 env(safe-area-inset-bottom, 0.5rem)",
        }}
      >
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center no-underline"
              style={{
                gap: "0.2rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.6rem",
                color: isActive ? "var(--gold-light)" : "rgba(245,240,232,0.45)",
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex flex-col items-center"
          style={{
            gap: "0.2rem",
            padding: "0.4rem 0.75rem",
            fontSize: "0.6rem",
            color: showMore || isMoreActive ? "var(--gold-light)" : "rgba(245,240,232,0.45)",
            letterSpacing: "0.03em",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
        >
          {showMore ? <X size={20} /> : <MoreHorizontal size={20} />}
          More
        </button>
      </nav>

      {/* More menu slide-up sheet */}
      {showMore && (
        <>
          <div
            onClick={() => setShowMore(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 48,
            }}
          />
          <div
            className="landlord-more-menu"
            style={{
              position: "fixed",
              bottom: "60px",
              left: 0,
              right: 0,
              background: "var(--ink)",
              borderTop: "1px solid rgba(245,240,232,0.08)",
              borderRadius: "12px 12px 0 0",
              padding: "0.75rem 0",
              zIndex: 49,
            }}
          >
            {moreItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className="flex items-center no-underline"
                  style={{
                    gap: "0.75rem",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.82rem",
                    color: isActive ? "var(--gold-light)" : "rgba(245,240,232,0.6)",
                    transition: "background 0.15s",
                    background: isActive ? "rgba(200,150,62,0.1)" : "transparent",
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div style={{ borderTop: "1px solid rgba(245,240,232,0.08)", margin: "0.25rem 0" }} />
            <button
              onClick={() => { setShowMore(false); handleLogout(); }}
              className="flex items-center"
              style={{
                gap: "0.75rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.82rem",
                color: "rgba(245,240,232,0.6)",
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
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
