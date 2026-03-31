"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from "lucide-react";

const contactInfo = [
  { Icon: MapPin, label: "Office", value: "Eldoret, Uasin Gishu County, Kenya" },
  { Icon: Phone, label: "Phone", value: "+254 700 000 000" },
  { Icon: Mail, label: "Email", value: "hello@landyke.co.ke" },
  { Icon: Clock, label: "Hours", value: "Mon \u2013 Fri, 8:00 AM \u2013 5:00 PM EAT" },
];

const fieldInputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #e5ddd0",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  background: "#fdf8f4",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
} as const;

const fieldLabelStyle = {
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  color: "var(--muted)",
  marginBottom: "0.5rem",
  fontWeight: 500,
} as const;

export default function ContactSection() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Something went wrong.");
      }

      setFormState("success");
      form.reset();
    } catch (err) {
      setFormState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="marketing-section">
      <div
        className="contact-grid"
      >
        {/* Left — Info */}
        <div>
          <div
            className="section-tag flex items-center uppercase"
            style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "var(--gold)", fontWeight: 500, marginBottom: "1rem", gap: "0.6rem" }}
          >
            Get In Touch
          </div>
          <h2
            className="font-serif"
            style={{ fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: "1.5rem" }}
          >
            Let&apos;s discuss your{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>property</em>
          </h2>
          <p
            style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.8, fontWeight: 300, marginBottom: "2.5rem", maxWidth: "440px" }}
          >
            Whether you have a single unit or a multi-property portfolio, we&apos;d
            love to hear from you. Reach out and we&apos;ll schedule a no-obligation
            consultation.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {contactInfo.map((c) => (
              <div key={c.label} className="flex items-start" style={{ gap: "1rem" }}>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(201,146,26,0.1)" }}
                >
                  <c.Icon size={18} color="var(--gold)" strokeWidth={1.5} />
                </div>
                <div>
                  <span
                    className="block uppercase"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "0.2rem" }}
                  >
                    {c.label}
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 400 }}>
                    {c.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div
          style={{ background: "var(--white)", borderRadius: "16px", padding: "2.5rem", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
        >
          {formState === "success" ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "2rem 0", textAlign: "center" }}>
              <CheckCircle size={48} style={{ color: "var(--green)", marginBottom: "1rem" }} />
              <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Message Sent!
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
                We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setFormState("idle")}
                style={{
                  background: "var(--ink)",
                  color: "var(--cream)",
                  border: "none",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.8rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans), sans-serif",
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div className="form-row" style={{ display: "grid", gap: "1.2rem" }}>
                <div>
                  <label className="block uppercase" style={fieldLabelStyle}>Full Name</label>
                  <input name="name" type="text" placeholder="John Kamau" required style={fieldInputStyle} />
                </div>
                <div>
                  <label className="block uppercase" style={fieldLabelStyle}>Phone Number</label>
                  <input name="phone" type="tel" placeholder="+254 7XX XXX XXX" style={fieldInputStyle} />
                </div>
              </div>

              <div>
                <label className="block uppercase" style={fieldLabelStyle}>Email Address</label>
                <input name="email" type="email" placeholder="john@example.com" required style={fieldInputStyle} />
              </div>

              <div>
                <label className="block uppercase" style={fieldLabelStyle}>Property Location</label>
                <select
                  name="location"
                  style={{ ...fieldInputStyle, appearance: "none", color: "var(--muted)" }}
                >
                  <option value="">Select an area</option>
                  <option value="cbd">Eldoret CBD</option>
                  <option value="pioneer">Pioneer / Elgon View</option>
                  <option value="action">Action</option>
                  <option value="langas">Langas</option>
                  <option value="sinai">Sinai</option>
                  <option value="other">Other Area</option>
                </select>
              </div>

              <div>
                <label className="block uppercase" style={fieldLabelStyle}>Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about your property \u2014 type, number of units, current situation..."
                  style={{ ...fieldInputStyle, resize: "vertical" }}
                />
              </div>

              {formState === "error" && (
                <p style={{ fontSize: "0.8rem", color: "var(--red-soft)", margin: 0 }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={formState === "loading"}
                className="contact-submit uppercase flex items-center justify-center"
                style={{
                  width: "100%",
                  background: "var(--ink)",
                  color: "var(--cream)",
                  height: "52px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  border: "none",
                  borderRadius: "4px",
                  cursor: formState === "loading" ? "wait" : "pointer",
                  transition: "background 0.25s",
                  marginTop: "0.5rem",
                  gap: "0.5rem",
                  opacity: formState === "loading" ? 0.7 : 1,
                }}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
