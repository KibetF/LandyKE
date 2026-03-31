"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, FileIcon, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
      <aside
        className="tenant-sidebar"
        style={{
          background: "var(--ink)",
          padding: "2rem 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "200px",
          minWidth: "200px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* User info */}
        <div
          style={{
            padding: "0 1.25rem 1.5rem",
            borderBottom: "1px solid rgba(245,240,232,0.08)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="font-serif flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--gold)",
              color: "var(--ink)",
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.8rem",
            }}
          >
            {initial}
          </div>
          <h4
            style={{
              color: "var(--cream)",
              fontSize: "0.8rem",
              fontWeight: 500,
              marginBottom: "0.2rem",
            }}
          >
            {tenantName}
          </h4>
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(245,240,232,0.35)",
              letterSpacing: "0.05em",
            }}
          >
            {propertyName}{unitNumber ? ` · Unit ${unitNumber}` : ""}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1" style={{ padding: "0 0.5rem" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/my/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center no-underline ${isActive ? "" : "sidebar-link"}`}
                style={{
                  gap: "0.65rem",
                  padding: "0.65rem 0.75rem",
                  fontSize: "0.78rem",
                  color: isActive ? "var(--gold-light)" : "rgba(245,240,232,0.45)",
                  borderRadius: "4px",
                  marginBottom: "0.15rem",
                  transition: "all 0.2s",
                  letterSpacing: "0.03em",
                  background: isActive ? "rgba(200,150,62,0.12)" : "transparent",
                }}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div style={{ padding: "0 0.5rem", marginBottom: "0.5rem" }}>
          <button
            onClick={handleLogout}
            className="flex items-center sidebar-signout"
            style={{
              gap: "0.65rem",
              padding: "0.65rem 0.75rem",
              fontSize: "0.78rem",
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
            <LogOut size={17} />
            Sign Out
          </button>
        </div>

        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(245,240,232,0.08)",
            fontSize: "0.65rem",
            color: "rgba(245,240,232,0.2)",
          }}
        >
          LandyKe © 2026
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="tenant-mobile-nav"
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
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/my/dashboard" && pathname.startsWith(item.href));
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
      </nav>
    </>
  );
}
