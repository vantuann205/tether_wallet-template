"use client";

import React, { useState } from "react";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function ReceiveModal({ isOpen, onClose, walletAddress }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Generate QR Code URL dynamically using secure public QR Code generator API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    walletAddress
  )}&color=0b0b14&bgcolor=ffffff&margin=10`;

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div
        className="modal-container glass-panel"
        style={{ display: isOpen ? "block" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-section">
          <h3 className="modal-title-text">
            <i className="fa-solid fa-qrcode" style={{ color: "var(--accent-cyan)" }}></i>
            Receive Assets
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="qr-container-box">
          <div className="qr-code-img">
            {/* Standard HTML Image loading the QR Server API */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="Wallet QR Code" />
          </div>
          
          <div className="qr-address" onClick={handleCopy} title="Click to copy address">
            {walletAddress}
          </div>
          
          <span className="copy-hint" style={{ color: copied ? "var(--accent-green)" : "var(--text-muted)", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px", fontWeight: copied ? "600" : "normal" }}>
            {copied ? (
              <>
                <i className="fa-solid fa-circle-check"></i>
                Copied to clipboard!
              </>
            ) : (
              <>
                <i className="fa-solid fa-copy"></i>
                Click address to copy
              </>
            )}
          </span>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "15px", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", gap: "12px" }}>
          <i className="fa-solid fa-circle-info" style={{ color: "var(--accent-cyan)", fontSize: "1.1rem", marginTop: "2px" }}></i>
          <div>
            Send only compatible network tokens to this address. Sending unsupported assets might result in permanent loss.
          </div>
        </div>
      </div>
    </div>
  );
}
