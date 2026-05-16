"use client";

import { signIn } from "next-auth/react";
import { LogIn, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 glass rounded-3xl"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <Gamepad2 className="w-12 h-12 text-purple-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-display tracking-tight">
              FiveM <span className="text-purple-500">ToDo</span>
            </h1>
            <p className="text-zinc-400 font-sans">
              Die ultimative Verwaltung für dein Projekt.
            </p>
          </div>

          <button
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            className="group relative flex items-center justify-center w-full py-4 px-6 bg-[#5865F2] hover:bg-[#4752C4] transition-all duration-300 rounded-xl font-semibold overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogIn className="w-5 h-5 mr-3 transition-transform group-hover:translate-x-1" />
            <span>Mit Discord anmelden</span>
          </button>

          <p className="text-xs text-zinc-500 font-sans">
            Durch das Anmelden akzeptierst du unsere Nutzungsbedingungen.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
