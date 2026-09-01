"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe, Lock, Mail, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@quantumard.com", role: "CEO", color: "bg-blue-600" },
  { email: "sales@quantumard.com", role: "Sales", color: "bg-green-600" },
  { email: "finance@quantumard.com", role: "Finance", color: "bg-purple-600" },
  { email: "ops@quantumard.com", role: "Operations", color: "bg-orange-600" },
  { email: "procurement@quantumard.com", role: "Procurement", color: "bg-red-600" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@quantumard.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await doLogin(email, password);
  };

  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    // Use the values directly instead of relying on state update
    await doLogin(demoEmail, "demo123");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wide">QUANTUMARD</div>
              <div className="text-gray-500 text-xs">EXIM OS</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            International Trade<br />
            <span className="text-blue-500">Made Simple</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Manage buyers, suppliers, RFQs, quotations, orders, shipments,
            and finances — all in one platform built for global trade.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {[
            { label: "Buyer & Supplier CRM", desc: "Track every relationship" },
            { label: "RFQ to Order Pipeline", desc: "End-to-end trade workflow" },
            { label: "Shipment Tracking", desc: "Real-time logistics visibility" },
            { label: "Finance Dashboard", desc: "P&L, receivables & payables" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
              <div>
                <span className="text-white text-sm font-medium">{f.label}</span>
                <span className="text-gray-500 text-sm"> — {f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-gray-600 text-xs">
          © 2025 Quantumard EXIM OS. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div className="font-bold text-gray-900">QUANTUMARD EXIM OS</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Quick Demo Login
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a.email)}
                  disabled={loading}
                  className={`text-xs px-3 py-1.5 rounded-full text-white font-medium ${a.color} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {a.role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Password for all demo accounts: <code className="bg-gray-100 px-1 rounded">demo123</code></p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="you@quantumard.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Role info */}
          <div className="mt-8 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Roles</p>
            <div className="space-y-2">
              {[
                { role: "CEO", access: "Full access to all modules" },
                { role: "Sales", access: "Buyers, CRM, RFQs, Quotations" },
                { role: "Procurement", access: "Suppliers, RFQs, Samples" },
                { role: "Operations", access: "Orders, Shipments, Documents" },
                { role: "Finance", access: "Finance, Analytics" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">{r.role}</span>
                  <span className="text-gray-400">{r.access}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
