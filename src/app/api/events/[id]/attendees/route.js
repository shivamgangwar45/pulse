// src/app/api/events/[id]/attendees/route.js
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const tickets = await Ticket.find({ eventId: id }).sort({ createdAt: -1 });

    const totalBooked = tickets.length;
    const checkedInCount = tickets.filter((t) => t.status === "CHECKED_IN").length;
    const pendingCount = totalBooked - checkedInCount;

    return NextResponse.json({
      event: {
        title: event.title,
        venue: event.venue,
        date: event.date,
        price: event.price,
        totalCapacity: event.totalCapacity || 100,
      },
      stats: {
        totalBooked,
        checkedInCount,
        pendingCount,
        checkInRate: totalBooked > 0 ? Math.round((checkedInCount / totalBooked) * 100) : 0,
      },
      attendees: tickets,
    });
  } catch (error) {
    console.error("Fetch Attendees Error:", error);
    return NextResponse.json({ error: "Failed to fetch event attendees" }, { status: 500 });
  }
}