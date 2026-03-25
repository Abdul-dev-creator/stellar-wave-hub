"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, connectWallet } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  const handleWallet = async () => {
    setError("");
    setWalletLoading(true);
    try {
      await connectWallet();
      router.push("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    }
    setWalletLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-nova to-plasma flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-starlight">Welcome back</h1>
          <p className="text-ash mt-2">Sign in to your Stellar Wave Hub account</p>
        </div>

        <div className="space-y-4 animate-in animate-in-delay-1">
          {error && (
            <div className="bg-supernova/10 border border-supernova/20 text-supernova rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Wallet Connect */}
          <button
            onClick={handleWallet}
            disabled={walletLoading}
            className="w-full glass glass-hover rounded-2xl p-4 flex items-center justify-center gap-3 transition-all disabled:opacity-50 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma/30 to-aurora/30 border border-plasma/20 flex items-center justify-center group-hover:from-plasma/40 group-hover:to-aurora/40 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--plasma-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-starlight text-sm">
                {walletLoading ? "Connecting..." : "Connect Stellar Wallet"}
              </p>
              <p className="text-xs text-ash">Sign in with Freighter</p>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-dust/30" />
            <span className="text-xs text-ash uppercase tracking-wider">or continue with email</span>
            <div className="flex-1 h-px bg-dust/30" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-moonlight mb-2">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-moonlight mb-2">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-nova w-full !py-3 text-center disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-ash">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-nova-bright hover:underline font-medium">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
