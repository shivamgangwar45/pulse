// src/app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Calendar, Users, ArrowRight, Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Technology", "Music", "Design", "Networking", "Workshops"];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Category filtering logic
  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter((e) => e.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-b from-muted/30 to-background p-8 md:p-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>AI-Powered Event Hosting & Instant Discovery</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Host memorable moments. <br />
          <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Powered by Intelligence.
          </span>
        </h1>

        <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
          Generate complete event pages in seconds with AI, manage registrations seamlessly, and issue instant digital QR passes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/events/create">
            <Button size="lg" className="gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg">
              <Sparkles className="w-4 h-4" />
              Create Event with AI
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline" className="gap-2">
              Explore Events <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Filter Pills & Location Tag */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border/60 rounded-full px-3 py-1.5 bg-muted/20">
          <MapPin className="w-3.5 h-3.5 text-violet-400" />
          <span>Showing around: <strong className="text-foreground font-semibold">India</strong></span>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Trending Events</h2>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm">Fetching latest events from Pulse database...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl space-y-3">
            <p className="text-muted-foreground text-sm">No events have been published in this category yet.</p>
            <Link href="/events/create">
              <Button size="sm" variant="outline" className="text-xs">
                Create the First Event →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              // Real ticket count preference
              const liveCount = event.attendingCount ?? event.registeredCount ?? event.bookedSeats ?? 0;

              return (
                <div
                  key={event._id || event.id}
                  className="group overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-border transition-all duration-300 hover:shadow-xl flex flex-col"
                >
                  {/* Cover Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={event.coverUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"}
                      alt={event.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px]">
                      {event.price === "0" || !event.price ? "Free" : `₹${event.price}`}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-violet-600/90 text-white text-[10px]">
                      {event.category || "General"}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date || "Upcoming"}</span>
                      </div>
                      <h3 className="font-bold text-base line-clamp-1 group-hover:text-violet-400 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.venue || "Online / TBD"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {liveCount} attending
                      </span>
                      <Link href={`/events/${event._id || event.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-foreground hover:text-violet-400 px-2">
                          Get Pass →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}