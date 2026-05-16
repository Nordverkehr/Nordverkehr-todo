"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Code2, 
  Car, 
  User as UserIcon, 
  Layout, 
  Package,
  ChevronRight,
  Settings as SettingsIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "MLOs", href: "/dashboard/mlo", icon: Map },
  { name: "Scripts", href: "/dashboard/scripts", icon: Code2 },
  { name: "Autos", href: "/dashboard/vehicles", icon: Car },
  { name: "Kleidung", href: "/dashboard/clothing", icon: UserIcon },
  { name: "UI / HUD", href: "/dashboard/ui", icon: Layout },
  { name: "Sonstiges", href: "/dashboard/other", icon: Package },
  { name: "Einstellungen", href: "/dashboard/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-white/5 bg-[#080808]/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <img 
            src="/icon.png" 
            alt="Logo" 
            className="w-12 h-12 rounded-2xl shadow-lg shadow-purple-500/20 rotate-3 object-cover"
          />
          <span className="font-display text-2xl tracking-tighter font-black">FiveM <span className="text-purple-500">ToDo</span></span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-6 ml-2">Menü</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 border",
                isActive 
                  ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                  : "bg-transparent text-zinc-500 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-zinc-600 group-hover:text-purple-400")} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </div>
              {isActive && (
                <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 bg-black rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
          <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs text-zinc-400 font-medium">Alle Systeme online.</p>
        </div>
      </div>
    </aside>
  );
}

import { motion } from "framer-motion";
