"use client";

import React, { useState } from "react";
import { Shield, Lock, User, Eye, EyeOff, Loader2, X } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onClose?: () => void;
  standalone?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onClose,
  standalone = true,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/CheckLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

        onLogin();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Please enter valid credentials to access the command center.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${standalone ? "min-h-screen bg-sheriff-950" : "w-full"} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sheriff-900 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-600/10 rounded-full blur-[120px] opacity-30"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mb-6">
            <Shield className="h-12 w-12 text-gold-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Sheriff <span className="text-gold-500">Command</span>
          </h1>
          <p className="text-sheriff-400 font-medium tracking-widest text-xs mt-2 uppercase">
            Official Campaign Management Portal
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8">
            {onClose && (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close login"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Authorized Access Only</h2>
            <p className="text-sm text-slate-500 text-center mb-8">Please sign in to manage campaign operations.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-sheriff-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block text-black w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-sheriff-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block text-black w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In to Command Center"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
