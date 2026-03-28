"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Users, Check, AlertCircle, Home, CreditCard,
  Building2, Plus, ChevronDown,
} from "lucide-react";

interface Landlord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface Property {
  id: string;
  name: string;
  location: string | null;
  total_units: number;
  landlord_id: string;
}

interface Tenant {
  id: string;
  full_name: string;
  unit_number: string | null;
  phone: string | null;
  monthly_rent: number;
  is_active: boolean;
  property_id: string;
  properties?: { name: string };
}

interface Payment {
  id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  payment_date: string;
  method: string;
  status: string;
  tenants?: { full_name: string; unit_number: string | null };
  properties?: { name: string };
}

interface AdminViewProps {
  landlords: Landlord[];
}

type Tab = "accounts" | "properties" | "tenants" | "payments";

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  overflow: "hidden" as const,
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 1rem",
  border: "1px solid var(--warm)",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  color: "var(--ink)",
  outline: "none",
  background: "var(--white)",
} as const;

const labelStyle = {
  display: "block" as const,
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

const btnStyle = {
  gap: "0.5rem",
  background: "var(--ink)",
  color: "var(--cream)",
  border: "none",
  padding: "0.75rem",
  fontSize: "0.85rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "var(--font-sans), sans-serif",
  fontWeight: 500,
} as const;

function Message({ message }: { message: { type: "success" | "error"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center"
      style={{
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        borderRadius: "4px",
        marginBottom: "1rem",
        fontSize: "0.8rem",
        background: message.type === "success" ? "var(--green-light)" : "var(--red-light)",
        color: message.type === "success" ? "var(--green)" : "var(--red-soft)",
      }}
    >
      {message.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
      {message.text}
    </div>
  );
}

export default function AdminView({ landlords: initialLandlords }: AdminViewProps) {
  const [tab, setTab] = useState<Tab>("accounts");
  const [landlords, setLandlords] = useState(initialLandlords);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Form states
  const [accountForm, setAccountForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [propertyForm, setPropertyForm] = useState({ name: "", location: "", total_units: "" });
  const [tenantForm, setTenantForm] = useState({ property_id: "", full_name: "", unit_number: "", phone: "", monthly_rent: "" });
  const [paymentForm, setPaymentForm] = useState({ tenant_id: "", property_id: "", amount: "", payment_date: "", method: "M-Pesa", status: "paid" });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProperties = useCallback(async (landlordId: string) => {
    const res = await fetch(`/api/admin/properties?landlord_id=${landlordId}`);
    const data = await res.json();
    if (data.properties) setProperties(data.properties);
  }, []);

  const fetchTenants = useCallback(async (landlordId: string) => {
    const res = await fetch(`/api/admin/tenants?landlord_id=${landlordId}`);
    const data = await res.json();
    if (data.tenants) setTenants(data.tenants);
  }, []);

  const fetchPayments = useCallback(async (landlordId: string) => {
    const res = await fetch(`/api/admin/payments?landlord_id=${landlordId}`);
    const data = await res.json();
    if (data.payments) setPayments(data.payments);
  }, []);

  useEffect(() => {
    if (selectedLandlord) {
      fetchProperties(selectedLandlord.id);
      fetchTenants(selectedLandlord.id);
      fetchPayments(selectedLandlord.id);
    }
  }, [selectedLandlord, fetchProperties, fetchTenants, fetchPayments]);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/create-landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${accountForm.full_name} created successfully` });
        setLandlords((prev) => [data.landlord, ...prev]);
        setAccountForm({ full_name: "", email: "", phone: "", password: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function createProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...propertyForm, landlord_id: selectedLandlord.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${propertyForm.name} added` });
        setProperties((prev) => [data.property, ...prev]);
        setPropertyForm({ name: "", location: "", total_units: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${tenantForm.full_name} added` });
        setTenants((prev) => [data.tenant, ...prev]);
        setTenantForm({ property_id: "", full_name: "", unit_number: "", phone: "", monthly_rent: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);

    // Auto-fill property_id from the selected tenant
    const tenant = tenants.find((t) => t.id === paymentForm.tenant_id);
    const propertyId = tenant?.property_id || paymentForm.property_id;

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...paymentForm, property_id: propertyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Payment recorded" });
        setPayments((prev) => [data.payment, ...prev]);
        setPaymentForm({ tenant_id: "", property_id: "", amount: "", payment_date: "", method: "M-Pesa", status: "paid" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "accounts", label: "Accounts", icon: Users },
    { key: "properties", label: "Properties", icon: Home },
    { key: "tenants", label: "Tenants", icon: Users },
    { key: "payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
          Admin
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Manage landlord accounts, properties, tenants, and payments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--warm)", paddingBottom: "0" }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setMessage(null); }}
              className="flex items-center"
              style={{
                gap: "0.4rem",
                padding: "0.7rem 1.2rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-sans), sans-serif",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                color: isActive ? "var(--ink)" : "var(--muted)",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Landlord selector — shown on properties/tenants/payments tabs */}
      {tab !== "accounts" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Select Landlord</label>
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <select
              value={selectedLandlord?.id || ""}
              onChange={(e) => {
                const l = landlords.find((l) => l.id === e.target.value) || null;
                setSelectedLandlord(l);
                setProperties([]);
                setTenants([]);
                setPayments([]);
                setMessage(null);
              }}
              style={{ ...inputStyle, paddingRight: "2rem", appearance: "none" }}
            >
              <option value="">— Choose a landlord —</option>
              {landlords.map((l) => (
                <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          </div>
        </div>
      )}

      {/* === ACCOUNTS TAB === */}
      {tab === "accounts" && (
        <div className="occupancy-grid">
          {/* Create form */}
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <UserPlus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Create Landlord Account</h3>
            </div>
            <form onSubmit={createAccount} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" required value={accountForm.full_name} onChange={(e) => setAccountForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Margaret Wanjiku" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Email *</label>
                <input type="email" required value={accountForm.email} onChange={(e) => setAccountForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. margaret@email.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={accountForm.phone} onChange={(e) => setAccountForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +254 712 345 678" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Temporary Password *</label>
                <input type="text" required value={accountForm.password} onChange={(e) => setAccountForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" minLength={8} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                <UserPlus size={16} />
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Landlord list */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Landlords</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {landlords.length} total
              </span>
            </div>
            <div>
              {landlords.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No landlords yet</span>
                </div>
              ) : (
                landlords.map((l, i) => (
                  <div key={l.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < landlords.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{l.full_name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {l.email}{l.phone ? ` · ${l.phone}` : ""}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                        {new Date(l.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PROPERTIES TAB === */}
      {tab === "properties" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Add Property</h3>
            </div>
            <form onSubmit={createProperty} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property Name *</label>
                <input type="text" required value={propertyForm.name} onChange={(e) => setPropertyForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Elbros Business Park" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Location</label>
                <input type="text" value={propertyForm.location} onChange={(e) => setPropertyForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Near Royalton, Eldoret" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Total Units *</label>
                <input type="number" required min={1} value={propertyForm.total_units} onChange={(e) => setPropertyForm((f) => ({ ...f, total_units: e.target.value }))} placeholder="e.g. 18" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                <Building2 size={16} />
                {loading ? "Adding..." : "Add Property"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Home size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Properties</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {properties.length} total
              </span>
            </div>
            <div>
              {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Home size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No properties yet</span>
                </div>
              ) : (
                properties.map((p, i) => (
                  <div key={p.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < properties.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{p.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{p.location || "No location"}</span>
                      </div>
                      <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{p.total_units} units</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TENANTS TAB === */}
      {tab === "tenants" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Add Tenant</h3>
            </div>
            <form onSubmit={createTenant} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              {properties.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Add properties first before adding tenants.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Property *</label>
                    <select required value={tenantForm.property_id} onChange={(e) => setTenantForm((f) => ({ ...f, property_id: e.target.value }))} style={inputStyle}>
                      <option value="">— Select property —</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" required value={tenantForm.full_name} onChange={(e) => setTenantForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. James Waweru" style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Unit Number</label>
                      <input type="text" value={tenantForm.unit_number} onChange={(e) => setTenantForm((f) => ({ ...f, unit_number: e.target.value }))} placeholder="e.g. A4" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Monthly Rent (KES) *</label>
                      <input type="number" required min={1} value={tenantForm.monthly_rent} onChange={(e) => setTenantForm((f) => ({ ...f, monthly_rent: e.target.value }))} placeholder="e.g. 12500" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" value={tenantForm.phone} onChange={(e) => setTenantForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +254 712 345 678" style={inputStyle} />
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                    <UserPlus size={16} />
                    {loading ? "Adding..." : "Add Tenant"}
                  </button>
                </>
              )}
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tenants</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {tenants.length} total
              </span>
            </div>
            <div>
              {tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No tenants yet</span>
                </div>
              ) : (
                tenants.map((t, i) => (
                  <div key={t.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < tenants.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{t.full_name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {t.properties?.name || "—"} · Unit {t.unit_number || "—"}
                          {t.phone ? ` · ${t.phone}` : ""}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          KES {Number(t.monthly_rent).toLocaleString()}
                        </span>
                        <small className="block" style={{ fontSize: "0.65rem", color: t.is_active ? "var(--green)" : "var(--rust)" }}>
                          {t.is_active ? "Active" : "Inactive"}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PAYMENTS TAB === */}
      {tab === "payments" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Record Payment</h3>
            </div>
            <form onSubmit={createPayment} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              {tenants.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Add tenants first before recording payments.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Tenant *</label>
                    <select
                      required
                      value={paymentForm.tenant_id}
                      onChange={(e) => {
                        const tenant = tenants.find((t) => t.id === e.target.value);
                        setPaymentForm((f) => ({
                          ...f,
                          tenant_id: e.target.value,
                          property_id: tenant?.property_id || "",
                          amount: tenant ? String(tenant.monthly_rent) : f.amount,
                        }));
                      }}
                      style={inputStyle}
                    >
                      <option value="">— Select tenant —</option>
                      {tenants.filter((t) => t.is_active).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} — {t.properties?.name || ""} Unit {t.unit_number || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Amount (KES) *</label>
                      <input type="number" required min={1} value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 12500" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Payment Date *</label>
                      <input type="date" required value={paymentForm.payment_date} onChange={(e) => setPaymentForm((f) => ({ ...f, payment_date: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Method *</label>
                      <select value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} style={inputStyle}>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Status *</label>
                      <select value={paymentForm.status} onChange={(e) => setPaymentForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                    <CreditCard size={16} />
                    {loading ? "Recording..." : "Record Payment"}
                  </button>
                </>
              )}
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <CreditCard size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Payments</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {payments.length} total
              </span>
            </div>
            <div>
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <CreditCard size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No payments yet</span>
                </div>
              ) : (
                payments.map((p, i) => (
                  <div key={p.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < payments.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                          {p.method} · {p.tenants?.full_name || "—"}
                        </h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {p.properties?.name || "—"} · {new Date(p.payment_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600, color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--rust)" : "var(--ink)" }}>
                          KES {Number(p.amount).toLocaleString()}
                        </span>
                        <small
                          className="block status-pill"
                          style={{
                            fontSize: "0.55rem",
                            marginTop: "0.2rem",
                            display: "inline-block",
                            background: p.status === "paid" ? "var(--green-light)" : p.status === "overdue" ? "var(--red-light)" : "var(--amber-light)",
                            color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--red-soft)" : "var(--gold)",
                          }}
                        >
                          {p.status}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prompt to select landlord */}
      {tab !== "accounts" && !selectedLandlord && (
        <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
          <Users size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <span style={{ fontSize: "0.95rem" }}>Select a landlord above to manage their data</span>
        </div>
      )}
    </>
  );
}
