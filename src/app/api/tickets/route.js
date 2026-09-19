// src/app/api/tickets/route.js
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { eventId, userName, userEmail, price } = body;

    if (!eventId || !userName || !userEmail) {
      return NextResponse.json(
        { error: "Event ID, Name, and Email are required" },
        { status: 400 }
      );
    }

    const passCode = "PULSE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newTicket = await Ticket.create({
      eventId: mongoose.Types.ObjectId.isValid(eventId)
        ? new mongoose.Types.ObjectId(eventId)
        : eventId,
      userName: userName.trim(),
      userEmail: userEmail.toLowerCase().trim(),
      price: price || 0,
      passCode,
      status: "CONFIRMED",
      checkedIn: false,
    });

    return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return NextResponse.json(
      { error: "Failed to book pass" },
      { status: 500 }
    );
  }
}