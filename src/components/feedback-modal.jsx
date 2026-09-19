// src/components/feedback-modal.jsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareQuote, CheckCircle2, Loader2 } from "lucide-react";

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setEmail("");
        setOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* asChild hata kar seedha DialogTrigger ko button ki tarah style kar diya */}
      <DialogTrigger className="hover:text-violet-400 transition-colors flex items-center gap-1.5 text-xs text-muted-foreground text-left cursor-pointer bg-transparent border-0 p-0">
        <MessageSquareQuote className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        Feedback & Suggestions
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-violet-400" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold">Thank you for your thoughts!</p>
            <p className="text-xs text-muted-foreground">Your suggestion helps improve Pulse.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Your Email (Optional)
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/20 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Feedback or Feature Idea
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Tell us what you liked or what features we should add..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-muted/20 text-xs resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold h-9"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}