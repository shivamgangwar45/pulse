// src/app/my-events/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  QrCode,
  ShieldAlert
} from "lucide-react";

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pulse_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (err) {
        console.error("Auth parse error:", err);
      }
    }

    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isOrganizer = currentUser?.role === "ORGANIZER" || currentUser?.role === "ADMIN";

  if (!currentUser || !isOrganizer) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Organizer Access Required</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You need an authorized Host or Organizer account to manage events.
        </p>
        <Link href="/login">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
            Sign In as Host
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-violet-400" /> Organizer Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your live events, monitor turnouts, and oversee gate desks.
          </p>
        </div>

        <Link href="/events/create">
          <Button size="sm" className="gap-1.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs">
            <Sparkles className="w-3.5 h-3.5" /> Create New Event
          </Button>
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <LayoutDashboard className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold">No active events found</h3>
            <p className="text-xs text-muted-foreground">
              Generate an event using AI to start managing ticket passes.
            </p>
          </div>
          <Link href="/events/create">
            <Button size="sm" className="bg-violet-600 text-white text-xs">
              Create Event with AI
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <Card key={ev._id} className="border-border bg-card hover:border-border/80 transition-all overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/30 text-[10px]">
                    {ev.category || "Event"}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {Number(ev.price) === 0 ? "Free Entry" : `₹${ev.price}`}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold line-clamp-1">{ev.title}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{ev.date || "Upcoming"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="line-clamp-1">{ev.venue || "Venue Unspecified"}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="border-t border-border/40 pt-4 flex gap-2">
                  <Link href={`/events/${ev._id}/dashboard`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Event Dashboard
                    </Button>
                  </Link>

                  <Link href="/checkin">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" title="Scan Tickets">
                      <QrCode className="w-3.5 h-3.5 text-violet-400" />
                    </Button>
                  </Link>

                  <Link href={`/events/${ev._id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground px-2" title="Public Page">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}