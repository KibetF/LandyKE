"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Lock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  paymentAlerts: boolean;
  maintenanceUpdates: boolean;
  monthlyReports: boolean;
}

interface SettingsViewProps {
  landlord: {
    full_name: string;
    email: string;
    phone: string | null;
    notification_preferences: NotificationPreferences;
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
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(landlord.full_name);
  const [phone, setPhone] = useState(landlord.phone || "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [notifications, setNotifications] = useState<NotificationPreferences>(
    landlord.notification_preferences
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function handleProfileSave() {
    setSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone: phone || null }),
      });
      if (res.ok) {
        setProfileMsg("Profile updated");
        setEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        setProfileMsg(data.error || "Failed to save");
      }
    } catch {
      setProfileMsg("Failed to save");
    }
    setSaving(false);
  }

  async function toggleNotification(key: keyof NotificationPreferences) {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_preferences: updated }),
    });
  }

  async function handlePasswordChange() {
    setPasswordMsg("");
    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const supabase = createClient();
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: landlord.email,
        password: currentPassword,
      });
      if (signInError) {
        setPasswordMsg("Current password is incorrect");
        setPasswordSaving(false);
        return;
      }
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg(error.message);
      } else {
        setPasswordMsg("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg("Failed to update password");
    }
    setPasswordSaving(false);
  }

  function handleDeleteAccount() {
    window.confirm(
      "To delete your account and all associated data, please contact support at support@landyke.co.ke"
    );
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
              onClick={() => {
                if (editing) {
                  handleProfileSave();
                } else {
                  setEditing(true);
                }
              }}
              disabled={saving}
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
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : editing ? "Save" : "Edit"}
            </button>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {profileMsg && (
              <span style={{ fontSize: "0.75rem", color: profileMsg.includes("updated") ? "var(--green)" : "var(--rust)" }}>
                {profileMsg}
              </span>
            )}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                value={landlord.email}
                readOnly
                style={{
                  ...inputStyle,
                  background: "var(--cream)",
                  cursor: "default",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            {passwordMsg && (
              <span style={{ fontSize: "0.75rem", color: passwordMsg.includes("successfully") ? "var(--green)" : "var(--rust)" }}>
                {passwordMsg}
              </span>
            )}
            <div>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving}
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
                opacity: passwordSaving ? 0.6 : 1,
              }}
            >
              {passwordSaving ? "Updating..." : "Update Password"}
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
              onClick={handleDeleteAccount}
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
