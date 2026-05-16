"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addTodo } from "@/lib/actions/todo-actions";
import { AnimatePresence } from "framer-motion";
import { TodoForm } from "./todo-form";

export function AddTodo({ categories = [] }: { categories?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-6 py-3.5 bg-white text-black hover:bg-zinc-200 transition-all rounded-2xl font-bold shadow-xl shadow-white/5 active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span>Hinzufügen</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <TodoForm 
            title="Neue Ressource"
            categories={categories}
            onClose={() => setIsOpen(false)}
            onSubmit={async (formData) => {
              await addTodo(formData);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
