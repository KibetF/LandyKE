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
      <div className="portal-search relative" ref={searchRef}>
        <Search size={16} className="shrink-0 text-muted" />
        <input
          type="text"
          placeholder="Search properties, tenants, payments..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (searchResults) setShowSearch(true); }}
          aria-label="Search"
        />

        {showSearch && searchResults && (
          <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[400px] overflow-hidden overflow-y-auto rounded-lg border border-warm bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
            {!hasResults ? (
              <div className="p-4 text-center text-[0.8rem] text-muted">
                No results found
              </div>
            ) : (
              <>
                {searchResults.properties.length > 0 && (
                  <>
                    <div className="label-upper bg-cream px-4 py-2">Properties</div>
                    {searchResults.properties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { router.push("/properties"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover cursor-pointer px-4 py-2.5 text-[0.85rem]"
                      >
                        {p.name}
                        {p.location && <span className="ml-2 text-[0.7rem] text-muted">{p.location}</span>}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.tenants.length > 0 && (
                  <>
                    <div className="label-upper bg-cream px-4 py-2">Tenants</div>
                    {searchResults.tenants.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { router.push("/tenants"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover cursor-pointer px-4 py-2.5 text-[0.85rem]"
                      >
                        {t.full_name}
                        {t.properties && <span className="ml-2 text-[0.7rem] text-muted">{t.properties.name}</span>}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.payments.length > 0 && (
                  <>
                    <div className="label-upper bg-cream px-4 py-2">Payments</div>
                    {searchResults.payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { router.push("/payments"); setShowSearch(false); setSearchQuery(""); }}
                        className="row-hover cursor-pointer px-4 py-2.5 text-[0.85rem]"
                      >
                        KES {Number(p.amount).toLocaleString()} — {p.tenants?.full_name || "Unknown"}
                        <span className="ml-2 text-[0.7rem] text-muted">{p.status}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          className="notification-bell"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notifications"
          aria-expanded={showNotifications}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showNotifications && (
          <div className="notification-dropdown">
            <div className="flex items-center justify-between border-b border-warm px-5 py-4">
              <span className="text-[0.85rem] font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="border-none bg-transparent text-[0.65rem] text-gold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-[0.8rem] text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={`cursor-pointer border-b border-warm px-5 py-3 transition-colors hover:bg-cream/50 ${
                    !n.is_read ? "bg-gold/[0.04]" : ""
                  }`}
                >
                  <div className="mb-0.5 flex items-start justify-between">
                    <span className={`text-[0.8rem] ${n.is_read ? "font-normal" : "font-semibold"}`}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    )}
                  </div>
                  <p className="mb-0.5 text-[0.72rem] text-muted">{n.description}</p>
                  <span className="text-[0.65rem] text-muted">{timeAgo(n.created_at)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
