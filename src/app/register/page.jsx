// src/app/register/page.jsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Mail, User, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Success hone par login par redirect
      router.push("/login?registered=true");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <Card className="border-border bg-card shadow-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
            <p className="text-xs text-muted-foreground">Join Pulse to host events and claim passes</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" /> Full Name
              </label>
              <Input
                type="text"
                required
                placeholder="Alex Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted/20 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-400" /> Email
              </label>
              <Input
                type="email"
                required
                placeholder="alex@example.com"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/20 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-xs h-10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}