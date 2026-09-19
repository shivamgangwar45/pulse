// src/app/events/create/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    description: "",
    venue: "",
    price: "0",
    date: "Upcoming Weekend",
    coverUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  });

  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          title: data.title || prev.title,
          category: data.category || prev.category,
          description: data.description || prev.description,
          venue: data.suggestedVenue || prev.venue,
          coverUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in the title and description before publishing.");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to publish event");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Create a New Event</h1>
        <p className="text-muted-foreground text-sm">
          Fill in the details manually, or describe your event and let AI generate everything.
        </p>
      </div>

      {/* AI Prompt Box */}
      <Card className="border-violet-500/30 bg-violet-950/10 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
            <Sparkles className="w-4 h-4" />
            <span>Generate with AI Magic</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g., 2-day MERN stack workshop in Bangalore this weekend with 50 seats..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-background/80 border-border"
            />
            <Button
              type="button"
              onClick={handleGenerateAI}
              disabled={loading || !prompt}
              className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shrink-0 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Auto-Fill
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your event a punchy title"
              className="bg-muted/20 text-base font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Technology, Music, etc."
                className="bg-muted/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0 for Free"
                className="bg-muted/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venue / Location</label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Where will it take place?"
              className="bg-muted/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell attendees what to expect..."
              className="w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Connected Clickable Publish Button */}
          <Button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-12 cursor-pointer"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Publishing to Pulse...
              </>
            ) : (
              "Publish Event"
            )}
          </Button>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Preview</label>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="relative aspect-video w-full bg-muted">
              <img src={formData.coverUrl} alt="Cover Preview" className="h-full w-full object-cover" />
              <Badge className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px]">
                {formData.price === "0" || !formData.price ? "Free" : `₹${formData.price}`}
              </Badge>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-xs text-violet-400 font-semibold">{formData.category || "Category"}</span>
              <h3 className="font-bold text-sm line-clamp-1">{formData.title || "Your Event Title Here"}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {formData.description || "Event description preview will appear here as you type..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}