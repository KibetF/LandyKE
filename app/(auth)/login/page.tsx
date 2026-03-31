"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorParam || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // Check role to determine redirect target
      const { data: roleData } = await supabase
        .schema("landyke")
        .from("user_roles")
        .select("role")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (roleData?.role === "caretaker") {
        router.push("/caretaker/dashboard");
      } else {
        router.push("/dashboard");
      }
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
          Client Portal
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Sign in to manage your properties
        </p>
      </div>

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
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            placeholder="margaret@example.com"
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
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center" style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Link
          href="/tenant-login"
          className="no-underline"
          style={{
            fontSize: "0.8rem",
            color: "var(--muted)",
            transition: "color 0.2s",
          }}
        >
          Are you a tenant? Sign in here
        </Link>
        <Link
          href="/"
          className="no-underline"
          style={{
            fontSize: "0.8rem",
            color: "var(--gold)",
            transition: "color 0.2s",
          }}
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
