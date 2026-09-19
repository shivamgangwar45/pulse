// src/app/my-tickets/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  QrCode,
  AlertCircle
} from "lucide-react";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pulse_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchTickets(parsed.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTickets = async (email) => {
    try {
      const res = await fetch(`/api/tickets/my-tickets?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-muted-foreground">
          Please log in to view all your registered event passes and QR tickets.
        </p>
        <Link href="/login">
          <Button className="bg-linear-to-r from-violet-600 to-indigo-600 text-white text-xs">
            Sign In Now
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-violet-400" /> My Passes & Tickets
          </h1>
          <p className="text-xs text-muted-foreground">
            Registered with: <strong className="text-foreground">{user.email}</strong>
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Discover More Events
          </Button>
        </Link>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <Ticket className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold">No tickets reserved yet</h3>
            <p className="text-xs text-muted-foreground">
              You haven&apos;t claimed passes for any upcoming events yet.
            </p>
          </div>
          <Link href="/">
            <Button size="sm" className="bg-violet-600 text-white text-xs">
              Explore Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tickets.map((t) => {
            const ev = t.eventId || {};
            const isCheckedIn = t.status === "CHECKED_IN";

            return (
              <Card key={t._id} className="border-border bg-card hover:border-border/80 transition-all overflow-hidden flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-violet-300 bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-800/40">
                      {t.ticketCode}
                    </span>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        isCheckedIn
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {isCheckedIn ? "Checked-In" : "Valid Entry Pass"}
                    </Badge>
                  </div>

                  {/* Title & Details */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold line-clamp-1">
                      {ev.title || "Special Event Pass"}
                    </h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{ev.date || "Upcoming"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="line-clamp-1">{ev.venue || "Venue Details on Pass"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Attendee Metadata */}
                  <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Payment:{" "}
                      <strong className="text-foreground">
                        {t.paymentMethod === "CASH_AT_GATE"
                          ? "Cash at Gate"
                          : t.paymentMethod === "ONLINE_DUMMY"
                          ? "Paid Online"
                          : "Free Pass"}
                      </strong>
                    </span>
                    <span>Attendee: <strong className="text-foreground">{t.attendeeName}</strong></span>
                  </div>

                  {/* View Pass Button */}
                  <Link href={`/tickets/${t._id}`} className="block pt-1">
                    <Button variant="secondary" size="sm" className="w-full gap-2 text-xs font-semibold">
                      <QrCode className="w-3.5 h-3.5 text-violet-400" />
                      View QR Pass & Print
                      <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}