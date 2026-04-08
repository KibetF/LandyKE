"use client";

import { useState } from "react";
import { Wifi, Check, AlertCircle, Clock } from "lucide-react";

interface WifiPlan {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
  sort_order: number;
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
}

interface Props {
  subscription: WifiSubscription | null;
  availablePlans: PropertyWifiPlan[];
  tenantName: string;
}

const statusConfig = {
  active: { bg: "var(--green-light)", color: "var(--green)", label: "Active", Icon: Check },
  suspended: { bg: "var(--amber-light)", color: "var(--gold)", label: "Suspended", Icon: AlertCircle },
  cancelled: { bg: "var(--red-light)", color: "var(--red-soft)", label: "Cancelled", Icon: AlertCircle },
};

export default function TenantWifi({ subscription, availablePlans, tenantName }: Props) {
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentPlan = subscription?.property_wifi_plans?.wifi_plans;
  const currentPrice = subscription?.property_wifi_plans?.price;

  async function requestChange(planName: string) {
    setSending(true);
    setError("");
    const res = await fetch("/api/tenant/wifi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requested_plan_name: planName }),
    });
    if (res.ok) {
      setRequestSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send request");
    }
    setSending(false);
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}
        >
          WiFi Plan
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          View your internet plan and available packages
        </p>
      </div>

      {/* Current plan */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          borderTop: subscription
            ? `3px solid ${statusConfig[subscription.status]?.color || "var(--green)"}`
            : "3px solid var(--warm)",
        }}
      >
        <div className="flex items-center" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
          <Wifi size={20} style={{ color: subscription ? statusConfig[subscription.status]?.color : "var(--muted)" }} />
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: subscription ? statusConfig[subscription.status]?.color : "var(--muted)",
            }}
          >
            {subscription ? statusConfig[subscription.status]?.label : "No Plan"}
          </span>
        </div>

        {subscription && currentPlan ? (
          <>
            <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "0.25rem" }}>
              {currentPlan.name}
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1rem" }}>
              {currentPlan.description}
            </p>
            <div className="flex items-end" style={{ gap: "0.3rem" }}>
              <span className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--gold)" }}>
                KES {Number(currentPrice).toLocaleString()}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", paddingBottom: "0.15rem" }}>/month</span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.75rem" }}>
              Active since {new Date(subscription.started_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </>
        ) : (
          <div>
            <h2 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 300, color: "var(--muted)", marginBottom: "0.25rem" }}>
              No WiFi Plan
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              You don&apos;t have a WiFi plan yet. Browse the available plans below and request one.
            </p>
          </div>
        )}
      </div>

      {/* Available plans */}
      {availablePlans.length > 0 && (
        <div>
          <h3
            className="font-serif"
            style={{ fontSize: "1.1rem", fontWeight: 400, marginBottom: "1rem" }}
          >
            Available Plans
          </h3>

          {requestSent && (
            <div
              className="flex items-center"
              style={{
                gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "4px", marginBottom: "1rem",
                fontSize: "0.8rem", background: "var(--green-light)", color: "var(--green)",
              }}
            >
              <Check size={14} />
              Your change request has been sent. The admin will review it shortly.
            </div>
          )}

          {error && (
            <div
              className="flex items-center"
              style={{
                gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "4px", marginBottom: "1rem",
                fontSize: "0.8rem", background: "var(--red-light)", color: "var(--red-soft)",
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {availablePlans.map((pp) => {
              const plan = pp.wifi_plans;
              if (!plan) return null;
              const isCurrent = subscription?.property_wifi_plan_id === pp.id && subscription?.status === "active";
              return (
                <div
                  key={pp.id}
                  style={{
                    background: "var(--white)",
                    borderRadius: "8px",
                    border: isCurrent ? "2px solid var(--gold)" : "1px solid rgba(200,150,62,0.08)",
                    padding: "1.25rem",
                    position: "relative",
                  }}
                >
                  {isCurrent && (
                    <span
                      style={{
                        position: "absolute", top: "-0.5rem", right: "1rem",
                        fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.08em", background: "var(--gold)", color: "var(--white)",
                        padding: "0.2rem 0.5rem", borderRadius: "3px",
                      }}
                    >
                      Current
                    </span>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        {plan.name}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--gold)" }}>
                        KES {Number(pp.price).toLocaleString()}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "var(--muted)", display: "block" }}>/month</span>
                    </div>
                  </div>
                  {!isCurrent && !requestSent && (
                    <button
                      onClick={() => requestChange(plan.name)}
                      disabled={sending}
                      className="flex items-center"
                      style={{
                        gap: "0.4rem",
                        marginTop: "0.75rem",
                        background: "transparent",
                        border: "1px solid var(--gold)",
                        color: "var(--gold)",
                        padding: "0.5rem 1rem",
                        fontSize: "0.78rem",
                        borderRadius: "4px",
                        cursor: sending ? "default" : "pointer",
                        fontFamily: "var(--font-sans), sans-serif",
                        opacity: sending ? 0.6 : 1,
                      }}
                    >
                      <Clock size={13} />
                      {sending ? "Sending..." : "Request This Plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "1rem", fontStyle: "italic" }}>
            Plan changes are processed by your property manager. You&apos;ll be notified once approved.
          </p>
        </div>
      )}
    </div>
  );
}
