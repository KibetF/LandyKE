"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppShareButtonProps {
  month: string;
}

export default function WhatsAppShareButton({ month }: WhatsAppShareButtonProps) {
  function handleShare() {
    const message = encodeURIComponent(
      `Hi! Here's my property report for ${month} from LandyKE. I've attached the PDF report for your review.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center"
      title="Share via WhatsApp"
      style={{
        gap: "0.4rem",
        background: "#25D366",
        color: "#ffffff",
        border: "none",
        padding: "0.6rem 1rem",
        fontSize: "0.8rem",
        borderRadius: "4px",
        cursor: "pointer",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <MessageCircle size={14} />
      WhatsApp
    </button>
  );
}
