// src/app/events/[id]/page.jsx
"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  CreditCard, 
  Banknote,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventDetailPage({ params }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Payment Selection States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE_DUMMY");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Check logged-in user
    const storedUser = localStorage.getItem("pulse_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.name) setAttendeeName(parsed.name);
        if (parsed.email) setAttendeeEmail(parsed.email);
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleBookingClick = (e) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      alert("Please provide your name and email");
      return;
    }

    const price = Number(event?.price) || 0;
    if (price > 0) {
      setShowPaymentModal(true);
    } else {
      executeBooking("FREE");
    }
  };

  const executeBooking = async (selectedMethod) => {
    setBooking(true);
    setProcessingPayment(true);

    try {
      const res = await fetch("/api/tickets/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          attendeeName,
          attendeeEmail,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/tickets/${data.ticketId}`);
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setBooking(false);
      setProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!event || event.error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <p className="text-muted-foreground">Event not found.</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const price = Number(event.price) || 0;
  const isOrganizer = currentUser?.role === "ORGANIZER" || currentUser?.role === "ADMIN";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        {/* Dashboard button: Sirf Admin ya Organizer ko dikhega */}
        {isOrganizer && (
          <Link href={`/events/${eventId}/dashboard`}>
            <Button variant="outline" size="sm" className="text-xs border-violet-500/40 text-violet-300 hover:bg-violet-950/30 gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" /> Organizer Dashboard
            </Button>
          </Link>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted">
            <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" />
            <Badge className="absolute top-4 left-4 bg-violet-600 text-white">
              {event.category}
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5 text-violet-400 font-medium">
                <Calendar className="w-4 h-4" /> {event.date || "Upcoming"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {event.venue}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
            <h2 className="text-lg font-bold">About this Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right: Booking Pass Card */}
        <div className="space-y-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pass Price</span>
              <span className="text-2xl font-extrabold">
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>

            <form onSubmit={handleBookingClick} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alex Carter"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <Button
                type="submit"
                disabled={booking}
                className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold h-11"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
                  </>
                ) : price === 0 ? (
                  <>
                    <Ticket className="w-4 h-4 mr-2" /> Claim Free Pass
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" /> Proceed to Pay ₹{price}
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant digital ticket with verifiable QR pass</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seamless check-in at venue gate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-zinc-950 text-white shadow-2xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase">Checkout</span>
                  <h3 className="text-lg font-bold">Select Payment Option</h3>
                </div>
                <span className="text-lg font-bold text-emerald-400">₹{price}</span>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("ONLINE_DUMMY")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === "ONLINE_DUMMY"
                      ? "border-violet-500 bg-violet-950/20"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Pay Online (UPI / Card Simulator)</p>
                      {paymentMethod === "ONLINE_DUMMY" && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                    </div>
                    <p className="text-xs text-zinc-400">Instant digital pass confirmation via simulated gateway.</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("CASH_AT_GATE")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === "CASH_AT_GATE"
                      ? "border-amber-500 bg-amber-950/20"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Pay Cash at Gate</p>
                      {paymentMethod === "CASH_AT_GATE" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-zinc-400">Reserve spot now and pay cash at the venue gate desk.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processingPayment}
                  className="flex-1 border-zinc-800 text-xs"
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => executeBooking(paymentMethod)}
                  disabled={processingPayment}
                  className="flex-1 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-xs"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Processing...
                    </>
                  ) : paymentMethod === "ONLINE_DUMMY" ? (
                    `Pay ₹${price}`
                  ) : (
                    "Reserve (Pay at Gate)"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}