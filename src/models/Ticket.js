// src/models/Ticket.js
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, required: true, unique: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    attendeeName: { type: String, required: true },
    attendeeEmail: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["FREE", "ONLINE_DUMMY", "CASH_AT_GATE"],
      default: "FREE",
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING_CASH", "FREE"],
      default: "FREE",
    },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["CONFIRMED", "CHECKED_IN", "CANCELLED"],
      default: "CONFIRMED",
    },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);