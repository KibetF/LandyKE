"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Users, Check, AlertCircle, Home, CreditCard,
  Building2, Plus, ChevronDown, Pencil, Trash2, X,
  LayoutDashboard, FileText, Send,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  email: string | null;
  phone: string | null;
  rent_amount: number;
  status: string;
  property_id: string;
  landlord_id: string;
  unit_number: string | null;
  unit_type: string | null;
  properties?: { name: string };
}

interface Payment {
  id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  paid_date: string | null;
  due_date: string | null;
  notes: string | null;
  status: string;
  tenants?: { full_name: string; property_id: string; properties?: { name: string } };
}

interface AdminViewProps {
  landlords: Landlord[];
}

type Tab = "overview" | "accounts" | "properties" | "tenants" | "payments";

interface OverviewProperty {
  id: string;
  name: string;
  location: string | null;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  tenantsPaid: number;
  totalTenants: number;
  collected: number;
  expected: number;
}

interface LandlordOverview {
  id: string;
  name: string;
  email: string;
  totalProperties: number;
  totalUnits: number;
  activeTenants: number;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  properties: OverviewProperty[];
}

interface OverviewData {
  totals: {
    landlords: number;
    properties: number;
    units: number;
    activeTenants: number;
    collected: number;
    occupancyRate: number;
  };
  landlordOverviews: LandlordOverview[];
  incomeChart: { month: string; collected: number; expected: number }[];
  currentMonth: string;
}

const UNIT_TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "Bedsitter", "Shop", "Office"];

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

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "var(--white)",
  borderRadius: "8px",
  padding: "1.5rem",
  width: "100%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
};

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
  const [tab, setTab] = useState<Tab>("overview");
  const [landlords, setLandlords] = useState(initialLandlords);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);

  // Overview state
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [expandedLandlord, setExpandedLandlord] = useState<string | null>(null);

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Form states
  const [accountForm, setAccountForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [propertyForm, setPropertyForm] = useState({ name: "", location: "", total_units: "" });
  const [tenantForm, setTenantForm] = useState({ property_id: "", full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "" });
  const [paymentForm, setPaymentForm] = useState({ tenant_id: "", amount: "", paid_date: "", due_date: "", notes: "M-Pesa", status: "paid" });

  // Edit modals
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Edit form states
  const [editPropertyForm, setEditPropertyForm] = useState({ name: "", location: "", total_units: "" });
  const [editTenantForm, setEditTenantForm] = useState({ full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "", property_id: "", status: "" });
  const [editPaymentForm, setEditPaymentForm] = useState({ amount: "", paid_date: "", due_date: "", notes: "", status: "" });

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

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (res.ok) setOverviewData(data);
    } catch { /* ignore */ }
    setOverviewLoading(false);
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  function sendWhatsAppReport(landlord: LandlordOverview) {
    const month = new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" });
    let msg = `*LandyKE Report — ${month}*\n\n`;
    msg += `Hi ${landlord.name.split(" ")[0]},\n\n`;
    msg += `*Summary:*\n`;
    msg += `Properties: ${landlord.totalProperties}\n`;
    msg += `Active Tenants: ${landlord.activeTenants}\n`;
    msg += `Collected: KES ${landlord.totalCollected.toLocaleString()}\n`;
    msg += `Expected: KES ${landlord.totalExpected.toLocaleString()}\n`;
    msg += `Collection Rate: ${landlord.collectionRate}%\n\n`;
    msg += `*Property Breakdown:*\n`;
    landlord.properties.forEach((p) => {
      msg += `\n_${p.name}_\n`;
      msg += `${p.occupiedUnits}/${p.totalUnits} occupied (${p.occupancyRate}%)\n`;
      msg += `${p.tenantsPaid}/${p.totalTenants} paid · KES ${p.collected.toLocaleString()}\n`;
    });
    msg += `\n— LandyKE`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // === CREATE HANDLERS ===

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
        body: JSON.stringify({ ...tenantForm, landlord_id: selectedLandlord.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${tenantForm.full_name} added` });
        setTenants((prev) => [data.tenant, ...prev]);
        setTenantForm({ property_id: "", full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "" });
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
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...paymentForm, landlord_id: selectedLandlord.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Payment recorded" });
        setPayments((prev) => [data.payment, ...prev]);
        setPaymentForm({ tenant_id: "", amount: "", paid_date: "", due_date: "", notes: "M-Pesa", status: "paid" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === UPDATE HANDLERS ===

  async function updateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProperty) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: editingProperty.id, ...editPropertyForm, total_units: Number(editPropertyForm.total_units) }),
      });
      const data = await res.json();
      if (res.ok) {
        setProperties((prev) => prev.map((p) => p.id === editingProperty.id ? data.property : p));
        setEditingProperty(null);
        setMessage({ type: "success", text: "Property updated" });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function updateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTenant) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: editingTenant.id, ...editTenantForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setTenants((prev) => prev.map((t) => t.id === editingTenant.id ? data.tenant : t));
        setEditingTenant(null);
        setMessage({ type: "success", text: "Tenant updated" });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function updatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPayment) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: editingPayment.id,
          status: editPaymentForm.status,
          paid_date: editPaymentForm.paid_date || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayments((prev) => prev.map((p) => p.id === editingPayment.id ? data.payment : p));
        setEditingPayment(null);
        setMessage({ type: "success", text: "Payment updated" });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === DELETE HANDLERS ===

  async function deleteProperty(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This will also delete all tenants and payments linked to this property.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: id }),
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: `${name} deleted` });
        if (selectedLandlord) {
          fetchTenants(selectedLandlord.id);
          fetchPayments(selectedLandlord.id);
        }
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteTenant(id: string, name: string) {
    if (!window.confirm(`Delete tenant "${name}"? This will also delete their payment records.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: id }),
      });
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== id));
        setMessage({ type: "success", text: `${name} deleted` });
        if (selectedLandlord) fetchPayments(selectedLandlord.id);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function deletePayment(id: string) {
    if (!window.confirm("Delete this payment record?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id }),
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: "Payment deleted" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === OPEN EDIT MODALS ===

  function openEditProperty(p: Property) {
    setEditPropertyForm({ name: p.name, location: p.location || "", total_units: String(p.total_units) });
    setEditingProperty(p);
  }

  function openEditTenant(t: Tenant) {
    setEditTenantForm({
      full_name: t.full_name,
      email: t.email || "",
      phone: t.phone || "",
      rent_amount: String(t.rent_amount),
      unit_number: t.unit_number || "",
      unit_type: t.unit_type || "",
      property_id: t.property_id,
      status: t.status,
    });
    setEditingTenant(t);
  }

  function openEditPayment(p: Payment) {
    setEditPaymentForm({
      amount: String(p.amount),
      paid_date: p.paid_date || "",
      due_date: p.due_date || "",
      notes: p.notes || "",
      status: p.status,
    });
    setEditingPayment(p);
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "accounts", label: "Accounts", icon: Users },
    { key: "properties", label: "Properties", icon: Home },
    { key: "tenants", label: "Tenants", icon: Users },
    { key: "payments", label: "Payments", icon: CreditCard },
  ];

  const actionBtnStyle = (color: string): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.3rem",
    borderRadius: "4px",
    color,
    display: "flex",
    alignItems: "center",
  });

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

      {/* === OVERVIEW TAB === */}
      {tab === "overview" && (
        overviewLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
            <LayoutDashboard size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
            <span style={{ fontSize: "0.95rem" }}>Loading overview...</span>
          </div>
        ) : overviewData ? (
          <>
            {/* Global KPIs */}
            <div className="reports-kpi-grid" style={{ marginBottom: "1.5rem" }}>
              {[
                { label: "Landlords", value: overviewData.totals.landlords, color: "var(--ink)" },
                { label: "Properties", value: overviewData.totals.properties, color: "var(--gold)" },
                { label: "Total Units", value: overviewData.totals.units, color: "#1a5296" },
                { label: "Active Tenants", value: overviewData.totals.activeTenants, color: "var(--green)" },
                { label: "Collected This Month", value: `KES ${overviewData.totals.collected.toLocaleString()}`, color: "var(--green)" },
                { label: "Occupancy Rate", value: `${overviewData.totals.occupancyRate}%`, color: "var(--gold)" },
              ].map((kpi) => (
                <div key={kpi.label} style={{ ...cardStyle, padding: "1rem 1.2rem" }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                    {kpi.label}
                  </span>
                  <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: kpi.color }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Income Chart */}
            {overviewData.incomeChart.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                  <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    Total Income — All Clients
                  </h3>
                </div>
                <div style={{ padding: "1.5rem", height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData.incomeChart} barGap={2} barCategoryGap="20%">
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#7a7468" }} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(value) => `KES ${(Number(value) / 1000).toFixed(0)}k`}
                        contentStyle={{ background: "var(--white)", border: "1px solid var(--warm)", borderRadius: "4px", fontSize: "0.75rem" }}
                      />
                      <Bar dataKey="expected" fill="#ede6d6" radius={[3, 3, 0, 0]} name="Expected" />
                      <Bar dataKey="collected" fill="#c8963e" radius={[3, 3, 0, 0]} name="Collected" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Per-landlord breakdown */}
            <div style={{ marginBottom: "0.75rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                Client Portfolios
              </h3>
            </div>

            {overviewData.landlordOverviews.map((landlord) => (
              <div key={landlord.id} style={{ ...cardStyle, marginBottom: "1rem" }}>
                {/* Landlord header */}
                <div
                  className="row-hover"
                  style={{ padding: "1rem 1.5rem", cursor: "pointer", borderBottom: expandedLandlord === landlord.id ? "1px solid var(--warm)" : "none" }}
                  onClick={() => setExpandedLandlord(expandedLandlord === landlord.id ? null : landlord.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center" style={{ gap: "0.75rem" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--gold)", color: "var(--white)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}>
                        {landlord.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.1rem" }}>{landlord.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {landlord.totalProperties} properties · {landlord.activeTenants} tenants · {landlord.totalUnits} units
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: "1rem" }}>
                      <div className="text-right" style={{ marginRight: "0.5rem" }}>
                        <span className="font-serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--green)" }}>
                          KES {landlord.totalCollected.toLocaleString()}
                        </span>
                        <span style={{ display: "block", fontSize: "0.65rem", color: "var(--muted)" }}>
                          of KES {landlord.totalExpected.toLocaleString()} · {landlord.collectionRate}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendWhatsAppReport(landlord); }}
                        className="flex items-center"
                        style={{
                          gap: "0.3rem", background: "#25D366", color: "#fff", border: "none",
                          padding: "0.4rem 0.7rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                          fontFamily: "var(--font-sans), sans-serif",
                        }}
                        title="Send report via WhatsApp"
                      >
                        <Send size={12} />
                        WhatsApp
                      </button>
                      <ChevronDown
                        size={16}
                        style={{
                          color: "var(--muted)",
                          transition: "transform 0.2s",
                          transform: expandedLandlord === landlord.id ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded property details */}
                {expandedLandlord === landlord.id && (
                  <div>
                    {landlord.properties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center" style={{ padding: "1.5rem", color: "var(--muted)" }}>
                        <Home size={24} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                        <span style={{ fontSize: "0.8rem" }}>No properties yet</span>
                      </div>
                    ) : (
                      landlord.properties.map((prop, i) => (
                        <div
                          key={prop.id}
                          style={{
                            padding: "1rem 1.5rem",
                            borderBottom: i < landlord.properties.length - 1 ? "1px solid var(--warm)" : "none",
                            background: "var(--cream)",
                          }}
                        >
                          <div className="flex justify-between items-center" style={{ marginBottom: "0.6rem" }}>
                            <div>
                              <h5 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.1rem" }}>{prop.name}</h5>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                                {prop.location || "No location"} · {prop.totalUnits} units
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600, color: prop.collected > 0 ? "var(--green)" : "var(--muted)" }}>
                                KES {prop.collected.toLocaleString()}
                              </span>
                              <span style={{ display: "block", fontSize: "0.65rem", color: "var(--muted)" }}>
                                of KES {prop.expected.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center" style={{ gap: "1.5rem" }}>
                            {/* Occupancy bar */}
                            <div style={{ flex: 1 }}>
                              <div className="flex justify-between" style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                                <span>Occupancy</span>
                                <span>{prop.occupiedUnits}/{prop.totalUnits} ({prop.occupancyRate}%)</span>
                              </div>
                              <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                <div style={{
                                  width: `${prop.occupancyRate}%`, height: "100%",
                                  background: prop.occupancyRate === 100 ? "var(--green)" : prop.occupancyRate >= 70 ? "var(--gold)" : "var(--rust)",
                                  borderRadius: "4px", transition: "width 0.5s ease",
                                }} />
                              </div>
                            </div>
                            {/* Payment status */}
                            <div style={{ minWidth: "100px" }}>
                              <div className="flex justify-between" style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                                <span>Payments</span>
                                <span>{prop.tenantsPaid}/{prop.totalTenants} paid</span>
                              </div>
                              <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                <div style={{
                                  width: prop.totalTenants > 0 ? `${Math.round((prop.tenantsPaid / prop.totalTenants) * 100)}%` : "0%",
                                  height: "100%",
                                  background: prop.tenantsPaid === prop.totalTenants && prop.totalTenants > 0 ? "var(--green)" : "var(--gold)",
                                  borderRadius: "4px",
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : null
      )}

      {/* Landlord selector */}
      {tab !== "accounts" && tab !== "overview" && (
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
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{p.total_units} units</span>
                        <button onClick={() => openEditProperty(p)} style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteProperty(p.id, p.name)} disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" required value={tenantForm.full_name} onChange={(e) => setTenantForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. James Waweru" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Unit Number</label>
                      <input type="text" value={tenantForm.unit_number} onChange={(e) => setTenantForm((f) => ({ ...f, unit_number: e.target.value }))} placeholder="e.g. A3" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Unit Type</label>
                      <select value={tenantForm.unit_type} onChange={(e) => setTenantForm((f) => ({ ...f, unit_type: e.target.value }))} style={inputStyle}>
                        <option value="">— Select type —</option>
                        {UNIT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Rent Amount (KES) *</label>
                      <input type="number" required min={1} value={tenantForm.rent_amount} onChange={(e) => setTenantForm((f) => ({ ...f, rent_amount: e.target.value }))} placeholder="e.g. 12500" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={tenantForm.email} onChange={(e) => setTenantForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. james@email.com" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input type="tel" value={tenantForm.phone} onChange={(e) => setTenantForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +254 712 345 678" style={inputStyle} />
                    </div>
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
                          {t.properties?.name || "—"}
                          {t.unit_number ? ` · Unit ${t.unit_number}` : ""}
                          {t.unit_type ? ` · ${t.unit_type}` : ""}
                          {t.phone ? ` · ${t.phone}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <div className="text-right">
                          <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                            KES {Number(t.rent_amount).toLocaleString()}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background: t.status === "active" ? "rgba(45,106,79,0.1)" : "rgba(139,58,42,0.1)",
                            color: t.status === "active" ? "var(--green)" : "var(--rust)",
                          }}
                        >
                          {t.status}
                        </span>
                        <button onClick={() => openEditTenant(t)} style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteTenant(t.id, t.full_name)} disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
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
                          amount: tenant ? String(tenant.rent_amount) : f.amount,
                        }));
                      }}
                      style={inputStyle}
                    >
                      <option value="">— Select tenant —</option>
                      {tenants.filter((t) => t.status === "active").map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} — {t.properties?.name || ""}
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
                      <label style={labelStyle}>Paid Date</label>
                      <input type="date" value={paymentForm.paid_date} onChange={(e) => setPaymentForm((f) => ({ ...f, paid_date: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Due Date</label>
                      <input type="date" value={paymentForm.due_date} onChange={(e) => setPaymentForm((f) => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
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
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={labelStyle}>Payment Method / Notes</label>
                    <select value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} style={inputStyle}>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
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
                          {p.notes || "Payment"} · {p.tenants?.full_name || "—"}
                        </h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {p.tenants?.properties?.name || "—"} · {(p.paid_date || p.due_date) ? new Date(p.paid_date || p.due_date!).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <div className="text-right">
                          <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600, color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--rust)" : "var(--ink)" }}>
                            KES {Number(p.amount).toLocaleString()}
                          </span>
                          <span
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
                          </span>
                        </div>
                        <button onClick={() => openEditPayment(p)} style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deletePayment(p.id)} disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
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
      {tab !== "accounts" && tab !== "overview" && !selectedLandlord && (
        <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
          <Users size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <span style={{ fontSize: "0.95rem" }}>Select a landlord above to manage their data</span>
        </div>
      )}

      {/* === EDIT PROPERTY MODAL === */}
      {editingProperty && (
        <div style={modalOverlayStyle} onClick={() => setEditingProperty(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Property</h3>
              <button onClick={() => setEditingProperty(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updateProperty}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property Name *</label>
                <input type="text" required value={editPropertyForm.name} onChange={(e) => setEditPropertyForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Location</label>
                <input type="text" value={editPropertyForm.location} onChange={(e) => setEditPropertyForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Total Units *</label>
                <input type="number" required min={1} value={editPropertyForm.total_units} onChange={(e) => setEditPropertyForm((f) => ({ ...f, total_units: e.target.value }))} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT TENANT MODAL === */}
      {editingTenant && (
        <div style={modalOverlayStyle} onClick={() => setEditingTenant(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Tenant</h3>
              <button onClick={() => setEditingTenant(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updateTenant}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property *</label>
                <select required value={editTenantForm.property_id} onChange={(e) => setEditTenantForm((f) => ({ ...f, property_id: e.target.value }))} style={inputStyle}>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" required value={editTenantForm.full_name} onChange={(e) => setEditTenantForm((f) => ({ ...f, full_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unit Number</label>
                  <input type="text" value={editTenantForm.unit_number} onChange={(e) => setEditTenantForm((f) => ({ ...f, unit_number: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Unit Type</label>
                  <select value={editTenantForm.unit_type} onChange={(e) => setEditTenantForm((f) => ({ ...f, unit_type: e.target.value }))} style={inputStyle}>
                    <option value="">— Select type —</option>
                    {UNIT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Rent Amount (KES) *</label>
                  <input type="number" required min={1} value={editTenantForm.rent_amount} onChange={(e) => setEditTenantForm((f) => ({ ...f, rent_amount: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={editTenantForm.email} onChange={(e) => setEditTenantForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={editTenantForm.phone} onChange={(e) => setEditTenantForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Status *</label>
                <select required value={editTenantForm.status} onChange={(e) => setEditTenantForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="moved">Moved</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT PAYMENT MODAL === */}
      {editingPayment && (
        <div style={modalOverlayStyle} onClick={() => setEditingPayment(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Payment</h3>
              <button onClick={() => setEditingPayment(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updatePayment}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Tenant</label>
                <input type="text" readOnly value={editingPayment.tenants?.full_name || "—"} style={{ ...inputStyle, background: "var(--cream)", cursor: "default" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Amount (KES)</label>
                  <input type="text" readOnly value={`KES ${Number(editPaymentForm.amount).toLocaleString()}`} style={{ ...inputStyle, background: "var(--cream)", cursor: "default" }} />
                </div>
                <div>
                  <label style={labelStyle}>Status *</label>
                  <select required value={editPaymentForm.status} onChange={(e) => setEditPaymentForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Paid Date</label>
                  <input type="date" value={editPaymentForm.paid_date} onChange={(e) => setEditPaymentForm((f) => ({ ...f, paid_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={editPaymentForm.due_date} onChange={(e) => setEditPaymentForm((f) => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
