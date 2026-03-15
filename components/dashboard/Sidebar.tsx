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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/properties", label: "My Properties", icon: Home },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/documents", label: "Documents", icon: FileIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const initial = userName.charAt(0).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
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
          Landlord Client
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1" style={{ padding: "0 0.75rem" }}>
        {navItems.map((item) => {
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
  );
}
