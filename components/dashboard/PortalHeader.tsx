"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";

const mockNotifications = [
  { id: "1", title: "Payment Received", desc: "KES 12,500 from James Waweru — Plot A", time: "2 hours ago", read: false },
  { id: "2", title: "Maintenance Request", desc: "New urgent request at Plot B — Pioneer", time: "5 hours ago", read: false },
  { id: "3", title: "Tenant Move-in", desc: "Mary Wanjiku moved into Kapsoya Unit 3", time: "1 day ago", read: true },
  { id: "4", title: "Payment Overdue", desc: "Samuel Mutua — Annex Unit 1, 5 days overdue", time: "2 days ago", read: true },
  { id: "5", title: "Monthly Report Ready", desc: "February 2026 report is available", time: "3 days ago", read: true },
];

export default function PortalHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="portal-header">
      <div className="portal-search">
        <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
        <input type="text" placeholder="Search properties, tenants, payments..." />
      </div>

      <div style={{ marginLeft: "auto", position: "relative" }} ref={dropdownRef}>
        <button
          className="notification-bell"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showNotifications && (
          <div className="notification-dropdown">
            <div
              style={{
                padding: "1rem 1.2rem",
                borderBottom: "1px solid var(--warm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Notifications</span>
              <span style={{ fontSize: "0.65rem", color: "var(--gold)", cursor: "pointer" }}>
                Mark all read
              </span>
            </div>
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "0.8rem 1.2rem",
                  borderBottom: "1px solid var(--warm)",
                  background: n.read ? "transparent" : "rgba(200,150,62,0.04)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <div className="flex justify-between items-start" style={{ marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: n.read ? 400 : 600 }}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--gold)",
                        flexShrink: 0,
                        marginTop: "0.3rem",
                      }}
                    />
                  )}
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.15rem" }}>
                  {n.desc}
                </p>
                <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{n.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
