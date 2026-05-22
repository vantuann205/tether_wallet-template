"use client";

import React, { useState } from "react";
import Spline from "@splinetool/react-spline";

export default function BalanceCard3D() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Sleek Spatial Glassmorphic Loading Indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 10, 18, 0.55)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            borderRadius: "28px",
            zIndex: 10,
            gap: "16px",
            border: "1px solid var(--glass-border)",
            transition: "opacity 0.4s ease",
          }}
        >
          <i
            className="fa-solid fa-circle-notch fa-spin"
            style={{
              fontSize: "2.2rem",
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(0, 255, 213, 0.4))",
            }}
          ></i>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            Loading Spatial 3D Scene...
          </span>
        </div>
      )}

      {/* Spline Interactive 3D Scene Container */}
      <div style={{ width: "100%", height: "100%", borderRadius: "28px", overflow: "hidden" }}>
        <Spline
          scene="https://prod.spline.design/Z-eqCqPEf5oYIsr1/scene.splinecode"
          onLoad={() => setLoading(false)}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
