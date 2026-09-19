// src/app/login/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Mail, Loader2, Sparkles, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("USER"); // "USER" | "ORGANIZER"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setRegisteredSuccess(true);
    }
  }, [searchParams]);

  // Tab switch karne par inputs hamesha clean/blank rahenge
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API route not found. Please try again.");
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save user session
      localStorage.setItem("pulse_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("pulse_auth_change"));
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <Card className="border-border bg-card shadow-xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
            <p className="text-xs text-muted-foreground">Select your account portal below</p>
          </div>

          {/* Sliding Portal Switcher */}
          <div className="relative p-1 bg-muted/40 rounded-xl flex items-center border border-border/50">
            <button
              type="button"
              onClick={() => handleTabChange("USER")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === "USER"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Attendee
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ORGANIZER")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === "ORGANIZER"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Host Desk
            </button>
          </div>

          {registeredSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Account created successfully! Please sign in below.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-400" /> Email
              </label>
              <Input
                type="email"
                required
                placeholder={activeTab === "ORGANIZER" ? "host@organization.com" : "you@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/20 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-violet-400" /> Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/20 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold text-xs h-10 transition-all ${
                activeTab === "ORGANIZER"
                  ? "bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/30"
                  : "bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : activeTab === "ORGANIZER" ? (
                "Sign In as Host"
              ) : (
                "Sign In as Attendee"
              )}
            </Button>
          </form>

          {activeTab === "USER" && (
            <div className="text-center pt-2 text-xs text-muted-foreground border-t border-border/40">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-violet-400 hover:underline font-semibold">
                Sign Up
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}