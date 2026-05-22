"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import WdkManager from "@tetherto/wdk";
import { SimulatedEvmWalletManager, SimulatedSolanaWalletManager } from "../lib/wdkMockWallets";
import { IWalletAccount } from "@tetherto/wdk-wallet";

export interface AssetBalance {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  change: number;
  logoClass: string;
  sparkline: number[];
}

export interface UIChainNetwork {
  name: string;
  symbol: string;
  address: string;
  addressFull: string;
  gasPrice: string;
  themeColor: string;
  glowClass: string;
  assets: AssetBalance[];
}

export interface TransactionEntry {
  id: string;
  type: "send" | "receive" | "swap" | "bridge" | "info";
  title: string;
  detail: string;
  time: string;
  amountText: string;
  iconClass: string;
  colorClass: string;
}

interface WalletContextType {
  mnemonic: string | null;
  activeNetworkName: string;
  setActiveNetworkName: (name: string) => void;
  currentNetwork: UIChainNetwork;
  allNetworks: Record<string, UIChainNetwork>;
  transactions: TransactionEntry[];
  isLoading: boolean;
  generateNewSeed: () => string;
  importSeed: (words: string) => Promise<boolean>;
  sendAsset: (toAddress: string, amount: number, symbol: string) => Promise<boolean>;
  swapAssets: (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => Promise<boolean>;
  logout: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Initial empty states for networks before initialization
const INITIAL_NETWORKS: Record<string, UIChainNetwork> = {
  "Ethereum Mainnet": {
    name: "Ethereum Mainnet",
    symbol: "ETH",
    address: "0x0000...0000",
    addressFull: "0x0000000000000000000000000000000000000000",
    gasPrice: "24 Gwei",
    themeColor: "var(--accent-purple)",
    glowClass: "glow-purple",
    assets: [
      { id: "usdt", name: "Tether USD", symbol: "USDT", balance: 0.0, price: 1.0, change: 0.0, logoClass: "fa-dollar-sign", sparkline: [40, 40, 40, 40, 40, 40, 40] },
      { id: "btc", name: "Bitcoin", symbol: "BTC", balance: 0.0, price: 62450.0, change: 0.0, logoClass: "fa-bitcoin", sparkline: [10, 10, 10, 10, 10, 10, 10] },
      { id: "eth", name: "Ethereum", symbol: "ETH", balance: 0.0, price: 3450.0, change: 0.0, logoClass: "fa-ethereum", sparkline: [45, 45, 45, 45, 45, 45, 45] }
    ]
  },
  "Solana Mainnet": {
    name: "Solana Mainnet",
    symbol: "SOL",
    address: "HN7c...e456",
    addressFull: "HN7cABjVq4aG6A71C298f8B9D9897F10abcde456",
    gasPrice: "0.00005 SOL",
    themeColor: "var(--accent-cyan)",
    glowClass: "glow-cyan",
    assets: [
      { id: "usdt", name: "Tether USD", symbol: "USDT", balance: 0.0, price: 1.0, change: 0.0, logoClass: "fa-dollar-sign", sparkline: [38, 38, 38, 38, 38, 38, 38] },
      { id: "sol", name: "Solana", symbol: "SOL", balance: 0.0, price: 155.2, change: 0.0, logoClass: "fa-bolt", sparkline: [10, 10, 10, 10, 10, 10, 10] },
      { id: "btc", name: "Wrapped BTC", symbol: "BTC", balance: 0.0, price: 62510.0, change: 0.0, logoClass: "fa-bitcoin", sparkline: [20, 20, 20, 20, 20, 20, 20] }
    ]
  }
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [activeNetworkName, setActiveNetworkName] = useState<string>("Ethereum Mainnet");
  const [networks, setNetworks] = useState<Record<string, UIChainNetwork>>(INITIAL_NETWORKS);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use ref to keep track of active WdkManager safely across re-renders
  const wdkManagerRef = useRef<WdkManager | null>(null);

  // Securely retrieve the derived account for a given network name
  const getWdkAccount = useCallback(async (netName: string): Promise<IWalletAccount> => {
    const wdk = wdkManagerRef.current;
    if (!wdk) throw new Error("WDK Manager not initialized");

    if (netName === "Ethereum Mainnet") {
      return await wdk.getAccount("ethereum", 0);
    } else {
      return await wdk.getAccount("solana", 0);
    }
  }, []);

  // Fetch balances from active derived WDK accounts
  const updateBalances = useCallback(async () => {
    if (!wdkManagerRef.current) return;

    try {
      // 1. Ethereum Balances
      const ethAccount = await getWdkAccount("Ethereum Mainnet");
      const ethAddress = await ethAccount.getAddress();
      const ethBalWei = await ethAccount.getBalance();
      const usdtBalWei = await ethAccount.getTokenBalance("0xdAC17F958D2ee523a2206206994597C13D831ec7"); // Standard ERC20 USDT Address

      // Convert Wei to Float
      const ethBal = Number(ethBalWei) / 1e18;
      const usdtBal = Number(usdtBalWei) / 1e6;

      // 2. Solana Balances
      const solAccount = await getWdkAccount("Solana Mainnet");
      const solAddress = await solAccount.getAddress();
      const solBalLamports = await solAccount.getBalance();
      const solUsdtBalLamports = await solAccount.getTokenBalance("Es9vMFrzaCERmJfrF4H2FYBn26vvyd78Onm1y34i1g4y"); // SPL USDT token

      const solBal = Number(solBalLamports) / 1e9;
      const solUsdtBal = Number(solUsdtBalLamports) / 1e6;

      setNetworks((prev) => {
        const next = { ...prev };
        
        // Update Ethereum Assets
        next["Ethereum Mainnet"] = {
          ...next["Ethereum Mainnet"],
          addressFull: ethAddress,
          address: `${ethAddress.substring(0, 6)}...${ethAddress.slice(-4)}`,
          assets: next["Ethereum Mainnet"].assets.map((asset) => {
            if (asset.symbol === "ETH") return { ...asset, balance: ethBal };
            if (asset.symbol === "USDT") return { ...asset, balance: usdtBal };
            if (asset.symbol === "BTC") return { ...asset, balance: 1.154 }; // Keep BTC mock standard
            return asset;
          })
        };

        // Update Solana Assets
        next["Solana Mainnet"] = {
          ...next["Solana Mainnet"],
          addressFull: solAddress,
          address: `${solAddress.substring(0, 4)}...${solAddress.slice(-4)}`,
          assets: next["Solana Mainnet"].assets.map((asset) => {
            if (asset.symbol === "SOL") return { ...asset, balance: solBal };
            if (asset.symbol === "USDT") return { ...asset, balance: solUsdtBal };
            if (asset.symbol === "BTC") return { ...asset, balance: 0.035 };
            return asset;
          })
        };

        return next;
      });
    } catch (err) {
      console.error("Error polling derived WDK balances:", err);
    }
  }, [getWdkAccount]);

  // Handle price fluctuating tickers to make the spatial UI feel responsive and alive
  useEffect(() => {
    if (!mnemonic) return;

    const tickerInterval = setInterval(() => {
      setNetworks((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((netKey) => {
          const net = next[netKey];
          net.assets = net.assets.map((asset) => {
            let priceShift = 0;
            let percentChange = asset.change;

            if (asset.symbol === "USDT") {
              priceShift = (Math.random() - 0.5) * 0.0002;
            } else if (asset.symbol === "BTC") {
              priceShift = (Math.random() - 0.5) * 20.0;
            } else {
              priceShift = (Math.random() - 0.5) * 1.5;
            }

            const updatedPrice = Math.max(0.01, asset.price + priceShift);
            percentChange += (Math.random() - 0.5) * 0.05;

            const updatedSparkline = [...asset.sparkline.slice(1)];
            const lastVal = asset.sparkline[asset.sparkline.length - 1];
            const sparkShift = (Math.random() - 0.5) * 4;
            updatedSparkline.push(Math.max(5, Math.min(45, lastVal + sparkShift)));

            return {
              ...asset,
              price: parseFloat(updatedPrice.toFixed(asset.symbol === "USDT" ? 4 : 2)),
              change: parseFloat(percentChange.toFixed(2)),
              sparkline: updatedSparkline
            };
          });
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(tickerInterval);
  }, [mnemonic]);

  // Load mnemonic from sessionStorage for development persistence, avoiding local storage risk
  useEffect(() => {
    const cachedSeed = sessionStorage.getItem("wdk_secure_seed");
    if (cachedSeed && WdkManager.isValidSeed(cachedSeed)) {
      initWdkManager(cachedSeed);
    }
  }, []);

  // Set up WDK instance and bind simulated multi-chain wallet managers
  const initWdkManager = async (seed: string) => {
    setIsLoading(true);
    try {
      const manager = new WdkManager(seed);
      // Register our simulated WDK wallet managers
      manager.registerWallet("ethereum", SimulatedEvmWalletManager, {});
      manager.registerWallet("solana", SimulatedSolanaWalletManager, {});

      wdkManagerRef.current = manager;
      setMnemonic(seed);
      sessionStorage.setItem("wdk_secure_seed", seed);

      // Populate some standard initial timeline items
      const initialTx: TransactionEntry[] = [
        { id: "tx-1", type: "receive", title: "Received Tether USD", detail: "From 0x98f2...e3b4", time: "2 hours ago", amountText: "+5,400.00 USDT", iconClass: "fa-arrow-down-left", colorClass: "var(--accent-cyan)" },
        { id: "tx-2", type: "info", title: "Wallet Provisioned", detail: "Multi-chain keys loaded", time: "Just now", amountText: "BIP-44", iconClass: "fa-circle-nodes", colorClass: "var(--accent-purple)" }
      ];
      setTransactions(initialTx);

      // Immediately fetch derived multi-chain balances
      await updateBalances();
    } catch (err) {
      console.error("Failed to initialize WDK Manager:", err);
      sessionStorage.removeItem("wdk_secure_seed");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random BIP-39 seed phrase (12 words)
  const generateNewSeed = (): string => {
    return WdkManager.getRandomSeedPhrase(12);
  };

  // Import existing mnemonic seed phrase
  const importSeed = async (words: string): Promise<boolean> => {
    const formatted = words.trim().toLowerCase().replace(/\s+/g, " ");
    if (!WdkManager.isValidSeed(formatted)) {
      return false;
    }
    await initWdkManager(formatted);
    return true;
  };

  // Send crypto assets using wdkAccount.transfer() API
  const sendAsset = async (toAddress: string, amount: number, symbol: string): Promise<boolean> => {
    if (!wdkManagerRef.current) return false;

    try {
      const account = await getWdkAccount(activeNetworkName);
      
      // Calculate token address or execute standard transfer based on active chain
      const isEvm = activeNetworkName === "Ethereum Mainnet";
      
      let txResult;

      if (symbol === "USDT") {
        const tokenAddress = isEvm 
          ? "0xdAC17F958D2ee523a2206206994597C13D831ec7" 
          : "Es9vMFrzaCERmJfrF4H2FYBn26vvyd78Onm1y34i1g4y";
          
        const decimals = 6;
        const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

        // Call WDK Account Transfer protocol for tokens!
        txResult = await account.transfer({
          token: tokenAddress,
          recipient: toAddress,
          amount: rawAmount
        });
      } else {
        // Send native coin (ETH or SOL)
        const decimals = isEvm ? 18 : 9;
        const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

        // In WDK, sending native token is done using standard transfer (if token is omitted or empty)
        txResult = await account.transfer({
          token: "",
          recipient: toAddress,
          amount: rawAmount
        });
      }

      // Record transaction into our ledger
      const newTx: TransactionEntry = {
        id: `tx-${Date.now()}`,
        type: "send",
        title: `Sent ${symbol}`,
        detail: `To ${toAddress.substring(0, 6)}...${toAddress.slice(-4)}`,
        time: "Just now",
        amountText: `-${amount.toLocaleString()} ${symbol}`,
        iconClass: "fa-arrow-up-right",
        colorClass: "var(--accent-magenta)"
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Trigger asynchronous balance recalculation
      await updateBalances();
      return true;
    } catch (err) {
      console.error("WDK transfer operation error:", err);
      return false;
    }
  };

  // Swap assets locally and trigger balance recalculation
  const swapAssets = async (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number): Promise<boolean> => {
    if (!wdkManagerRef.current) return false;

    try {
      // Simulate swap transfer: Deduct source, Add target in mock state, mirroring WDK Swap protocol execution
      setNetworks((prev) => {
        const next = { ...prev };
        const net = next[activeNetworkName];
        net.assets = net.assets.map((asset) => {
          if (asset.symbol === fromSymbol) {
            return { ...asset, balance: Math.max(0, asset.balance - fromAmount) };
          }
          if (asset.symbol === toSymbol) {
            return { ...asset, balance: asset.balance + toAmount };
          }
          return asset;
        });
        return next;
      });

      const newTx: TransactionEntry = {
        id: `tx-${Date.now()}`,
        type: "swap",
        title: `Swapped ${fromSymbol} for ${toSymbol}`,
        detail: `Exchange: ${fromAmount} ${fromSymbol} ➔ ${toAmount} ${toSymbol}`,
        time: "Just now",
        amountText: `-${fromAmount} ${fromSymbol} / +${toAmount} ${toSymbol}`,
        iconClass: "fa-rotate",
        colorClass: "var(--accent-purple)"
      };

      setTransactions((prev) => [newTx, ...prev]);
      return true;
    } catch (err) {
      console.error("Swap operation failed:", err);
      return false;
    }
  };

  // Securely erase seeds and clear active WDK manager registries to prevent memory leakage
  const logout = () => {
    if (wdkManagerRef.current) {
      wdkManagerRef.current.dispose();
      wdkManagerRef.current = null;
    }
    setMnemonic(null);
    setTransactions([]);
    setNetworks(INITIAL_NETWORKS);
    sessionStorage.removeItem("wdk_secure_seed");
  };

  const currentNetwork = networks[activeNetworkName];

  return (
    <WalletContext.Provider
      value={{
        mnemonic,
        activeNetworkName,
        setActiveNetworkName,
        currentNetwork,
        allNetworks: networks,
        transactions,
        isLoading,
        generateNewSeed,
        importSeed,
        sendAsset,
        swapAssets,
        logout
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
