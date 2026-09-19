// src/app/api/auth/login/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. HARDCODED ORGANIZER / ADMIN CHECK
    if (cleanEmail === "admin@gmail.com" && password === "adminpass123") {
      return NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: "admin_super_id",
          name: "Admin Host",
          email: "admin@gmail.com",
          role: "ORGANIZER", // <--- Sirf isko Organizer milega
        },
      });
    }

    // 2. NORMAL USERS VIA DATABASE
    await connectDB();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Normal users strictly get USER role
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "USER", // <--- Baaki sab strictly Normal User
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}