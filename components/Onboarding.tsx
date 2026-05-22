"use client";

import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function Onboarding() {
  const { generateNewSeed, importSeed } = useWallet();
  const [activeTab, setActiveTab] = useState<"create" | "import">("create");
  
  // Create Seed States
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [backupChecked, setBackupChecked] = useState(false);
  
  // Import Seed States
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Initialize or retrieve existing generated mnemonic
  const handleGetMnemonic = () => {
    if (!generatedMnemonic) {
      setGeneratedMnemonic(generateNewSeed());
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateSubmit = async () => {
    if (!backupChecked) return;
    setIsProvisioning(true);
    try {
      await importSeed(generatedMnemonic);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    
    if (!importText.trim()) {
      setImportError("Please enter your seed phrase");
      return;
    }

    setIsProvisioning(true);
    try {
      const success = await importSeed(importText);
      if (!success) {
        setImportError("Invalid seed phrase. Please verify the words and try again.");
      }
    } catch (err) {
      setImportError("Failed to authenticate seed phrase.");
    } finally {
      setIsProvisioning(false);
    }
  };

  // Developer testing quick-pass seed
  const handleDevQuickPass = async () => {
    setIsProvisioning(true);
    const testSeed = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    try {
      await importSeed(testSeed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        overflowY: "auto"
      }}
    >
      {/* Background Volumetric Gradients */}
      <div className="ambient-glow glow-purple" style={{ opacity: 0.5 }}></div>
      <div className="ambient-glow glow-cyan" style={{ opacity: 0.5 }}></div>

      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "rgba(10, 10, 20, 0.75)",
          backdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid var(--glass-border)",
          borderRadius: "28px",
          padding: "40px",
          boxShadow: "0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
          animation: "float-1 8s ease-in-out infinite",
          margin: "auto"
        }}
      >
        {/* Onboarding Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 0 25px rgba(0, 255, 213, 0.4)"
            }}
          >
            <i className="fa-solid fa-compass-drafting" style={{ fontSize: "1.8rem", color: "#000" }}></i>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
            AETHER<span style={{ color: "var(--accent-cyan)" }}>3D</span> WALLET
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
            Next.js WDK Starter Template
          </p>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "14px",
            padding: "4px",
            marginBottom: "28px"
          }}
        >
          <button
            onClick={() => {
              setActiveTab("create");
              handleGetMnemonic();
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "create" ? "rgba(255, 255, 255, 0.08)" : "transparent",
              color: activeTab === "create" ? "#fff" : "var(--text-secondary)",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Create Wallet
          </button>
          <button
            onClick={() => setActiveTab("import")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "import" ? "rgba(255, 255, 255, 0.08)" : "transparent",
              color: activeTab === "import" ? "#fff" : "var(--text-secondary)",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Import Wallet
          </button>
        </div>

        {/* Tab 1: Create Wallet UI */}
        {activeTab === "create" && (
          <div>
            {!generatedMnemonic ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <button
                  onClick={handleGetMnemonic}
                  className="modal-submit-btn"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                    boxShadow: "0 8px 20px -5px rgba(0, 255, 213, 0.3)"
                  }}
                >
                  Generate Quantum Seed
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    BIP-39 Mnemonic Phrase
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: copied ? "var(--accent-green)" : "var(--accent-cyan)",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className={copied ? "fa-solid fa-circle-check" : "fa-solid fa-copy"}></i>
                    {copied ? "Copied!" : "Copy Phrase"}
                  </button>
                </div>

                {/* Seed Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "20px"
                  }}
                >
                  {generatedMnemonic.split(" ").map((word, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                      }}
                    >
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff", fontFamily: "var(--font-mono)" }}>
                        {word}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "rgba(255, 0, 162, 0.05)",
                    border: "1px solid rgba(255, 0, 162, 0.15)",
                    borderRadius: "14px",
                    padding: "14px",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px"
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--accent-magenta)", fontSize: "1.1rem", marginTop: "2px" }}></i>
                  <div>
                    <strong>Write down this phrase:</strong> It is fully non-custodial and derived locally. Anyone with these 12 words can access your multi-chain assets. We never upload keys.
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "var(--text-primary)",
                    marginBottom: "24px"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={backupChecked}
                    onChange={(e) => setBackupChecked(e.target.checked)}
                    style={{
                      accentColor: "var(--accent-cyan)",
                      width: "16px",
                      height: "16px"
                    }}
                  />
                  I have securely backed up my seed phrase
                </label>

                <button
                  disabled={!backupChecked || isProvisioning}
                  onClick={handleCreateSubmit}
                  className="modal-submit-btn"
                  style={{
                    background: backupChecked
                      ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))"
                      : "rgba(255, 255, 255, 0.05)",
                    color: backupChecked ? "#000" : "var(--text-muted)",
                    cursor: backupChecked && !isProvisioning ? "pointer" : "not-allowed",
                    boxShadow: backupChecked ? "0 8px 20px -5px rgba(0, 255, 213, 0.3)" : "none"
                  }}
                >
                  {isProvisioning ? "Provisioning Keys..." : "Provision Wallet Keys"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Import Wallet UI */}
        {activeTab === "import" && (
          <form onSubmit={handleImportSubmit} className="modal-form">
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label" style={{ marginBottom: "10px" }}>
                Secret Recovery Phrase (12 Words)
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Separate words with a single space..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                style={{
                  resize: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  padding: "16px",
                  lineHeight: "1.5"
                }}
              />
            </div>

            {importError && (
              <div
                style={{
                  color: "var(--accent-red)",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <i className="fa-solid fa-circle-exclamation"></i>
                {importError}
              </div>
            )}

            <button
              type="submit"
              disabled={isProvisioning}
              className="modal-submit-btn"
              style={{
                background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                boxShadow: "0 8px 20px -5px rgba(172, 83, 255, 0.3)"
              }}
            >
              {isProvisioning ? "Validating & Restoring..." : "Restore Wallet Keys"}
            </button>
          </form>
        )}

        {/* Optional: Developer testing shortcut */}
        <div style={{ marginTop: "28px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "24px", textAlign: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>
            - DEMO CONTROLS -
          </span>
          <button
            onClick={handleDevQuickPass}
            disabled={isProvisioning}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "10px 18px",
              color: "var(--accent-cyan)",
              fontSize: "0.82rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
            className="dev-login-btn"
          >
            <i className="fa-solid fa-flask"></i>
            Load Developer Test Seed (1-Click Preview)
          </button>
        </div>
      </div>
    </div>
  );
}
