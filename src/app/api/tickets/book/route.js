// src/app/api/tickets/book/route.js
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import { sendTicketEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const { eventId, attendeeName, attendeeEmail, paymentMethod } = await req.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const price = Number(event.price) || 0;
    const isFree = price === 0;

    const selectedMethod = isFree ? "FREE" : paymentMethod || "ONLINE_DUMMY";
    const paymentStatus = isFree
      ? "FREE"
      : selectedMethod === "CASH_AT_GATE"
      ? "PENDING_CASH"
      : "PAID";

    const uniqueHash = `PULSE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const newTicket = await Ticket.create({
      ticketCode: uniqueHash,
      eventId,
      attendeeName,
      attendeeEmail,
      paymentMethod: selectedMethod,
      paymentStatus,
      amountPaid: isFree ? 0 : price,
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { bookedSeats: 1 } });

    // Background Email Send (Non-blocking)
    sendTicketEmail({
      toEmail: attendeeEmail,
      attendeeName,
      eventTitle: event.title || "Pulse Event",
      eventVenue: event.venue || "TBD",
      eventDate: event.date || "Upcoming",
      ticketCode: uniqueHash,
    }).catch((err) => console.error("Background email send error:", err));

    return NextResponse.json({
      success: true,
      ticketId: newTicket._id,
      ticketCode: newTicket.ticketCode,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to book ticket" },
      { status: 500 }
    );
  }
}