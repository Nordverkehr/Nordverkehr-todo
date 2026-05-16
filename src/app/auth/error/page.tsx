"use client";

import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const isAccessDenied = error === "AccessDenied" || error === "Configuration";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 glass rounded-[2.5rem] border-white/5"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="p-5 bg-red-500/10 rounded-3xl border border-red-500/20">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-black tracking-tight text-white">
              Zugriff <span className="text-red-500">verweigert</span>
            </h1>
            <p className="text-zinc-400 font-medium text-lg">
              {isAccessDenied
                ? "Du hast nicht die erforderliche Discord-Rolle um dich anzumelden."
                : "Ein unerwarteter Fehler ist aufgetreten."}
            </p>
            {isAccessDenied && (
              <p className="text-zinc-600 text-sm mt-1">
                Stelle sicher, dass du die benötigte Rolle auf dem Discord-Server hast.
              </p>
            )}
          </div>

          <Link
            href="https://todo.jannikjbi.de"
            className="group relative flex items-center justify-center w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 rounded-2xl font-bold overflow-hidden"
          >
            <ArrowLeft className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
            <span>Zurück zur Startseite</span>
          </Link>

          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
            Fehlercode: {error || "Unknown"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
