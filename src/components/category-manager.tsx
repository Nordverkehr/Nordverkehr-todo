"use client";

import { useState } from "react";
import { FolderPlus, Trash2, X, Plus } from "lucide-react";
import { addCategory, deleteCategory } from "@/lib/actions/todo-actions";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryManagerProps {
  initialCategories: any[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addCategory(newName, "#8b5cf6");
    setNewName("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3.5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-white group relative"
        title="Kategorien verwalten"
      >
        <FolderPlus className="w-5 h-5" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Kategorien</span>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">Kategorien verwalten</h3>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Neue Kategorie..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {initialCategories.length === 0 ? (
                  <p className="text-center text-zinc-500 py-4 text-sm">Keine benutzerdefinierten Kategorien.</p>
                ) : (
                  initialCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                      <span className="font-medium">{cat.name}</span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
