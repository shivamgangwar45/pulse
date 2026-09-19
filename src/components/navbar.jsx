// src/components/navbar.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Search, LogIn, LogOut, User, Ticket, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);

  const checkUser = () => {
    try {
      const storedUser = localStorage.getItem("pulse_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Failed to parse stored user", err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkUser();

    // Listen to custom internal event & cross-tab storage changes
    window.addEventListener("pulse_auth_change", checkUser);
    window.addEventListener("storage", checkUser);

    return () => {
      window.removeEventListener("pulse_auth_change", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pulse_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("pulse_auth_change"));
    window.location.href = "/login";
  };

  const isOrganizer = currentUser?.role === "ORGANIZER" || currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-black">
            P
          </div>
          <span>Pulse</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Explore
          </Link>
          <Link href="/my-tickets" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Ticket className="w-4 h-4" /> My Tickets
          </Link>
          {isOrganizer && (
            <>
              <Link href="/checkin" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Gate Scanner
              </Link>
              <Link href="/my-events" className="hover:text-violet-400 text-violet-400/90 transition-colors flex items-center gap-1.5 font-semibold">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons & Auth Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/events/create">
            <Button size="sm" className="gap-1.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create with AI</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300">
                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] text-white uppercase font-bold">
                  {currentUser.name ? currentUser.name.charAt(0) : <User className="w-3 h-3" />}
                </div>
                <span className="max-w-24 truncate hidden md:inline">{currentUser.name}</span>
                {isOrganizer && (
                  <span className="text-[9px] bg-violet-700/60 px-1.5 py-0.5 rounded text-white font-mono">
                    HOST
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log Out"
                className="text-muted-foreground hover:text-rose-400 h-8 w-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}