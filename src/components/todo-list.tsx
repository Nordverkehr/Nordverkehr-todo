"use client";

import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Code2,
  Map,
  MoreHorizontal,
  Play,
  ShoppingCart,
  Layout,
  Gamepad2,
  User as UserIcon,
  Pencil,
  BarChart3,
  Search,
  FileJson,
  ChevronDown
} from "lucide-react";
import { updateTodoStatus, deleteTodo, updateTodo } from "@/lib/actions/todo-actions";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TodoForm } from "./todo-form";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TodoListProps {
  initialTodos: any[];
  categories?: any[];
  filterLayout?: string;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  planned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusLabels = {
  pending: "Ausstehend",
  in_progress: "In Arbeit",
  completed: "Gekauft",
  planned: "geplant",
};

const priorityConfig = {
  low: { label: "Niedrig", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  normal: { label: "Normal", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  high: { label: "Hoch", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  urgent: { label: "Dringend", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const categoryIcons: Record<string, any> = {
  mlo: Map,
  script: Code2,
  vehicle: Gamepad2,
  clothing: UserIcon,
  ui: Layout,
  other: MoreHorizontal,
};

const billingCycleLabels: Record<string, string> = {
  once: "",
  monthly: "/ Monatlich",
  quarterly: "/ Vierteljährlich",
  "semi-annually": "/ Halbjährlich",
  yearly: "/ Jährlich",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
};

export function TodoList({ initialTodos, categories = [], filterLayout = "tabs" }: TodoListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [editingTodo, setEditingTodo] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>("priority-desc");

  const dynamicCategories = useMemo(() => [
    { slug: "all", name: "Alle" },
    { slug: "mlo", name: "MLOs" },
    { slug: "script", name: "Scripts" },
    { slug: "vehicle", name: "Fahrzeuge" },
    { slug: "clothing", name: "Kleidung" },
    { slug: "ui", name: "UI/HUD" },
    ...categories,
    { slug: "other", name: "Sonstiges" }
  ], [categories]);

  const filteredTodos = useMemo(() => {
    let result = filter === "all" 
      ? initialTodos 
      : initialTodos.filter(todo => todo.category === filter);
    
    if (statusFilter !== "all") {
      result = result.filter(todo => todo.status === statusFilter);
    }
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(todo => 
        todo.title.toLowerCase().includes(s) || 
        todo.description?.toLowerCase().includes(s) ||
        todo.tags?.toLowerCase().includes(s)
      );
    }

    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    
    return [...result].sort((a, b) => {
      if (sortBy === "priority-desc") {
        const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
        const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
        return pA - pB;
      }
      if (sortBy === "priority-asc") {
        const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
        const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
        return pB - pA;
      }
      if (sortBy === "price-desc") {
        const priceA = parseFloat(a.price?.replace(/[^\d.,]/g, '').replace(',', '.') || "0");
        const priceB = parseFloat(b.price?.replace(/[^\d.,]/g, '').replace(',', '.') || "0");
        return priceB - priceA;
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [initialTodos, filter, search, sortBy]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    initialTodos.forEach(todo => {
      const cat = todo.category || 'other';
      const priceVal = parseFloat(todo.price?.replace(/[^\d.,]/g, '').replace(',', '.') || "0");
      stats[cat] = (stats[cat] || 0) + priceVal;
      stats['all'] = (stats['all'] || 0) + priceVal;
    });
    return stats;
  }, [initialTodos]);

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(initialTodos, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `fivem_todo_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs & Stats */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display">Übersicht & Filter</h3>
              <p className="text-xs text-zinc-500">Filtere deine FiveM-Ressourcen nach Bedarf.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 glass rounded-2xl border border-white/10 flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Gesamtwert</span>
              <span className="text-xl font-display text-white font-bold leading-none mt-1">
                {formatPrice(categoryStats['all'] || 0)}
              </span>
            </div>
            <button 
              onClick={exportToJson}
              className="p-3.5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-white group relative"
              title="Alle Daten als JSON exportieren"
            >
              <FileJson className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export JSON</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Name, Tag oder Beschreibung..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>
          
          {/* Category filter removed as it is in the sidebar */}

          <div className="relative min-w-[180px]">
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer font-bold text-sm"
            >
              <option value="all" className="bg-[#121212]">Alle Status</option>
              <option value="pending" className="bg-[#121212]">Ausstehend</option>
              <option value="in_progress" className="bg-[#121212]">In Arbeit</option>
              <option value="completed" className="bg-[#121212]">Gekauft</option>
              <option value="planned" className="bg-[#121212]">geplant</option>
            </select>
          </div>

          <div className="relative min-w-[200px]">
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer font-bold text-sm"
            >
              <option value="priority-desc" className="bg-[#121212]">Priorität (Hoch zuerst)</option>
              <option value="priority-asc" className="bg-[#121212]">Priorität (Niedrig zuerst)</option>
              <option value="newest" className="bg-[#121212]">Neu hinzugefügt</option>
              <option value="price-desc" className="bg-[#121212]">Preis (Absteigend)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Todo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => {
            const Icon = categoryIcons[todo.category || 'other'] || MoreHorizontal;
            const prio = priorityConfig[todo.priority as keyof typeof priorityConfig] || priorityConfig.normal;
            const tags = todo.tags?.split(',').map((t: string) => t.trim()).filter((t: string) => t !== "") || [];
            
            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative glass rounded-[2rem] p-7 border-white/5 hover:border-purple-500/30 transition-all duration-500 flex flex-col shadow-2xl hover:shadow-purple-500/10"
              >
                <div className={cn(
                  "absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 border-[#050505] shadow-lg",
                  prio.color
                )}>
                  {prio.label}
                </div>

                <div className="flex items-start space-x-5">
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent text-purple-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/5 shadow-inner">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xl truncate pr-2 group-hover:text-purple-400 transition-colors">{todo.title}</h4>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => setEditingTodo(todo)}
                          className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-colors relative group/btn"
                          title="Eintrag bearbeiten"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Bearbeiten</span>
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-colors relative group/btn"
                          title="Eintrag löschen"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-900 text-[10px] text-white rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Löschen</span>
                        </button>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <p className="text-zinc-500 text-sm mt-2 line-clamp-2 font-medium leading-relaxed">{todo.description}</p>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-zinc-500 border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mt-5">
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-xl border-2",
                        statusColors[todo.status as keyof typeof statusColors]
                      )}>
                        {statusLabels[todo.status as keyof typeof statusLabels]}
                      </span>
                      {todo.price && (
                        <span className="text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-xl border-2 border-purple-500/30 text-white bg-purple-500/10 shadow-lg shadow-purple-500/5">
                          {todo.price} {billingCycleLabels[todo.billingCycle as keyof typeof billingCycleLabels] || ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-5">
                      {todo.previewUrl && (
                        <a 
                          href={todo.previewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-black hover:bg-red-500 hover:text-white transition-all duration-300 transform active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" />
                          PREVIEW
                        </a>
                      )}
                      {todo.storeUrl && (
                        <a 
                          href={todo.storeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all duration-300 transform active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          STORE
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateTodoStatus(todo.id, todo.status === "completed" ? "pending" : "completed")}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300",
                        todo.status === "completed" 
                          ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                          : "bg-white/5 text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{todo.status === "completed" ? "Gekauft" : "Kaufen"}</span>
                    </button>
                    <button
                      onClick={() => updateTodoStatus(todo.id, "in_progress")}
                      className={cn(
                        "p-2.5 rounded-2xl transition-all",
                        todo.status === "in_progress" 
                          ? "bg-blue-500 text-black shadow-lg shadow-blue-500/20" 
                          : "bg-white/5 text-zinc-500 hover:bg-blue-500/10 hover:text-blue-500"
                      )}
                      title="Status auf 'In Arbeit' setzen"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence mode="wait">
        {editingTodo && (
          <TodoForm
            title="Aufgabe bearbeiten"
            initialData={editingTodo}
            categories={categories}
            onClose={() => setEditingTodo(null)}
            onSubmit={async (formData) => {
              await updateTodo(editingTodo.id, formData);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
