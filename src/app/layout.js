// src/app/layout.js
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { FeedbackModal } from "@/components/feedback-modal";
import Link from "next/link";
import { Sparkles, Mail } from "lucide-react";

export const metadata = {
  title: "Pulse — Discover & Host Exceptional Events",
  description: "AI-powered event management and discovery platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col justify-between selection:bg-violet-500 selection:text-white">
        <Navbar />

        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-border/40 bg-card/20 backdrop-blur-md pt-12 pb-8 mt-20">
          <div className="container mx-auto max-w-6xl px-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
              {/* Brand & About */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-foreground">
                    Pulse
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  An AI-first event platform designed to effortlessly discover, host, and manage live meetups, tech workshops, and conferences with digital QR ticketing.
                </p>
              </div>

              {/* Navigation & Explore */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-xs tracking-wider uppercase">
                  Explore
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link href="/explore" className="hover:text-foreground transition-colors">
                      Browse Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/events/create"
                      className="hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-violet-400" /> Host with AI
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-tickets" className="hover:text-foreground transition-colors">
                      My Tickets
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Community & Feedback */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-xs tracking-wider uppercase">
                  Community & Support
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <FeedbackModal />
                  </li>
                  <li>
                    <a
                      href="mailto:support@pulseevents.io?subject=Help with Ticket"
                      className="hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Help Desk
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Attribution */}
            <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>
                © {new Date().getFullYear()}{" "}
                <span className="text-foreground font-semibold">Shivam Gangwar</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-1 text-[11px]">
                Built with Next.js & MongoDB
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}