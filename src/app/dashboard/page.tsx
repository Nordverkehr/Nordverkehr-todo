import { auth } from "@/auth";
import { getTodos, getCategories } from "@/lib/actions/todo-actions";
import { AddTodo } from "@/components/add-todo";
import { CategoryManager } from "@/components/category-manager";
import { 
  BarChart3, 
  Map, 
  Code2, 
  Car, 
  User as UserIcon, 
  Layout, 
  Package,
  TrendingUp,
  ShoppingCart,
  CheckCircle2
} from "lucide-react";

const categoryMap: Record<string, { name: string, icon: any, color: string }> = {
  mlo: { name: "MLOs", icon: Map, color: "text-blue-400" },
  script: { name: "Scripts", icon: Code2, color: "text-purple-400" },
  vehicle: { name: "Fahrzeuge", icon: Car, color: "text-orange-400" },
  clothing: { name: "Kleidung", icon: UserIcon, color: "text-pink-400" },
  ui: { name: "UI / HUD", icon: Layout, color: "text-emerald-400" },
  other: { name: "Sonstiges", icon: Package, color: "text-zinc-400" },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
};

export default async function DashboardPage() {
  const session = await auth();
  const initialTodos = await getTodos();
  const initialCategories = await getCategories();
  
  const stats = initialTodos.reduce((acc, todo) => {
    const cat = todo.category || 'other';
    const priceVal = parseFloat(todo.price?.replace(/[^\d.,]/g, '').replace(',', '.') || "0");
    
    if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
    acc[cat].count++;
    acc[cat].total += priceVal;
    
    acc.totalSum += priceVal;
    if (todo.status === 'completed') acc.completedCount++;
    
    return acc;
  }, { totalSum: 0, completedCount: 0 } as any);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">Übersicht</h2>
          <p className="text-zinc-500 mt-2 text-lg font-medium">Dein Projekt-Status im Überblick.</p>
        </div>
        <div className="flex items-center gap-4">
          <CategoryManager initialCategories={initialCategories} />
          <AddTodo categories={initialCategories} />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[2rem] p-8 border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Gesamtwert</span>
          </div>
          <h3 className="text-3xl font-display font-black text-white">{formatPrice(stats.totalSum)}</h3>
          <p className="text-zinc-500 text-sm mt-1">Investition in deinen Server.</p>
        </div>

        <div className="glass rounded-[2rem] p-8 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Abgeschlossen</span>
          </div>
          <h3 className="text-3xl font-display font-black text-white">{stats.completedCount} / {initialTodos.length}</h3>
          <p className="text-zinc-500 text-sm mt-1">Gekaufte Ressourcen.</p>
        </div>

        <div className="glass rounded-[2rem] p-8 border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Kategorien</span>
          </div>
          <h3 className="text-3xl font-display font-black text-white">{Object.keys(categoryMap).length + initialCategories.length}</h3>
          <p className="text-zinc-500 text-sm mt-1">Verfügbare Kategorien.</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 ml-2">
          <BarChart3 className="w-5 h-5 text-zinc-500" />
          <h3 className="text-xl font-display font-bold">Kosten-Aufschlüsselung</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryMap).map(([key, config]) => {
            const catStats = stats[key] || { count: 0, total: 0 };
            const Icon = config.icon;
            
            return (
              <div key={key} className="glass rounded-3xl p-6 border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-white/5 ${config.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{catStats.count} Items</span>
                </div>
                <h4 className="font-bold text-white mb-1">{config.name}</h4>
                <p className="text-2xl font-display font-black text-white/90">{formatPrice(catStats.total)}</p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className={`h-full bg-current ${config.color.replace('text-', 'bg-')}`}
                    style={{ width: `${(catStats.total / (stats.totalSum || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
