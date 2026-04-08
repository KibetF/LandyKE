"use client";

import { useState, useEffect, useCallback } from "react";
import { Wifi, Building2, Users, Check, AlertCircle, Plus, X } from "lucide-react";

interface WifiPlan {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
  sort_order: number;
  is_active: boolean;
}

interface PropertyWifiPlan {
  id: string;
  property_id: string;
  wifi_plan_id: string;
  price: number;
  is_available: boolean;
  wifi_plans?: WifiPlan;
}

interface WifiSubscription {
  id: string;
  tenant_id: string;
  property_wifi_plan_id: string;
  status: "active" | "suspended" | "cancelled";
  started_at: string;
  ended_at: string | null;
  property_wifi_plans?: PropertyWifiPlan & { wifi_plans?: WifiPlan };
  tenants?: { full_name: string; unit_number: string | null; property_id: string; properties?: { name: string } };
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
  property_id: string;
  unit_number: string | null;
  status: string;
  properties?: { name: string };
}

interface WifiManagementProps {
  properties: Property[];
  tenants: Tenant[];
  selectedLandlordId: string;
}

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

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(45,106,79,0.1)", color: "var(--green)" },
  suspended: { bg: "var(--amber-light)", color: "var(--gold)" },
  cancelled: { bg: "rgba(139,58,42,0.1)", color: "var(--rust)" },
};

export default function WifiManagement({ properties, tenants, selectedLandlordId }: WifiManagementProps) {
  const [wifiPlans, setWifiPlans] = useState<WifiPlan[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [propertyPlans, setPropertyPlans] = useState<PropertyWifiPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<WifiSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Price inputs for property config
  const [planPrices, setPlanPrices] = useState<Record<string, string>>({});
  const [planEnabled, setPlanEnabled] = useState<Record<string, boolean>>({});

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTenantId, setAssignTenantId] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");

  const fetchWifiPlans = useCallback(async () => {
    const res = await fetch("/api/admin/wifi-plans");
    const data = await res.json();
    if (data.plans) setWifiPlans(data.plans);
  }, []);

  const fetchPropertyPlans = useCallback(async (propertyId: string) => {
    const res = await fetch(`/api/admin/property-wifi?property_id=${propertyId}`);
    const data = await res.json();
    if (data.plans) {
      setPropertyPlans(data.plans);
      // Init form state
      const prices: Record<string, string> = {};
      const enabled: Record<string, boolean> = {};
      data.plans.forEach((pp: PropertyWifiPlan) => {
        prices[pp.wifi_plan_id] = String(pp.price);
        enabled[pp.wifi_plan_id] = pp.is_available;
      });
      setPlanPrices(prices);
      setPlanEnabled(enabled);
    }
  }, []);

  const fetchSubscriptions = useCallback(async (propertyId: string) => {
    const res = await fetch(`/api/admin/wifi-subscriptions?property_id=${propertyId}`);
    const data = await res.json();
    if (data.subscriptions) setSubscriptions(data.subscriptions);
  }, []);

  useEffect(() => {
    fetchWifiPlans();
  }, [fetchWifiPlans]);

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyPlans(selectedProperty);
      fetchSubscriptions(selectedProperty);
    } else {
      setPropertyPlans([]);
      setSubscriptions([]);
      setPlanPrices({});
      setPlanEnabled({});
    }
  }, [selectedProperty, fetchPropertyPlans, fetchSubscriptions]);

  async function savePropertyPlan(plan: WifiPlan) {
    setLoading(true);
    setMessage(null);
    const price = planPrices[plan.id] || String(plan.default_price);
    const isEnabled = planEnabled[plan.id] ?? true;

    const existing = propertyPlans.find((pp) => pp.wifi_plan_id === plan.id);

    if (existing) {
      // Update
      const res = await fetch("/api/admin/property-wifi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existing.id, price: Number(price), is_available: isEnabled }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `${plan.name} plan updated` });
        fetchPropertyPlans(selectedProperty);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update" });
      }
    } else {
      // Create
      const res = await fetch("/api/admin/property-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: selectedProperty, wifi_plan_id: plan.id, price: Number(price) }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `${plan.name} plan enabled` });
        fetchPropertyPlans(selectedProperty);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to enable" });
      }
    }
    setLoading(false);
  }

  async function assignWifiPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTenantId || !assignPlanId) return;

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/wifi-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: assignTenantId,
        property_wifi_plan_id: assignPlanId,
        create_payment: true,
        landlord_id: selectedLandlordId,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "WiFi plan assigned successfully" });
      setAssignModalOpen(false);
      setAssignTenantId("");
      setAssignPlanId("");
      fetchSubscriptions(selectedProperty);
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error || "Failed to assign" });
    }
    setLoading(false);
  }

  async function updateSubscriptionStatus(subscriptionId: string, status: string) {
    setLoading(true);
    const res = await fetch("/api/admin/wifi-subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id: subscriptionId, status }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: `Subscription ${status}` });
      fetchSubscriptions(selectedProperty);
    } else {
      setMessage({ type: "error", text: "Failed to update subscription" });
    }
    setLoading(false);
  }

  const propertyTenants = tenants.filter(
    (t) => t.property_id === selectedProperty && t.status === "active"
  );
  const availablePlans = propertyPlans.filter((pp) => pp.is_available);

  return (
    <div>
      {/* Property selector */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Select Property</label>
        <select
          value={selectedProperty}
          onChange={(e) => { setSelectedProperty(e.target.value); setMessage(null); }}
          style={{ ...inputStyle, maxWidth: "400px" }}
        >
          <option value="">— Select property —</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.location || "No location"}</option>
          ))}
        </select>
      </div>

      {message && (
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
      )}

      {!selectedProperty ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
          <Building2 size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <span style={{ fontSize: "0.95rem" }}>Select a property to manage WiFi plans</span>
        </div>
      ) : (
        <div className="occupancy-grid">
          {/* WiFi Plans Config */}
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Wifi size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>WiFi Plans</h3>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1.2rem" }}>
                Configure which WiFi plans are available at this property and set their prices.
              </p>
              {wifiPlans.map((plan) => {
                const existing = propertyPlans.find((pp) => pp.wifi_plan_id === plan.id);
                const isEnabled = planEnabled[plan.id] ?? !!existing;
                return (
                  <div
                    key={plan.id}
                    style={{
                      padding: "1rem",
                      borderRadius: "6px",
                      border: "1px solid var(--warm)",
                      marginBottom: "0.75rem",
                      background: isEnabled ? "var(--white)" : "#fafaf8",
                      opacity: isEnabled ? 1 : 0.7,
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: "0.5rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 600 }}>{plan.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{plan.description}</span>
                      </div>
                      <label className="flex items-center" style={{ gap: "0.4rem", cursor: "pointer", fontSize: "0.75rem", color: "var(--muted)" }}>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => setPlanEnabled((prev) => ({ ...prev, [plan.id]: e.target.checked }))}
                          style={{ accentColor: "var(--gold)" }}
                        />
                        Enabled
                      </label>
                    </div>
                    <div className="flex items-center" style={{ gap: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>Price (KES/mo)</label>
                        <input
                          type="number"
                          min={0}
                          value={planPrices[plan.id] ?? String(plan.default_price)}
                          onChange={(e) => setPlanPrices((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                          style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                        />
                      </div>
                      <button
                        onClick={() => savePropertyPlan(plan)}
                        disabled={loading}
                        className="flex items-center"
                        style={{
                          ...btnStyle,
                          padding: "0.5rem 1rem",
                          fontSize: "0.78rem",
                          marginTop: "1rem",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {existing ? "Update" : "Enable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subscriptions */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Subscriptions</h3>
              </div>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                  {subscriptions.filter((s) => s.status === "active").length} active
                </span>
                {availablePlans.length > 0 && (
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="flex items-center"
                    style={{ ...btnStyle, padding: "0.4rem 0.75rem", fontSize: "0.75rem", gap: "0.3rem" }}
                  >
                    <Plus size={13} /> Assign
                  </button>
                )}
              </div>
            </div>
            <div>
              {subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Wifi size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No WiFi subscriptions yet</span>
                  {availablePlans.length === 0 && (
                    <span style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}>Enable WiFi plans first</span>
                  )}
                </div>
              ) : (
                subscriptions.map((sub, i) => {
                  const colors = statusColors[sub.status] || statusColors.active;
                  return (
                    <div
                      key={sub.id}
                      className="row-hover"
                      style={{ padding: "1rem 1.5rem", borderBottom: i < subscriptions.length - 1 ? "1px solid var(--warm)" : "none" }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                            {sub.tenants?.full_name || "—"}
                            {sub.tenants?.unit_number ? ` · Unit ${sub.tenants.unit_number}` : ""}
                          </h4>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                            {sub.property_wifi_plans?.wifi_plans?.name || "—"} plan · KES {Number(sub.property_wifi_plans?.price || 0).toLocaleString()}/mo
                            · Since {new Date(sub.started_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center" style={{ gap: "0.5rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              background: colors.bg,
                              color: colors.color,
                            }}
                          >
                            {sub.status}
                          </span>
                          {sub.status === "active" && (
                            <>
                              <button
                                onClick={() => updateSubscriptionStatus(sub.id, "suspended")}
                                disabled={loading}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  fontSize: "0.7rem", color: "var(--gold)", fontFamily: "var(--font-sans), sans-serif",
                                }}
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => updateSubscriptionStatus(sub.id, "cancelled")}
                                disabled={loading}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  fontSize: "0.7rem", color: "var(--rust)", fontFamily: "var(--font-sans), sans-serif",
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {sub.status === "suspended" && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, "active")}
                              disabled={loading}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: "0.7rem", color: "var(--green)", fontFamily: "var(--font-sans), sans-serif",
                              }}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setAssignModalOpen(false)}
        >
          <div
            style={{
              background: "var(--white)", borderRadius: "8px", padding: "1.5rem",
              width: "calc(100% - 2rem)", maxWidth: "420px", margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Assign WiFi Plan</h3>
              <button onClick={() => setAssignModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={assignWifiPlan}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Tenant *</label>
                <select
                  required
                  value={assignTenantId}
                  onChange={(e) => setAssignTenantId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Select tenant —</option>
                  {propertyTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}{t.unit_number ? ` · Unit ${t.unit_number}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>WiFi Plan *</label>
                <select
                  required
                  value={assignPlanId}
                  onChange={(e) => setAssignPlanId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Select plan —</option>
                  {availablePlans.map((pp) => (
                    <option key={pp.id} value={pp.id}>
                      {pp.wifi_plans?.name} — KES {Number(pp.price).toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "1rem" }}>
                A pending WiFi payment will be created automatically.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center"
                style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}
              >
                <Wifi size={16} />
                {loading ? "Assigning..." : "Assign Plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
