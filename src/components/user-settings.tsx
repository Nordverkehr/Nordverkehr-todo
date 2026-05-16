"use client";

import { useState } from "react";
import { Settings, X, LayoutGrid, ListFilter } from "lucide-react";
import { updateUserSettings } from "@/lib/actions/todo-actions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserSettingsProps {
  currentSettings: {
    filterLayout: string;
  };
}

export function UserSettings({ currentSettings }: UserSettingsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filterLayout, setFilterLayout] = useState(currentSettings.filterLayout || "tabs");

  const handleSave = async (layout: string) => {
    setFilterLayout(layout);
    await updateUserSettings({ filterLayout: layout });
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3.5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-white group relative"
        title="Account Einstellungen"
      >
        <Settings className="w-5 h-5" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Einstellungen</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Einstellungen</h3>
                  <p className="text-sm text-zinc-500 mt-1">Personalisiere dein Dashboard.</p>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Filter Layout</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSave("tabs")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                        filterLayout === "tabs"
                          ? "bg-white text-black border-white shadow-xl"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                      )}
                    >
                      <LayoutGrid className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">Standard (Tabs)</span>
                    </button>
                    <button
                      onClick={() => handleSave("dropdown")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                        filterLayout === "dropdown"
                          ? "bg-white text-black border-white shadow-xl"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                      )}
                    >
                      <ListFilter className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">Drop-Down Menü</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] text-zinc-600 uppercase font-black text-center tracking-widest">
                    Änderungen werden automatisch gespeichert
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
