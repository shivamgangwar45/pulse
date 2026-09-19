// src/app/tickets/[ticketId]/page.jsx
"use client";

import { useEffect, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft, Download, Loader2, Ticket } from "lucide-react";
import Link from "next/link";

export default function TicketPassPage({ params }) {
  const unwrappedParams = use(params);
  const ticketId = unwrappedParams.ticketId;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch ticket and user status
  useEffect(() => {
    // 1. Check Logged-In User
    const storedUser = localStorage.getItem("pulse_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }

    // 2. Fetch Ticket Details
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!ticket || ticket.error) {
    return (
      <div className="container mx-auto max-w-md py-20 text-center space-y-4">
        <p className="text-muted-foreground">Ticket pass not found.</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Ticket Pass Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header Ribbon */}
        <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-6 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Official Entry Pass</span>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">
              {ticket.status}
            </Badge>
          </div>
          <h2 className="text-xl font-black leading-tight line-clamp-2">{ticket.event?.title}</h2>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black shadow-inner space-y-2">
            <QRCodeSVG value={ticket.ticketCode} size={180} level="H" includeMargin={true} />
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-600">
              {ticket.ticketCode}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Attendee</span>
              <strong className="text-sm font-semibold truncate block">{ticket.attendeeName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Category</span>
              <strong className="text-sm font-semibold truncate block">{ticket.event?.category || "General"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Date</span>
              <strong className="font-medium text-violet-400 block">{ticket.event?.date || "Upcoming"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Venue</span>
              <strong className="font-medium text-foreground truncate block">{ticket.event?.venue}</strong>
            </div>
          </div>

          {/* Conditional Actions based on Login Status */}
          {currentUser ? (
            <div className="space-y-3">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="w-full gap-2 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Save / Print Pass
              </Button>
              
              <Link href="/my-tickets">
                <Button variant="secondary" className="w-full gap-2 text-xs font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20">
                  <Ticket className="w-4 h-4" /> View All My Passes
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-center space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log in to download your ticket as a PDF and access all your event passes in one place.
              </p>
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Sign In to Access Options
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}