// src/models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    venue: { type: String, required: true },
    price: { type: String, default: "0" },
    coverUrl: { type: String, required: true },
    date: { type: String, default: "Upcoming" },
    totalCapacity: { type: Number, default: 100 },
    bookedSeats: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);