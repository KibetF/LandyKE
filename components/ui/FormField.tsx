"use client";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

export const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 1rem",
  border: "1px solid var(--warm)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  color: "var(--ink)",
  background: "var(--white)",
};

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label style={labelStyle} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function TextField({
  label,
  error,
  style,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && <FieldLabel htmlFor={rest.id}>{label}</FieldLabel>}
      <input style={{ ...fieldStyle, ...(error ? { borderColor: "var(--red-soft)" } : {}), ...style }} {...rest} />
      {error && (
        <span style={{ display: "block", marginTop: "0.3rem", fontSize: "0.72rem", color: "var(--red-soft)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export function SelectField({
  label,
  children,
  style,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <FieldLabel htmlFor={rest.id}>{label}</FieldLabel>}
      <select style={{ ...fieldStyle, ...style }} {...rest}>
        {children}
      </select>
    </div>
  );
}

export function TextAreaField({
  label,
  style,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && <FieldLabel htmlFor={rest.id}>{label}</FieldLabel>}
      <textarea style={{ ...fieldStyle, resize: "vertical", ...style }} {...rest} />
    </div>
  );
}
