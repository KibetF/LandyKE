"use client";

import { useState } from "react";
import { User, Bell, Lock, AlertTriangle } from "lucide-react";

interface SettingsViewProps {
  landlord: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  overflow: "hidden",
} as const;

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--warm)",
  borderRadius: "6px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  background: "var(--cream)",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.2s",
} as const;

const labelStyle = {
  fontSize: "0.65rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
  display: "block",
};

export default function SettingsView({ landlord }: SettingsViewProps) {
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    paymentAlerts: true,
    maintenanceUpdates: true,
    monthlyReports: false,
  });

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
          Settings
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div style={cardStyle}>
          <div
            className="flex justify-between items-center"
            style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}
          >
            <div className="flex items-center" style={{ gap: "0.5rem" }}>
              <User size={16} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Profile</h3>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: "none",
                border: "1px solid var(--warm)",
                padding: "0.4rem 1rem",
                fontSize: "0.7rem",
                color: "var(--gold)",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-sans), sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {editing ? "Save" : "Edit"}
            </button>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                defaultValue={landlord.full_name}
                readOnly={!editing}
                style={{
                  ...inputStyle,
                  background: editing ? "var(--white)" : "var(--cream)",
                  cursor: editing ? "text" : "default",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                defaultValue={landlord.email}
                readOnly={!editing}
                style={{
                  ...inputStyle,
                  background: editing ? "var(--white)" : "var(--cream)",
                  cursor: editing ? "text" : "default",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                defaultValue={landlord.phone || ""}
                placeholder="+254 7XX XXX XXX"
                readOnly={!editing}
                style={{
                  ...inputStyle,
                  background: editing ? "var(--white)" : "var(--cream)",
                  cursor: editing ? "text" : "default",
                }}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={cardStyle}>
          <div
            className="flex items-center"
            style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}
          >
            <Bell size={16} style={{ color: "var(--gold)" }} />
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Notifications</h3>
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            {[
              { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email" },
              { key: "sms" as const, label: "SMS Notifications", desc: "Receive SMS alerts" },
              { key: "paymentAlerts" as const, label: "Payment Alerts", desc: "Get notified when payments are received" },
              { key: "maintenanceUpdates" as const, label: "Maintenance Updates", desc: "Updates on maintenance requests" },
              { key: "monthlyReports" as const, label: "Monthly Reports", desc: "Receive monthly summary reports" },
            ].map((item, i, arr) => (
              <div
                key={item.key}
                className="flex justify-between items-center"
                style={{
                  padding: "0.8rem 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--warm)" : "none",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500, display: "block" }}>{item.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{item.desc}</span>
                </div>
                <button
                  className={`toggle-switch ${notifications[item.key] ? "active" : ""}`}
                  onClick={() => toggleNotification(item.key)}
                  aria-label={`Toggle ${item.label}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div style={cardStyle}>
          <div
            className="flex items-center"
            style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}
          >
            <Lock size={16} style={{ color: "var(--gold)" }} />
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Change Password</h3>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input type="password" placeholder="Enter current password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Enter new password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" style={inputStyle} />
            </div>
            <button
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                border: "none",
                padding: "0.7rem 1.5rem",
                fontSize: "0.8rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-sans), sans-serif",
                alignSelf: "flex-start",
              }}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...cardStyle, borderColor: "rgba(139,58,42,0.15)" }}>
          <div
            className="flex items-center"
            style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(139,58,42,0.15)", gap: "0.5rem" }}
          >
            <AlertTriangle size={16} style={{ color: "var(--rust)" }} />
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--rust)" }}>
              Danger Zone
            </h3>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
              Once you delete your account, there is no going back. All your data, properties, and tenant records will be permanently removed.
            </p>
            <button
              style={{
                background: "none",
                color: "var(--rust)",
                border: "1px solid var(--rust)",
                padding: "0.6rem 1.2rem",
                fontSize: "0.8rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-sans), sans-serif",
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
