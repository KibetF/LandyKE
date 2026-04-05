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
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-normal tracking-tight">
          My Profile
        </h1>
        <p className="mt-0.5 text-[0.78rem] text-muted">
          View your details and update contact info
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile card */}
        <div className="card">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-2xl font-semibold text-ink">
              {initial}
            </div>
            <div>
              <h3 className="text-base font-medium">{tenant.full_name}</h3>
              <p className="text-[0.75rem] text-muted">Tenant</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
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
        <div className="card">
          <h3 className="mb-5 font-serif text-[1.1rem] font-medium">
            Contact Information
          </h3>

          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="label-upper mb-1.5 flex items-center gap-1">
                <Phone size={12} /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded border border-warm bg-cream px-4 py-3 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
                placeholder="0712 345 678"
              />
            </div>

            <div className="mb-6">
              <label className="label-upper mb-1.5 flex items-center gap-1">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-warm bg-cream px-4 py-3 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div
                className={`mb-4 rounded px-4 py-3 text-[0.8rem] ${
                  message.includes("success")
                    ? "bg-green-light text-green"
                    : "bg-red-light text-red-soft"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded bg-ink px-6 py-2.5 text-[0.78rem] font-medium text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
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

function ProfileRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="shrink-0 text-muted" />
      <div>
        <p className="label-upper">{label}</p>
        <p className="text-[0.82rem] font-medium">{value}</p>
      </div>
    </div>
  );
}
