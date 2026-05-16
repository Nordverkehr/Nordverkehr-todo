"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { 
  ArrowRight, 
  Layers, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard,
  Gamepad2,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const lightX = useSpring(mouseX, springConfig);
  const lightY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-[#020202] overflow-x-hidden text-zinc-100 selection:bg-purple-500/30">
      {/* Interactive Background Light */}
      <motion.div 
        style={{ x: lightX, y: lightY }}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
      />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-10 mix-blend-overlay" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-2.5 bg-zinc-900 rounded-xl border border-white/10">
              <Gamepad2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <span className="text-2xl font-display font-black tracking-tighter uppercase italic">
            Nord<span className="text-purple-500">Verkehr</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/login" 
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Member Login</span>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-24 pb-40 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 mb-10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Premium FiveM Tool</span>
        </motion.div>

        <div className="relative">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-[9rem] font-display font-black tracking-tighter mb-10 leading-[0.85] uppercase italic"
          >
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">Management.</span>
          </motion.h1>
          
          {/* Animated Glow behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/5 blur-[120px] -z-10" />
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-400 text-lg md:text-2xl max-w-3xl mb-16 font-medium leading-tight"
        >
          Hebe dein Projekt auf das nächste Level. Organisiere MLOs, Scripts und Fahrzeuge mit der fortschrittlichsten Architektur für FiveM.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link
            href="/login"
            className="group relative px-12 py-5 bg-purple-600 text-white rounded-2xl font-black flex items-center transition-all hover:scale-105 hover:bg-purple-500 shadow-[0_20px_50px_rgba(168,85,247,0.3)] active:scale-95"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center transition-all backdrop-blur-md active:scale-95"
          >
            Explore Dashboard
          </Link>
        </motion.div>
      </section>

      {/* Features Grid with Hover Effects */}
      <section className="relative z-20 py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Rapid Performance"
            description="Ladezeiten unter 50ms durch optimierte Server-Side-Architecture."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6" />}
            title="Full Organization"
            description="Strukturiere jedes Asset, von Kleidung bis zu komplexen MLO-Sets."
            delay={0.4}
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Encrypted Flow"
            description="Deine Projektdaten sind durch modernste Security-Layer geschützt."
            delay={0.5}
          />
        </div>
      </section>

      {/* Announcement / Community Bar */}
      <section className="relative z-20 py-24 px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group p-12 rounded-[3rem] bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Coming Soon?</span>
            </div>
            <p className="text-2xl md:text-3xl font-display font-black leading-tight text-white/90 mb-8 max-w-2xl italic">
              "Vielleicht wird dieses Projekt bald für alle freigegeben. Wer weiß? Werde Teil der Community!"
            </p>
            <Link 
              href="https://discord.gg/rrS9vKqEQA" 
              target="_blank"
              className="flex items-center space-x-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#5865F2]/20"
            >
              <span>Join Discord</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-16 px-8 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center space-x-3 opacity-50">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-tighter italic">NordVerkehr</span>
          </div>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} JannikJBI | Engineering Excellence
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group p-10 rounded-[3rem] bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="p-4 bg-zinc-900 border border-white/10 rounded-2xl w-fit text-purple-500 mb-8 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          {icon}
        </div>
        <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight">{title}</h3>
        <p className="text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">{description}</p>
      </div>
    </motion.div>
  );
}
