// src/app/api/test-email/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 1. Connection verify karein
    await transporter.verify();

    // 2. Test email send karein
    const info = await transporter.sendMail({
      from: `"Pulse Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Khud ko hi test email bhejein
      subject: "Test Mail from Pulse Platform",
      text: "Agar yeh email mila hai, toh SMTP setup 100% working hai!",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Test Email Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}