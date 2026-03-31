"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Home, Phone, Mail, Save } from "lucide-react";

interface TenantInfo {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  unit_number: string | null;
  unit_type: string | null;
  rent_amount: number;
  lease_start: string | null;
  lease_end: string | null;
  property_name: string;
  property_location: string | null;
}

interface Props {
  tenant: TenantInfo;
}

export default function TenantProfile({ tenant }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState(tenant.phone || "");
  const [email, setEmail] = useState(tenant.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/tenant/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to update profile");
    } else {
      setMessage("Profile updated successfully");
      router.refresh();
    }
    setSaving(false);
  }, [phone, email, router]);

  const initial = tenant.full_name.charAt(0).toUpperCase();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}>
          My Profile
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          View your details and update contact info
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Profile card */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.5rem",
          }}
        >
          <div className="flex items-center" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
            <div
              className="font-serif flex items-center justify-center"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--gold)",
                color: "var(--ink)",
                fontSize: "1.5rem",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 500 }}>{tenant.full_name}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Tenant</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <ProfileRow icon={Home} label="Property" value={tenant.property_name} />
            <ProfileRow icon={Home} label="Unit" value={tenant.unit_number || "—"} />
            {tenant.unit_type && <ProfileRow icon={Home} label="Type" value={tenant.unit_type} />}
            <ProfileRow icon={User} label="Monthly Rent" value={`KES ${tenant.rent_amount.toLocaleString("en-KE")}`} />
            <ProfileRow
              icon={User}
              label="Lease Start"
              value={tenant.lease_start ? new Date(tenant.lease_start).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            />
            <ProfileRow
              icon={User}
              label="Lease End"
              value={tenant.lease_end ? new Date(tenant.lease_end).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            />
            {tenant.property_location && (
              <ProfileRow icon={Home} label="Location" value={tenant.property_location} />
            )}
          </div>
        </div>

        {/* Editable contact info */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.5rem",
          }}
        >
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "1.2rem" }}>
            Contact Information
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="flex items-center uppercase"
                style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.4rem", gap: "0.3rem" }}
              >
                <Phone size={12} /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                  outline: "none",
                  background: "var(--cream)",
                }}
                placeholder="0712 345 678"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                className="flex items-center uppercase"
                style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.4rem", gap: "0.3rem" }}
              >
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                  outline: "none",
                  background: "var(--cream)",
                }}
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div
                style={{
                  background: message.includes("success") ? "var(--green-light)" : "var(--red-light)",
                  color: message.includes("success") ? "var(--green)" : "var(--red-soft)",
                  padding: "0.75rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center"
              style={{
                gap: "0.5rem",
                background: "var(--ink)",
                color: "var(--cream)",
                padding: "0.7rem 1.5rem",
                fontSize: "0.78rem",
                fontWeight: 500,
                border: "none",
                borderRadius: "4px",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>; label: string; value: string }) {
  return (
    <div className="flex items-center" style={{ gap: "0.75rem" }}>
      <Icon size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>{label}</p>
        <p style={{ fontSize: "0.82rem", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}
