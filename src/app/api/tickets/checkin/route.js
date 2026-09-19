// src/app/api/tickets/checkin/route.js
import { connectDB } from "@/lib/db";
import "@/models/Event"; // Event model explicitly load karna zaroori hai
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const ticketCode = body?.ticketCode?.trim();

    if (!ticketCode) {
      return NextResponse.json({ valid: false, message: "Ticket code is required" }, { status: 400 });
    }

    // Ticket find karein (case-insensitive query)
    const ticket = await Ticket.findOne({
      ticketCode: { $regex: new RegExp(`^${ticketCode}$`, "i") },
    }).populate("eventId");

    if (!ticket) {
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid Pass: No ticket found with this code!" 
      }, { status: 404 });
    }

    // Agar pehle se checked in ho chuka ho
    if (ticket.status === "CHECKED_IN") {
      return NextResponse.json({
        valid: false,
        alreadyUsed: true,
        message: `Already Checked-In at ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : "earlier"}`,
        ticket,
      });
    }

    // Direct atomic update
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      { 
        $set: { 
          status: "CHECKED_IN", 
          checkedInAt: new Date() 
        } 
      },
      { new: true }
    ).populate("eventId");

    return NextResponse.json({
      valid: true,
      message: "Check-in Successful! Welcome to the event.",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Check-in Server Error:", error);
    return NextResponse.json({ valid: false, message: error.message || "Server Error" }, { status: 500 });
  }
}