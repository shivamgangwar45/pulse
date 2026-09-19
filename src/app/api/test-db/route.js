// src/app/api/test-db/route.js
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const state = mongoose.connection.readyState;
    
    // readyState: 1 ka matlab connected hota hai
    if (state === 1) {
      return NextResponse.json({ 
        success: true, 
        message: "Database Connected!", 
        dbName: mongoose.connection.name 
      });
    } else {
      return NextResponse.json({ success: false, message: "Connecting or Disconnected", state }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}