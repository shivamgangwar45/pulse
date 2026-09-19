// src/app/api/tickets/user/route.js
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const tickets = await Ticket.find({
      attendeeEmail: { $regex: new RegExp(`^${email}$`, "i") },
    })
      .populate("eventId")
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Fetch User Tickets Error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}