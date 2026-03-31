"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase handles the token exchange automatically when the page loads
    // via the URL hash fragment. We just need to wait for the session.
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Check if already in a valid session from the invite link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push("/my/dashboard");
    }
  }

  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: "8px",
        boxShadow: "0 40px 80px rgba(15,14,11,0.08)",
        padding: "3rem",
        width: "100%",
        maxWidth: "420px",
        border: "1px solid rgba(200,150,62,0.1)",
      }}
    >
      <div className="text-center" style={{ marginBottom: "2rem" }}>
        <div
          className="font-serif"
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          Landy<span style={{ color: "var(--gold)" }}>Ke</span>
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: "1.6rem",
            fontWeight: 300,
            marginBottom: "0.5rem",
          }}
        >
          Set Your Password
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Create a password to access your tenant portal
        </p>
      </div>

      {!ready ? (
        <div className="text-center" style={{ padding: "2rem 0", color: "var(--muted)", fontSize: "0.85rem" }}>
          Verifying your invite link...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              className="block uppercase"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                color: "var(--muted)",
                marginBottom: "0.5rem",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              className="block uppercase"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                color: "var(--muted)",
                marginBottom: "0.5rem",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              style={{
                background: "var(--red-light)",
                color: "var(--red-soft)",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="uppercase"
            style={{
              width: "100%",
              background: "var(--ink)",
              color: "var(--cream)",
              padding: "1rem",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              border: "none",
              borderRadius: "2px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.25s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Setting password..." : "Set Password & Continue"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
      }}
    >
      <Suspense>
        <SetupPasswordForm />
      </Suspense>
    </div>
  );
}
