"use client";

import { X, Tag, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TodoFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
  title: string;
  categories?: any[];
}

const priorities = [
  { value: "low", label: "Niedrig", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "normal", label: "Normal", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
  { value: "high", label: "Hoch", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { value: "urgent", label: "Dringend", color: "text-red-400 bg-red-400/10 border-red-400/20" },
];

export function TodoForm({ initialData, onSubmit, onClose, title, categories = [] }: TodoFormProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl glass rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-display">{title}</h3>
            <p className="text-zinc-500 text-sm mt-1">Alle Details deiner FiveM-Ressource.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <form action={async (formData) => {
          await onSubmit(formData);
          onClose();
        }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Name</label>
              <input
                name="title"
                required
                defaultValue={initialData?.title}
                placeholder="z.B. LB Phone"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Kategorie</label>
              <div className="relative">
                <select
                  name="category"
                  defaultValue={initialData?.category || "other"}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="mlo" className="bg-[#121212]">MLO / Map</option>
                  <option value="script" className="bg-[#121212]">Script</option>
                  <option value="vehicle" className="bg-[#121212]">Vehicle</option>
                  <option value="clothing" className="bg-[#121212]">Clothing</option>
                  <option value="ui" className="bg-[#121212]">UI / HUD</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug} className="bg-[#121212]">{cat.name}</option>
                  ))}
                  <option value="other" className="bg-[#121212]">Sonstiges</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Preis (€)</label>
              <div className="flex gap-3">
                <input
                  name="price"
                  defaultValue={initialData?.price}
                  placeholder="z.B. 19.99"
                  className="w-1/2 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600 font-mono"
                />
                <select
                  name="billingCycle"
                  defaultValue={initialData?.billingCycle || "once"}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer text-xs font-bold"
                >
                  <option value="once" className="bg-[#121212]">Einmalig</option>
                  <option value="monthly" className="bg-[#121212]">Monatlich</option>
                  <option value="quarterly" className="bg-[#121212]">Vierteljährlich</option>
                  <option value="semi-annually" className="bg-[#121212]">Halbjährlich</option>
                  <option value="yearly" className="bg-[#121212]">Jährlich</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "pending"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer font-bold"
              >
                <option value="pending" className="bg-[#121212] text-yellow-500">Ausstehend</option>
                <option value="in_progress" className="bg-[#121212] text-blue-500">In Arbeit</option>
                <option value="completed" className="bg-[#121212] text-emerald-500">Gekauft</option>
                <option value="planned" className="bg-[#121212] text-purple-400">geplant</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Priorität</label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((p) => (
                <label key={p.value} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    defaultChecked={initialData?.priority === p.value || (!initialData && p.value === "normal")}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    "px-3 py-2.5 rounded-xl border text-center text-xs font-bold transition-all",
                    "border-white/5 bg-white/5 text-zinc-500 group-hover:bg-white/10",
                    "peer-checked:bg-white peer-checked:text-black peer-checked:border-white"
                  )}>
                    {p.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Tags (mit Komma trennen)
            </label>
            <input
              name="tags"
              defaultValue={initialData?.tags}
              placeholder="performance, optimized, server-side"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Preview URL</label>
              <input
                name="previewUrl"
                defaultValue={initialData?.previewUrl}
                placeholder="YouTube Link"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Store URL</label>
              <input
                name="storeUrl"
                defaultValue={initialData?.storeUrl}
                placeholder="Shop Link"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Beschreibung</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description}
              placeholder="Zusätzliche Infos zum Script oder MLO..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-white text-black hover:bg-zinc-200 transition-all rounded-2xl font-bold mt-4 shadow-xl shadow-white/5 active:scale-[0.98]"
          >
            Aufgabe Speichern
          </button>
        </form>
      </motion.div>
    </div>
  );
}
