// src/app/api/tickets/event/[id]/route.js
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    if (!eventId) {
      return NextResponse.json({ tickets: [] }, { status: 400 });
    }

    // Match both ObjectId and raw string so zero records get missed
    const queryConditions = [{ eventId: eventId }];
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      queryConditions.push({ eventId: new mongoose.Types.ObjectId(eventId) });
    }

    const tickets = await Ticket.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error) {
    console.error("Fetch Event Tickets Error:", error);
    return NextResponse.json({ tickets: [] }, { status: 500 });
  }
}