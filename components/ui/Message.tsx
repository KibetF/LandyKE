import { Check, AlertCircle } from "lucide-react";

export type MessageData = { type: "success" | "error"; text: string } | null;

export default function Message({ message }: { message: MessageData }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center"
      role={message.type === "error" ? "alert" : "status"}
      style={{
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-sm)",
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
