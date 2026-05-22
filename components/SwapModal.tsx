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

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSwapSuccess: (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => void;
}

export default function SwapModal({ isOpen, onClose, assets, onSwapSuccess }: SwapModalProps) {
  const [fromAsset, setFromAsset] = useState("ETH");
  const [toAsset, setToAsset] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [error, setError] = useState("");

  // Keep assets synchronized when changing networks or initializing
  useEffect(() => {
    if (assets.length > 1) {
      const firstAsset = assets[0].symbol;
      const secondAsset = assets[1].symbol;
      setFromAsset(firstAsset);
      setToAsset(secondAsset);
    }
  }, [assets]);

  const sourceAsset = assets.find((a) => a.symbol === fromAsset);
  const targetAsset = assets.find((a) => a.symbol === toAsset);

  const maxBalance = sourceAsset ? sourceAsset.balance : 0;

  // Real-time calculation of exchange rates and outputs
  useEffect(() => {
    if (!sourceAsset || !targetAsset || !fromAmount) {
      setToAmount("");
      return;
    }

    const amountNum = parseFloat(fromAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setToAmount("");
      return;
    }

    // Convert source asset to target asset using current mock prices
    const fromValInUsd = amountNum * sourceAsset.price;
    const computedToAmount = fromValInUsd / targetAsset.price;

    // Set value rounded based on coin scale (crypto gets more decimals)
    const decimalPlaces = targetAsset.symbol === "USDT" ? 2 : 6;
    setToAmount(computedToAmount.toFixed(decimalPlaces));
  }, [fromAmount, fromAsset, toAsset, sourceAsset, targetAsset]);

  const handleMax = () => {
    if (sourceAsset) {
      setFromAmount(maxBalance.toString());
    }
  };

  const handleAssetSwitch = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount("");
    setToAmount("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fromAsset === toAsset) {
      setError("Cannot swap a token with itself");
      return;
    }

    const numFrom = parseFloat(fromAmount);
    const numTo = parseFloat(toAmount);

    if (isNaN(numFrom) || numFrom <= 0) {
      setError("Please enter a valid amount to swap");
      return;
    }

    if (numFrom > maxBalance) {
      setError(`Insufficient balance. Available: ${maxBalance} ${fromAsset}`);
      return;
    }

    // Execute callback
    onSwapSuccess(fromAsset, toAsset, numFrom, numTo);

    // Reset Form
    setFromAmount("");
    setToAmount("");
    onClose();
  };

  // Get current conversion rate string
  const getExchangeRateString = () => {
    if (!sourceAsset || !targetAsset) return "";
    const rate = sourceAsset.price / targetAsset.price;
    const decimals = targetAsset.symbol === "USDT" ? 2 : 5;
    return `1 ${fromAsset} ≈ ${rate.toFixed(decimals)} ${toAsset}`;
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
            <i className="fa-solid fa-rotate" style={{ color: "var(--accent-purple)" }}></i>
            Instant Swap
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Swap From */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">Pay With</label>
              <span className="form-label" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Balance: {maxBalance.toLocaleString()} {fromAsset}
              </span>
            </div>
            <div className="input-container">
              <input
                type="number"
                step="any"
                className="form-input form-input-currency"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
              <button type="button" className="input-max-btn" onClick={handleMax} style={{ right: "100px" }}>
                MAX
              </button>
              <select
                className="coin-selector-modal"
                value={fromAsset}
                onChange={(e) => {
                  setFromAsset(e.target.value);
                  setFromAmount("");
                }}
                style={{ cursor: "pointer", appearance: "none" }}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.symbol} style={{ backgroundColor: "#141424", color: "#fff" }}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Intersect Switch Icon */}
          <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0 12px 0" }}>
            <button
              type="button"
              onClick={handleAssetSwitch}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--accent-purple)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "var(--transition-smooth)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
              }}
              className="swap-direction-btn"
              title="Switch swap direction"
            >
              <i className="fa-solid fa-down-up-arrow" style={{ transform: "rotate(90deg)", fontSize: "0.88rem" }}></i>
            </button>
          </div>

          {/* Swap To */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">Receive (Estimated)</label>
              <span className="form-label" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Balance: {assets.find((a) => a.symbol === toAsset)?.balance.toLocaleString() || 0} {toAsset}
              </span>
            </div>
            <div className="input-container">
              <input
                type="text"
                className="form-input form-input-currency"
                placeholder="0.00"
                value={toAmount}
                disabled
                style={{ opacity: 0.85, cursor: "not-allowed" }}
              />
              <select
                className="coin-selector-modal"
                value={toAsset}
                onChange={(e) => {
                  setToAsset(e.target.value);
                  setFromAmount("");
                }}
                style={{ cursor: "pointer", appearance: "none" }}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.symbol} style={{ backgroundColor: "#141424", color: "#fff" }}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sourceAsset && targetAsset && fromAmount && (
            <div className="swap-rate-container" style={{ display: "flex", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "12px", padding: "10px 14px", fontSize: "0.85rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
              <span>Exchange Rate</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontWeight: "600" }}>{getExchangeRateString()}</span>
            </div>
          )}

          {error && (
            <div style={{ color: "var(--accent-red)", fontSize: "0.85rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <button type="submit" className="modal-submit-btn" style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))" }}>
            Confirm Swap Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
