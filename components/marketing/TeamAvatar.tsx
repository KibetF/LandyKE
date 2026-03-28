"use client";

import { useState } from "react";
import Image from "next/image";

interface TeamAvatarProps {
  src: string;
  alt: string;
  initials: string;
}

export default function TeamAvatar({ src, alt, initials }: TeamAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{
        width: "96px",
        height: "96px",
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.2)",
        overflow: "hidden",
        position: "relative",
        background: "var(--gold)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="96px"
          style={{ objectFit: "cover" }}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <span
          className="font-serif"
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
