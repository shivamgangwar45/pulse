// src/app/api/tickets/my-tickets/route.js
import { connectDB } from "@/lib/db";
import "@/models/Event"; // Event schema preload karna zaroori hai populate ke liye
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email query param is required" }, { status: 400 });
    }

    const tickets = await Ticket.find({
      attendeeEmail: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    })
      .populate("eventId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("My Tickets Error:", error);
    return NextResponse.json({ error: "Failed to fetch user tickets" }, { status: 500 });
  }
}