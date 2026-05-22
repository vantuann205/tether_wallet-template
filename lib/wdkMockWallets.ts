import WalletManager, {
  WalletAccountReadOnly,
  IWalletAccount,
  Transaction,
  TransactionResult,
  TransferOptions,
  TransferResult,
  KeyPair,
  FeeRates
} from "@tetherto/wdk-wallet";

// Helper: Deterministic hash function to simulate cryptographic generation
function deterministicHash(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 0x01000193);
    h2 = Math.imul(h2 ^ (str.charCodeAt(i) + 57), 0x01000193);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (h2 >>> 0).toString(16).padStart(8, "0");

  let h3 = 0x5a827999;
  let h4 = 0x6ed9eba1;
  for (let i = 0; i < str.length; i++) {
    h3 = Math.imul(h3 ^ (str.charCodeAt(i) + 13), 0x01000193);
    h4 = Math.imul(h4 ^ (str.charCodeAt(i) + 29), 0x01000193);
  }
  const part3 = (h3 >>> 0).toString(16).padStart(8, "0");
  const part4 = (h4 >>> 0).toString(16).padStart(8, "0");

  return part1 + part2 + part3 + part4; // 32-byte representation (64 hex characters)
}

// Helper: Custom base58-like mapping for Solana addresses
function encodeBase58(hexStr: string): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hashNum = 0n;
  for (let i = 0; i < hexStr.length; i++) {
    hashNum = hashNum * 16n + BigInt(parseInt(hexStr[i], 16));
  }
  let result = "";
  while (hashNum > 0n) {
    const rem = hashNum % 58n;
    result = chars[Number(rem)] + result;
    hashNum = hashNum / 58n;
  }
  return result.substring(0, 44).padStart(44, "7");
}

// Helper: Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// --- EVM Simulated Wallet Account ---
export class SimulatedEvmWalletAccount extends WalletAccountReadOnly implements IWalletAccount {
  private _index: number;
  private _path: string;
  private _seed: Uint8Array;
  private _isDisposed = false;
  private _derivedAddress: string;

  constructor(seed: Uint8Array, index: number, path: string) {
    const seedHex = Array.from(seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const hash = deterministicHash(seedHex + `evm-${index}`);
    const address = "0x" + hash.substring(0, 40);
    super(address);
    this._seed = seed;
    this._index = index;
    this._path = path;
    this._derivedAddress = address;
  }

  get index(): number {
    return this._index;
  }

  get path(): string {
    return this._path;
  }

  get keyPair(): KeyPair {
    if (this._isDisposed) {
      return { publicKey: new Uint8Array(), privateKey: null };
    }
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const privHex = deterministicHash(seedHex + `evm-priv-${this._index}`);
    const pubHex = deterministicHash(seedHex + `evm-pub-${this._index}`);
    return {
      publicKey: hexToBytes(pubHex.substring(0, 64)),
      privateKey: hexToBytes(privHex.substring(0, 64))
    };
  }

  async getAddress(): Promise<string> {
    return this._derivedAddress;
  }

  async verify(message: string, signature: string): Promise<boolean> {
    return signature.startsWith("0x") && signature.length > 20;
  }

  async getBalance(): Promise<bigint> {
    // Returns a deterministic balance in Wei (around 18.25 ETH)
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const seedVal = seedHex.charCodeAt(0) || 0;
    return BigInt(18250000000000000000n + BigInt((seedVal * 37) % 500) * 10000000000000000n);
  }

  async getTokenBalance(tokenAddress: string): Promise<bigint> {
    // Returns a deterministic USDT balance (6 decimals - around $54,200)
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const seedVal = seedHex.charCodeAt(1) || 0;
    return BigInt(54200000000n + BigInt((seedVal * 113) % 15000) * 1000000n);
  }

  async quoteSendTransaction(tx: Transaction): Promise<Omit<TransactionResult, "hash">> {
    return {
      fee: 21000n * 24000000000n // gasLimit * gasPrice in Wei
    };
  }

  async quoteTransfer(options: TransferOptions): Promise<Omit<TransferResult, "hash">> {
    return {
      fee: 65000n * 24000000000n
    };
  }

  async getTransactionReceipt(hash: string): Promise<unknown | null> {
    return {
      status: 1,
      blockNumber: 19827364,
      confirmations: 12
    };
  }

  async sign(message: string): Promise<string> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    return "0x" + deterministicHash(message + this._path + "signature");
  }

  async signTransaction(tx: Transaction): Promise<unknown> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    return {
      ...tx,
      v: 27,
      r: "0x" + deterministicHash("r" + this._path),
      s: "0x" + deterministicHash("s" + this._path)
    };
  }

  async sendTransaction(tx: Transaction): Promise<TransactionResult> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    const hash = "0x" + deterministicHash("tx" + Date.now() + this._derivedAddress);
    return {
      hash,
      fee: 21000n * 24000000000n
    };
  }

  async transfer(options: TransferOptions): Promise<TransferResult> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    const hash = "0x" + deterministicHash("transfer" + Date.now() + this._derivedAddress);
    return {
      hash,
      fee: 65000n * 24000000000n
    };
  }

  async toReadOnlyAccount(): Promise<any> {
    return this;
  }

  dispose(): void {
    this._isDisposed = true;
  }
}

// --- EVM Simulated Wallet Manager ---
export class SimulatedEvmWalletManager extends WalletManager {
  async getAccount(index: number = 0): Promise<IWalletAccount> {
    const path = `m/44'/60'/0'/0/${index}`;
    if (!this._accounts[path]) {
      this._accounts[path] = new SimulatedEvmWalletAccount(this.seed, index, path);
    }
    return this._accounts[path];
  }

  async getAccountByPath(path: string): Promise<IWalletAccount> {
    if (!this._accounts[path]) {
      const match = path.match(/\/(\d+)$/);
      const index = match ? parseInt(match[1]) : 0;
      this._accounts[path] = new SimulatedEvmWalletAccount(this.seed, index, path);
    }
    return this._accounts[path];
  }

  async getFeeRates(): Promise<FeeRates> {
    return {
      normal: 24000000000n, // 24 Gwei
      fast: 38000000000n // 38 Gwei
    };
  }
}

// --- Solana Simulated Wallet Account ---
export class SimulatedSolanaWalletAccount extends WalletAccountReadOnly implements IWalletAccount {
  private _index: number;
  private _path: string;
  private _seed: Uint8Array;
  private _isDisposed = false;
  private _derivedAddress: string;

  constructor(seed: Uint8Array, index: number, path: string) {
    const seedHex = Array.from(seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const hash = deterministicHash(seedHex + `solana-${index}`);
    const address = encodeBase58(hash);
    super(address);
    this._seed = seed;
    this._index = index;
    this._path = path;
    this._derivedAddress = address;
  }

  get index(): number {
    return this._index;
  }

  get path(): string {
    return this._path;
  }

  get keyPair(): KeyPair {
    if (this._isDisposed) {
      return { publicKey: new Uint8Array(), privateKey: null };
    }
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const privHex = deterministicHash(seedHex + `sol-priv-${this._index}`);
    const pubHex = deterministicHash(seedHex + `sol-pub-${this._index}`);
    return {
      publicKey: hexToBytes(pubHex.substring(0, 64)),
      privateKey: hexToBytes(privHex.substring(0, 64))
    };
  }

  async getAddress(): Promise<string> {
    return this._derivedAddress;
  }

  async verify(message: string, signature: string): Promise<boolean> {
    return signature.length > 30;
  }

  async getBalance(): Promise<bigint> {
    // Returns deterministic SOL balance (9 decimals - around 412.5 SOL)
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const seedVal = seedHex.charCodeAt(2) || 0;
    return BigInt(412500000000n + BigInt((seedVal * 47) % 300) * 1000000000n);
  }

  async getTokenBalance(tokenAddress: string): Promise<bigint> {
    // Returns deterministic SOL USDT balance (6 decimals - around $32,100)
    const seedHex = Array.from(this._seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const seedVal = seedHex.charCodeAt(3) || 0;
    return BigInt(32100000000n + BigInt((seedVal * 97) % 12000) * 1000000n);
  }

  async quoteSendTransaction(tx: Transaction): Promise<Omit<TransactionResult, "hash">> {
    return {
      fee: 5000n // 5000 Lamports
    };
  }

  async quoteTransfer(options: TransferOptions): Promise<Omit<TransferResult, "hash">> {
    return {
      fee: 5000n
    };
  }

  async getTransactionReceipt(hash: string): Promise<unknown | null> {
    return {
      slot: 24910294,
      confirmations: "maxed"
    };
  }

  async sign(message: string): Promise<string> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    return deterministicHash(message + this._path + "solana-sig");
  }

  async signTransaction(tx: Transaction): Promise<unknown> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    return {
      ...tx,
      signature: deterministicHash("sol-tx-sig" + this._path)
    };
  }

  async sendTransaction(tx: Transaction): Promise<TransactionResult> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    const hash = deterministicHash("sol-tx" + Date.now() + this._derivedAddress);
    return {
      hash,
      fee: 5000n
    };
  }

  async transfer(options: TransferOptions): Promise<TransferResult> {
    if (this._isDisposed) throw new Error("Wallet account disposed");
    const hash = deterministicHash("sol-transfer" + Date.now() + this._derivedAddress);
    return {
      hash,
      fee: 5000n
    };
  }

  async toReadOnlyAccount(): Promise<any> {
    return this;
  }

  dispose(): void {
    this._isDisposed = true;
  }
}

// --- Solana Simulated Wallet Manager ---
export class SimulatedSolanaWalletManager extends WalletManager {
  async getAccount(index: number = 0): Promise<IWalletAccount> {
    const path = `m/44'/501'/0'/0'/${index}`;
    if (!this._accounts[path]) {
      this._accounts[path] = new SimulatedSolanaWalletAccount(this.seed, index, path);
    }
    return this._accounts[path];
  }

  async getAccountByPath(path: string): Promise<IWalletAccount> {
    if (!this._accounts[path]) {
      const match = path.match(/\/(\d+)'?$/);
      const index = match ? parseInt(match[1]) : 0;
      this._accounts[path] = new SimulatedSolanaWalletAccount(this.seed, index, path);
    }
    return this._accounts[path];
  }

  async getFeeRates(): Promise<FeeRates> {
    return {
      normal: 5000n, // standard 0.000005 SOL
      fast: 10000n // priority fee lamports
    };
  }
}
