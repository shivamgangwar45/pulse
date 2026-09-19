// src/app/api/events/route.js
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();

    // Har event ke liye real ticket count fetch karein
    const eventsWithRealCount = await Promise.all(
      events.map(async (event) => {
        const count = await Ticket.countDocuments({
          $or: [{ eventId: event._id }, { eventId: event._id.toString() }],
        });

        return {
          ...event,
          attendingCount: count,
        };
      })
    );

    return NextResponse.json(eventsWithRealCount);
  } catch (error) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}