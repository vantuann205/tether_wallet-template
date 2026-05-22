"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import Onboarding from "../components/Onboarding";
import SpaceBackground from "../components/SpaceBackground";
import BalanceCard3D from "../components/BalanceCard3D";
import SendModal from "../components/SendModal";
import ReceiveModal from "../components/ReceiveModal";
import SwapModal from "../components/SwapModal";

export default function Dashboard() {
  const {
    mnemonic,
    activeNetworkName,
    setActiveNetworkName,
    currentNetwork,
    allNetworks,
    transactions,
    isLoading,
    sendAsset,
    swapAssets,
    logout
  } = useWallet();

  // Modal toggles
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  // Sidebar navigation menu
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Toast notifications
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIcon, setToastIcon] = useState("fa-circle-check");

  // Trigger floating alert toasts
  const triggerToast = (message: string, icon = "fa-circle-check") => {
    setToastMessage(message);
    setToastIcon(icon);
    setToastActive(true);
  };

  useEffect(() => {
    if (toastActive) {
      const timer = setTimeout(() => {
        setToastActive(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastActive]);

  // If the user has not created or imported a seed phrase, show onboarding
  if (!mnemonic) {
    return (
      <>
        <SpaceBackground />
        <div className="ambient-glow glow-purple"></div>
        <div className="ambient-glow glow-cyan"></div>
        <Onboarding />
      </>
    );
  }

  // Active assets on selected network
  const assets = currentNetwork.assets;

  // Calculate dynamic aggregated portfolio balance
  const totalBalance = assets.reduce((total, asset) => total + asset.balance * asset.price, 0);

  // Calculate 24h weighted percentage change
  const total24hChange = assets.reduce((weightedChange, asset) => {
    const weighting = (asset.balance * asset.price) / (totalBalance || 1);
    return weightedChange + asset.change * weighting;
  }, 0);

  // Copy derived wallet address helper
  const copyAddress = () => {
    navigator.clipboard.writeText(currentNetwork.addressFull);
    triggerToast("Address copied to clipboard!", "fa-copy");
  };

  // Transaction Handlers: Send Transaction via WDK
  const handleSendSuccess = async (amount: number, symbol: string, recipient: string) => {
    triggerToast("Initiating WDK transaction...", "fa-arrows-spin");
    const success = await sendAsset(recipient, amount, symbol);
    if (success) {
      triggerToast(`Successfully sent ${amount} ${symbol}!`, "fa-circle-check");
    } else {
      triggerToast("Transaction failed. Check balances or inputs.", "fa-circle-exclamation");
    }
  };

  // Transaction Handlers: Swap Transaction via Context
  const handleSwapSuccess = async (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => {
    triggerToast("Executing token exchange...", "fa-arrows-spin");
    const success = await swapAssets(fromSymbol, toSymbol, fromAmount, toAmount);
    if (success) {
      triggerToast(`Swapped ${fromSymbol} for ${toSymbol}!`, "fa-circle-check");
    } else {
      triggerToast("Swap operation failed.", "fa-circle-exclamation");
    }
  };

  return (
    <>
      {/* 3D WebGL Space Starfield Canvas Component */}
      <SpaceBackground />

      {/* Floating volumetric gradient background blur overlays */}
      <div className="ambient-glow glow-purple"></div>
      <div className="ambient-glow glow-cyan"></div>

      {/* App Main Structural Grid container */}
      <div id="app-container" style={{ position: "relative" }}>
        
        {/* Top Header Controls bar */}
        <header className="top-nav glass-panel">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fa-solid fa-compass-drafting"></i>
            </div>
            <h1 className="logo-text">
              AETHER<span>3D</span>
            </h1>
          </div>

          <div className="nav-right-controls">
            {/* Network Swapping Selector with Dropdown */}
            <div 
              className="network-selector" 
              onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
              style={{ position: "relative" }}
            >
              <span className="net-dot" style={{ backgroundColor: currentNetwork.themeColor, boxShadow: `0 0 10px ${currentNetwork.themeColor}` }}></span>
              <span className="net-name">{activeNetworkName}</span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.72rem", opacity: 0.7 }}></i>

              {/* Selector Overlay dropdown list */}
              {networkDropdownOpen && (
                <div 
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "0",
                    width: "220px",
                    background: "rgba(10, 10, 20, 0.95)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "16px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    zIndex: 999,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.keys(allNetworks).map((netName) => (
                    <div
                      key={netName}
                      onClick={() => {
                        setActiveNetworkName(netName);
                        setNetworkDropdownOpen(false);
                        triggerToast(`Switched chain to ${netName}!`, "fa-plug");
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: activeNetworkName === netName ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        transition: "background 0.2s"
                      }}
                      className="net-dropdown-item"
                    >
                      <span 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          backgroundColor: allNetworks[netName].themeColor, 
                          boxShadow: `0 0 8px ${allNetworks[netName].themeColor}`
                        }} 
                      />
                      <span style={{ fontSize: "0.88rem", fontWeight: "600", color: activeNetworkName === netName ? "#fff" : "var(--text-secondary)" }}>
                        {netName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Address Pill which triggers clipboard copies */}
            <div className="wallet-pill" onClick={copyAddress} title="Click to copy full address">
              <i className="fa-solid fa-wallet"></i>
              <span>{currentNetwork.address}</span>
            </div>

            {/* Avatar Security Shield Pill */}
            <div 
              className="wallet-pill" 
              onClick={() => {
                logout();
                triggerToast("Session cleared successfully.", "fa-lock");
              }} 
              title="Secure Logout (Dispose WDK keys)"
              style={{
                background: "rgba(255, 60, 90, 0.08)",
                border: "1px solid rgba(255, 60, 90, 0.25)",
                color: "var(--accent-red)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                borderRadius: "14px"
              }}
            >
              <i className="fa-solid fa-power-off"></i>
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Exit</span>
            </div>
          </div>
        </header>

        {/* Sidebar Left Navigation Section */}
        <aside className="sidebar-panel glass-panel">
          <nav className="sidebar-menu">
            {[
              { label: "Dashboard", icon: "fa-chart-pie" },
              { label: "Assets", icon: "fa-vault" },
              { label: "Activity", icon: "fa-timeline" },
            ].map((item) => (
              <a
                href="#"
                key={item.label}
                className={`menu-item ${activeMenu === item.label ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(item.label);
                  if (item.label !== "Dashboard") {
                    triggerToast(`Navigating to ${item.label} panel...`, "fa-folder-open");
                  }
                }}
                style={{
                  borderLeftColor: activeMenu === item.label ? currentNetwork.themeColor : "transparent"
                }}
              >
                <i 
                  className={`fa-solid ${item.icon}`}
                  style={{
                    color: activeMenu === item.label ? currentNetwork.themeColor : "inherit",
                    filter: activeMenu === item.label ? `drop-shadow(0 0 8px ${currentNetwork.themeColor})` : "none"
                  }}
                />
                {item.label}
              </a>
            ))}
          </nav>

          {/* System Security status metrics container in Sidebar bottom */}
          <div className="system-status">
            <div className="status-header">
              <span>WDK Shield</span>
              <span className="status-ok">Derived</span>
            </div>
            <div className="gas-display">
              <i className="fa-solid fa-gas-pump" style={{ color: currentNetwork.themeColor }}></i>
              <span style={{ fontSize: "0.82rem", fontWeight: "600" }}>{currentNetwork.gasPrice}</span>
            </div>
          </div>
        </aside>

        {/* Main Panel Viewport Grid */}
        <main className="main-content">
          
          {/* Primary Viewport Area (Left Side Columns) */}
          <div className="primary-workspace">
            
            {/* 3D WebGL floating balance card viewport */}
            <section className="balance-card-container">
              {/* Three.js viewport layer rendering glossy card & orbiting assets */}
              <BalanceCard3D />

              {/* Overlay HTML text layered cleanly over WebGL container */}
              <div className="balance-overlay-content">
                <div className="balance-info">
                  <span className="balance-label">WDK Aggregated Portfolio</span>
                  <div className="balance-amount">
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="balance-trend" style={{
                    color: total24hChange >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                    borderColor: total24hChange >= 0 ? "rgba(20, 240, 160, 0.25)" : "rgba(255, 60, 90, 0.25)",
                    background: total24hChange >= 0 ? "rgba(20, 240, 160, 0.1)" : "rgba(255, 60, 90, 0.1)"
                  }}>
                    <i className={`fa-solid ${total24hChange >= 0 ? "fa-trend-up" : "fa-trend-down"}`}></i>
                    <span>{total24hChange >= 0 ? "+" : ""}{total24hChange.toFixed(2)}% (24h)</span>
                  </div>
                </div>

                <div className="quick-meta">
                  <div className="chip-status" style={{
                    borderColor: currentNetwork.themeColor,
                    boxShadow: `0 0 10px ${currentNetwork.themeColor}33, inset 0 2px 4px rgba(255,255,255,0.1)`
                  }}></div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6 }}>
                    {currentNetwork.symbol} Network
                  </span>
                </div>
              </div>
            </section>

            {/* Asset Portfolios Grid list */}
            <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="assets-grid-title">BIP-44 Derived Balances</h2>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {assets.length} Active Tokens
                </span>
              </div>

              <div className="assets-grid">
                {assets.map((asset, index) => {
                  const accentColor = 
                    asset.symbol === "BTC" ? "255, 162, 0" : 
                    asset.symbol === "USDT" ? "0, 255, 213" : "172, 83, 255";

                  // Convert sparkline arrays to standard SVG sparkline charts
                  const width = 75;
                  const height = 35;
                  const maxPoint = Math.max(...asset.sparkline);
                  const minPoint = Math.min(...asset.sparkline);
                  const range = maxPoint - minPoint || 1;
                  const points = asset.sparkline
                    .map((val, idx) => {
                      const x = (idx / (asset.sparkline.length - 1)) * width;
                      const y = height - ((val - minPoint) / range) * height;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ");

                  return (
                    <div 
                      key={asset.id} 
                      className={`asset-card glass-panel floating-element-${(index % 3) + 1}`}
                      onClick={() => {
                        triggerToast(`Opening swap prefilled with ${asset.symbol}...`, "fa-rotate");
                        setSwapOpen(true);
                      }}
                      style={{
                        ["--border-glow-rgb" as any]: accentColor,
                      }}
                    >
                      <div className="asset-header">
                        <div className={`asset-icon-box coin-${asset.id}`}>
                          <i className={`fa-brands ${asset.logoClass} || fa-solid ${asset.logoClass}`}></i>
                        </div>
                        <span className={`change-badge ${asset.change >= 0 ? "positive" : "negative"}`}>
                          {asset.change >= 0 ? "+" : ""}{asset.change}%
                        </span>
                      </div>

                      <div>
                        <div className="asset-title">{asset.name}</div>
                        <div className="asset-subtitle">{asset.symbol}</div>
                      </div>

                      <div className="asset-footer">
                        <div className="asset-values">
                          <div className="asset-balance">
                            {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </div>
                          <div className="asset-fiat">
                            ${(asset.balance * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        {/* Responsive Sparkline Chart */}
                        <svg className="asset-sparkline" viewBox={`0 0 ${width} ${height}`}>
                          <polyline
                            className="sparkline-path"
                            points={points}
                            style={{
                              color: asset.change >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                              stroke: "currentColor"
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Secondary Control Panels (Right Side Columns) */}
          <div className="secondary-workspace">
            
            {/* Quick action controls panel */}
            <section className="quick-actions-panel glass-panel">
              <h3 className="actions-header">Quick Commands</h3>
              
              <div className="buttons-container">
                {/* Send */}
                <div className="action-btn-wrap btn-send" onClick={() => setSendOpen(true)}>
                  <div className="action-circle">
                    <i className="fa-solid fa-arrow-up-right"></i>
                  </div>
                  <span className="action-label">Send</span>
                </div>

                {/* Receive */}
                <div className="action-btn-wrap btn-receive" onClick={() => setReceiveOpen(true)}>
                  <div className="action-circle">
                    <i className="fa-solid fa-arrow-down-left"></i>
                  </div>
                  <span className="action-label">Receive</span>
                </div>

                {/* Swap */}
                <div className="action-btn-wrap btn-swap" onClick={() => setSwapOpen(true)}>
                  <div className="action-circle">
                    <i className="fa-solid fa-rotate"></i>
                  </div>
                  <span className="action-label">Swap</span>
                </div>

                {/* Bridge */}
                <div 
                  className="action-btn-wrap btn-bridge"
                  onClick={() => triggerToast("Cross-chain WDK bridge initialized.", "fa-link")}
                >
                  <div className="action-circle">
                    <i className="fa-solid fa-circle-nodes"></i>
                  </div>
                  <span className="action-label">Bridge</span>
                </div>
              </div>
            </section>

            {/* Recent activity timeline feed */}
            <section className="activity-panel glass-panel" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 className="actions-header" style={{ marginBottom: 0 }}>Recent Activity</h3>
                <i 
                  className="fa-solid fa-clock-rotate-left" 
                  style={{ color: "var(--text-muted)", cursor: "pointer" }}
                  onClick={() => triggerToast("Activity timeline synced with WDK ledger.", "fa-arrows-rotate")}
                ></i>
              </div>

              {/* Transaction list wrapper */}
              <div className="activity-list custom-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", paddingRight: "4px" }}>
                {transactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    No recent transactions
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.04)"
                      }}
                      className="activity-item-wrap"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div 
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: `rgba(${tx.type === "send" ? "255, 0, 162" : tx.type === "receive" ? "0, 255, 213" : tx.type === "swap" ? "172, 83, 255" : "255,255,255"}, 0.08)`,
                            border: `1px solid rgba(${tx.type === "send" ? "255, 0, 162" : tx.type === "receive" ? "0, 255, 213" : tx.type === "swap" ? "172, 83, 255" : "255,255,255"}, 0.2)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <i className={`fa-solid ${tx.iconClass}`} style={{ color: tx.colorClass, fontSize: "0.95rem" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{tx.title}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{tx.detail}</div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: tx.type === "receive" ? "var(--accent-green)" : "var(--text-primary)" }}>
                          {tx.amountText}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{tx.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Floating glassmorphism Notification alert toast */}
      <div className={`toast-notification ${toastActive ? "active" : ""}`} style={{ borderColor: currentNetwork.themeColor, boxShadow: `0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${currentNetwork.themeColor}22` }}>
        <i className={`fa-solid ${toastIcon} toast-icon`} style={{ color: currentNetwork.themeColor }} />
        <span className="toast-message">{toastMessage}</span>
      </div>

      {/* Stateful form dialog Modal overlays */}
      <SendModal 
        isOpen={sendOpen} 
        onClose={() => setSendOpen(false)} 
        assets={assets} 
        onSendSuccess={handleSendSuccess} 
      />

      <ReceiveModal 
        isOpen={receiveOpen} 
        onClose={() => setReceiveOpen(false)} 
        walletAddress={currentNetwork.addressFull} 
      />

      <SwapModal 
        isOpen={swapOpen} 
        onClose={() => setSwapOpen(false)} 
        assets={assets} 
        onSwapSuccess={handleSwapSuccess} 
      />
    </>
  );
}
