// src/app/events/[id]/dashboard/page.jsx
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Ticket,
  QrCode,
  Loader2,
  ShieldAlert,
  Search,
} from "lucide-react";

export default function EventDashboardPage({ params }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Auth Guard: Check if user is logged in and has ORGANIZER/ADMIN role
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
    setAuthChecking(false);
  }, []);

  // 2. Fetch Event & Attendee Tickets data
  useEffect(() => {
    if (!currentUser) return;
    const isOrganizer =
      currentUser.role === "ORGANIZER" || currentUser.role === "ADMIN";
    if (!isOrganizer) return;

    async function loadDashboardData() {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/tickets/event/${eventId}`),
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData);
        }

        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData.tickets || []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [eventId, currentUser]);

  if (authChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Restrict access if not logged in or role is not ORGANIZER/ADMIN
  const isOrganizer =
    currentUser?.role === "ORGANIZER" || currentUser?.role === "ADMIN";

  if (!currentUser || !isOrganizer) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Only event organizers and admins can access this dashboard. Please sign in
          with an authorized organizer account.
        </p>
        <Link href="/login">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
            Sign In as Organizer
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Metrics calculations
  const totalBooked = tickets.length;
  const checkedInCount = tickets.filter((t) => t.status === "CHECKED_IN").length;
  const pendingCount = totalBooked - checkedInCount;
  const checkInRate = totalBooked > 0 ? Math.round((checkedInCount / totalBooked) * 100) : 0;

  // Search filter for attendees
  const filteredTickets = tickets.filter(
    (t) =>
      t.attendeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.attendeeEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Page
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {event?.title || "Event Dashboard"}
            </h1>
            <Badge className="bg-violet-600/20 text-violet-400 border border-violet-500/30 text-[10px]">
              Organizer Access
            </Badge>
          </div>
        </div>

        <Link href="/checkin">
          <Button size="sm" className="gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs">
            <QrCode className="w-3.5 h-3.5" /> Open Gate Scanner
          </Button>
        </Link>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total Passes</span>
              <h3 className="text-2xl font-black">{totalBooked}</h3>
            </div>
            <Ticket className="w-8 h-8 text-violet-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Checked In</span>
              <h3 className="text-2xl font-black text-emerald-400">{checkedInCount}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Pending Entry</span>
              <h3 className="text-2xl font-black text-amber-400">{pendingCount}</h3>
            </div>
            <Clock className="w-8 h-8 text-amber-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Turnout Rate</span>
              <h3 className="text-2xl font-black">{checkInRate}%</h3>
            </div>
            <Users className="w-8 h-8 text-blue-400 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* Attendee Roster Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">Attendee Roster</h2>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search attendee, email, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-muted/20 pl-9 pr-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Pass Code</th>
                <th className="py-3 px-4">Attendee</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Check-In Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No attendee records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-violet-400">
                      {t.ticketCode}
                    </td>
                    <td className="py-3 px-4 font-medium">{t.attendeeName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{t.attendeeEmail}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {t.paymentMethod === "CASH_AT_GATE"
                          ? "Cash (Gate)"
                          : t.paymentMethod === "ONLINE_DUMMY"
                          ? "Online"
                          : "Free"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          t.status === "CHECKED_IN"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}
                      >
                        {t.status === "CHECKED_IN" ? "Checked In" : "Confirmed"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {t.checkedInAt
                        ? new Date(t.checkedInAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}