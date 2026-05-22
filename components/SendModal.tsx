"use client";

import React, { useState, useEffect } from "react";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  logoClass: string;
}

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSendSuccess: (amount: number, symbol: string, recipient: string) => void;
}

export default function SendModal({ isOpen, onClose, assets, onSendSuccess }: SendModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.symbol || "USDT");
  const [error, setError] = useState("");

  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0].symbol);
    }
  }, [assets, selectedAsset]);

  const currentAsset = assets.find((a) => a.symbol === selectedAsset);
  const maxBalance = currentAsset ? currentAsset.balance : 0;

  const handleMax = () => {
    if (currentAsset) {
      setAmount(maxBalance.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipient.trim()) {
      setError("Recipient address is required");
      return;
    }

    // Basic Crypto Address Validation (0x... or ENS)
    const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(recipient);
    const isEnsAddress = /\.eth$/.test(recipient);
    const isSolAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipient);

    if (!isHexAddress && !isEnsAddress && !isSolAddress) {
      setError("Invalid wallet address or ENS domain");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (numAmount > maxBalance) {
      setError(`Insufficient balance. Max available: ${maxBalance} ${selectedAsset}`);
      return;
    }

    // Success Callback
    onSendSuccess(numAmount, selectedAsset, recipient);
    
    // Clear Form
    setRecipient("");
    setAmount("");
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div
        className="modal-container glass-panel"
        style={{ display: isOpen ? "block" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-section">
          <h3 className="modal-title-text">
            <i className="fa-solid fa-paper-plane" style={{ color: "var(--accent-magenta)" }}></i>
            Send Assets
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Select Asset</label>
            <div className="input-container">
              <select
                className="form-input"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                style={{ appearance: "none", cursor: "pointer" }}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.symbol} style={{ backgroundColor: "#141424", color: "#fff" }}>
                    {asset.name} ({asset.symbol}) - Bal: {asset.balance.toLocaleString()}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: "18px", pointerEvents: "none", color: "var(--text-muted)", fontSize: "0.8rem" }}></i>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Recipient Address</label>
            <div className="input-container">
              <input
                type="text"
                className="form-input"
                placeholder="0x... or ENS domain"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">Amount</label>
              <span className="form-label" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Available: {maxBalance.toLocaleString()} {selectedAsset}
              </span>
            </div>
            <div className="input-container">
              <input
                type="number"
                step="any"
                className="form-input form-input-currency"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button type="button" className="input-max-btn" onClick={handleMax}>
                MAX
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--accent-red)", fontSize: "0.85rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <button type="submit" className="modal-submit-btn" style={{ background: "linear-gradient(135deg, var(--accent-magenta), var(--accent-purple))", boxShadow: "0 10px 20px -5px rgba(255, 0, 162, 0.3)" }}>
            Authorize Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
