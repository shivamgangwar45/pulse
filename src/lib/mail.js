// src/lib/mail.js
import nodemailer from "nodemailer";
import QRCode from "qrcode";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTicketEmail({
  toEmail,
  attendeeName,
  eventTitle,
  eventVenue,
  eventDate,
  ticketCode,
}) {
  try {
    console.log("[Mail] Generating QR code for:", ticketCode);
    const qrBuffer = await QRCode.toBuffer(ticketCode, {
      width: 300,
      margin: 2,
    });

    console.log("[Mail] Sending email via Nodemailer to:", toEmail);

    const info = await transporter.sendMail({
      from: `"Pulse Events" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🎟️ Entry Pass: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 480px; margin: auto;">
          <h2 style="color: #a855f7; margin-bottom: 8px;">Official Entry Pass</h2>
          <h1 style="font-size: 20px; margin-top: 0;">${eventTitle}</h1>
          <p>Hi <strong>${attendeeName}</strong>, your spot is confirmed!</p>
          
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; display: inline-block; margin: 16px 0;">
            <img src="cid:ticketqr" alt="Ticket QR" style="width: 200px; height: 200px; display: block;" />
            <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #000; margin-top: 8px;">${ticketCode}</div>
          </div>

          <div style="border-top: 1px solid #27272a; padding-top: 12px; font-size: 13px; color: #a1a1aa;">
            <p style="margin: 4px 0;"><strong>Date:</strong> ${eventDate || "Upcoming"}</p>
            <p style="margin: 4px 0;"><strong>Venue:</strong> ${eventVenue || "TBD"}</p>
          </div>
          <p style="font-size: 12px; color: #71717a; margin-top: 16px;">Show this QR code at the gate for instant entry.</p>
        </div>
      `,
      attachments: [
        {
          filename: `pass-${ticketCode}.png`,
          content: qrBuffer,
          cid: "ticketqr",
        },
      ],
    });

    console.log("[Mail] Email delivered successfully! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("[Mail Error] Failed to send ticket email:", error);
    throw error;
  }
}