// src/app/api/tickets/[ticketId]/route.js
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { ticketId } = await params;

    const ticket = await Ticket.findById(ticketId).populate("eventId");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: ticket._id,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      status: ticket.status,
      event: ticket.eventId,
    });
  } catch (error) {
    console.error("Fetch Ticket Error:", error);
    return NextResponse.json({ error: "Invalid Ticket ID" }, { status: 500 });
  }
}