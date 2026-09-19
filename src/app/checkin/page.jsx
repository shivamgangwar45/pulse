// src/app/checkin/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScanLine, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CheckinPage() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef(null);

  const verifyTicket = async (ticketCode) => {
    if (!ticketCode.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tickets/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: ticketCode.trim().toUpperCase() }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setScanResult({ valid: false, message: "Network connection error" });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
    verifyTicket(manualCode);
  };

  useEffect(() => {
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        scanner.clear();
        verifyTicket(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanResult]);

  const handleResetScan = () => {
    setScanResult(null);
    setManualCode("");
    window.location.reload();
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-10 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Exit Scanner
      </Link>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <ScanLine className="w-6 h-6 text-violet-400" /> Gate Check-In
        </h1>
        <p className="text-xs text-muted-foreground">Scan QR pass or manually enter the ticket code</p>
      </div>

      {!scanResult && (
        <div className="space-y-4">
          {/* Manual Code Input Option */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-violet-400" /> Enter Pass Code Manually
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. PULSE-22DC5171"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="font-mono uppercase text-xs tracking-wider bg-muted/20"
                  />
                  <Button type="submit" disabled={loading || !manualCode.trim()} className="shrink-0 text-xs">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <span className="h-px bg-border flex-1" />
            <span>OR SCAN CAMERA</span>
            <span className="h-px bg-border flex-1" />
          </div>

          {/* Camera Scanner View */}
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-4">
              <div id="reader" className="w-full"></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Result Card */}
      {scanResult && (
        <Card
          className={`border ${
            scanResult.valid
              ? "border-emerald-500/50 bg-emerald-950/20"
              : "border-rose-500/50 bg-rose-950/20"
          }`}
        >
          <CardContent className="p-6 space-y-4 text-center">
            {scanResult.valid ? (
              <div className="space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <Badge className="bg-emerald-500 text-white font-bold">ACCESS GRANTED</Badge>
                <h3 className="text-xl font-bold">{scanResult.ticket?.attendeeName}</h3>
                <p className="text-xs text-muted-foreground">{scanResult.ticket?.eventId?.title}</p>
                <p className="text-xs font-mono text-zinc-400">{scanResult.ticket?.ticketCode}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <Badge className="bg-rose-500 text-white font-bold">ACCESS DENIED</Badge>
                <h3 className="text-lg font-bold">{scanResult.message}</h3>
                {scanResult.ticket && (
                  <p className="text-xs text-muted-foreground">Attendee: {scanResult.ticket.attendeeName}</p>
                )}
              </div>
            )}

            <Button onClick={handleResetScan} className="w-full gap-2 mt-4">
              <RefreshCw className="w-4 h-4" /> Next Check-In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}