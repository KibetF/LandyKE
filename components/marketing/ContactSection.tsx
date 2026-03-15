import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    Icon: MapPin,
    label: "Office",
    value: "Eldoret, Uasin Gishu County, Kenya",
  },
  {
    Icon: Phone,
    label: "Phone",
    value: "+254 700 000 000",
  },
  {
    Icon: Mail,
    label: "Email",
    value: "hello@landyke.co.ke",
  },
  {
    Icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 8:00 AM – 5:00 PM EAT",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="marketing-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "start",
        }}
        className="contact-grid"
      >
        {/* Left — Info */}
        <div>
          <div
            className="section-tag flex items-center uppercase"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              color: "var(--gold)",
              fontWeight: 500,
              marginBottom: "1rem",
              gap: "0.6rem",
            }}
          >
            Get In Touch
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Let&apos;s discuss your{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              property
            </em>
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--muted)",
              lineHeight: 1.8,
              fontWeight: 300,
              marginBottom: "2.5rem",
              maxWidth: "440px",
            }}
          >
            Whether you have a single unit or a multi-property portfolio, we'd
            love to hear from you. Reach out and we'll schedule a no-obligation
            consultation.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {contactInfo.map((c) => (
              <div
                key={c.label}
                className="flex items-start"
                style={{ gap: "1rem" }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "var(--white)",
                  }}
                >
                  <c.Icon size={18} color="var(--gold)" strokeWidth={1.5} />
                </div>
                <div>
                  <span
                    className="block uppercase"
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      color: "var(--muted)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {c.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--ink)",
                      fontWeight: 400,
                    }}
                  >
                    {c.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "12px",
            padding: "2.5rem",
          }}
        >
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.2rem",
              }}
              className="form-row"
            >
              <div>
                <label
                  className="block uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Kamau"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    border: "1px solid var(--warm)",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans), sans-serif",
                    background: "var(--cream)",
                    color: "var(--ink)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              <div>
                <label
                  className="block uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    border: "1px solid var(--warm)",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans), sans-serif",
                    background: "var(--cream)",
                    color: "var(--ink)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block uppercase"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-sans), sans-serif",
                  background: "var(--cream)",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            <div>
              <label
                className="block uppercase"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Property Location
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-sans), sans-serif",
                  background: "var(--cream)",
                  color: "var(--muted)",
                  outline: "none",
                  transition: "border-color 0.2s",
                  appearance: "none",
                }}
              >
                <option value="">Select a city</option>
                <option value="nairobi">Nairobi</option>
                <option value="eldoret">Eldoret</option>
                <option value="kisumu">Kisumu</option>
                <option value="mombasa">Mombasa</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                className="block uppercase"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your property — type, number of units, current situation..."
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-sans), sans-serif",
                  background: "var(--cream)",
                  color: "var(--ink)",
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            <button
              type="submit"
              className="uppercase"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                padding: "1rem 2rem",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.25s",
                marginTop: "0.5rem",
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
