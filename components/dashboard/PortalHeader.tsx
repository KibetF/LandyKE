"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

interface SearchResults {
  properties: Array<{ id: string; name: string; location: string | null }>;
  tenants: Array<{ id: string; full_name: string; properties?: { name: string } }>;
  payments: Array<{ id: string; amount: number; status: string; tenants?: { full_name: string } }>;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

export default function PortalHeader() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setSearchResults(data);
          setShowSearch(true);
        })
        .catch(() => {});
    }, 300);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_id: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  const hasResults = searchResults &&
    (searchResults.properties.length > 0 || searchResults.tenants.length > 0 || searchResults.payments.length > 0);

  return (
    <div className="portal-header">
      <div className="portal-search" ref={searchRef} style={{ position: "relative" }}>
        <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search properties, tenants, payments..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (searchResults) setShowSearch(true); }}
        />

        {showSearch && searchResults && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "0.5rem",
              background: "var(--white)",
              border: "1px solid var(--warm)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              zIndex: 100,
              overflow: "hidden",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {!hasResults ? (
              <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--muted)" }}>
                No results found
              </div>
            ) : (
              <>
                {searchResults.properties.length > 0 && (
                  <>
                    <div style={{ padding: "0.5rem 1rem", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", background: "var(--cream)" }}>
                      Properties
                    </div>
                    {searchResults.properties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { router.push("/properties"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover"
                        style={{ padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        {p.name}
                        {p.location && <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>{p.location}</span>}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.tenants.length > 0 && (
                  <>
                    <div style={{ padding: "0.5rem 1rem", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", background: "var(--cream)" }}>
                      Tenants
                    </div>
                    {searchResults.tenants.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { router.push("/tenants"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover"
                        style={{ padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        {t.full_name}
                        {t.properties && <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>{t.properties.name}</span>}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.payments.length > 0 && (
                  <>
                    <div style={{ padding: "0.5rem 1rem", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", background: "var(--cream)" }}>
                      Payments
                    </div>
                    {searchResults.payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { router.push("/payments"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover"
                        style={{ padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        KES {Number(p.amount).toLocaleString()} — {p.tenants?.full_name || "Unknown"}
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>{p.status}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
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
              {unreadCount > 0 && (
                <span
                  onClick={markAllRead}
                  style={{ fontSize: "0.65rem", color: "var(--gold)", cursor: "pointer" }}
                >
                  Mark all read
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1.2rem", textAlign: "center", fontSize: "0.8rem", color: "var(--muted)" }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  style={{
                    padding: "0.8rem 1.2rem",
                    borderBottom: "1px solid var(--warm)",
                    background: n.is_read ? "transparent" : "rgba(200,150,62,0.04)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div className="flex justify-between items-start" style={{ marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: n.is_read ? 400 : 600 }}>
                      {n.title}
                    </span>
                    {!n.is_read && (
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
                    {n.description}
                  </p>
                  <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{timeAgo(n.created_at)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
