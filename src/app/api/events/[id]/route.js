// src/app/api/events/[id]/route.js
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // Try finding by ObjectId or string id
    let event = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).lean();
    }
    
    if (!event) {
      event = await Event.findOne({ _id: id }).lean();
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Real-time tickets count
    const registeredCount = await Ticket.countDocuments({
      $or: [
        { eventId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ eventId: new mongoose.Types.ObjectId(id) }] : []),
      ],
    });

    return NextResponse.json({
      ...event,
      registeredCount,
      attendingCount: registeredCount,
    });
  } catch (error) {
    console.error("Fetch Event Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}