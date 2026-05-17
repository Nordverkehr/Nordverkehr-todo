import { auth } from "@/auth";
import { getTodos, getCategories } from "@/lib/actions/todo-actions";
import { AddTodo } from "@/components/add-todo";
import { TodoList } from "@/components/todo-list";
import { CategoryManager } from "@/components/category-manager";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

const categoryMap: Record<string, { name: string, description: string, key: string }> = {
  mlo: { name: "MLOs & Maps", description: "Verwalte alle deine Gebäude und Karten-Erweiterungen.", key: "mlo" },
  scripts: { name: "Scripts", description: "Alle Funktionalitäten und Systeme deines Servers.", key: "script" },
  vehicles: { name: "Autos", description: "Importe, Custom-Handling und Fahrzeug-Pakete.", key: "vehicle" },
  clothing: { name: "Kleidung", description: "EUP, Haare und Accessoires für deine Bewohner.", key: "clothing" },
  ui: { name: "UI & HUD", description: "Interfaces, Menüs und visuelle Server-Elemente.", key: "ui" },
  other: { name: "Sonstiges", description: "Alles, was in keine andere Kategorie passt.", key: "other" },
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  let config = categoryMap[category];

  const session = await auth();
  const userId = session?.user?.id || "default-admin-id";

  if (!config) {
    // Check if it's a dynamic category
    const allCategories = await getCategories();
    const dynamicCat = allCategories.find(c => c.slug === category);
    
    if (!dynamicCat) return notFound();
    
    config = { 
      name: dynamicCat.name, 
      description: `Alle Einträge der Kategorie ${dynamicCat.name}.`, 
      key: dynamicCat.slug 
    };
  }

  const initialTodos = await getTodos();
  const initialCategories = await getCategories();
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const filterLayout = user?.filterLayout || "tabs";

  // Filter todos for this category
  const filteredTodos = initialTodos.filter(t => t.category === config.key);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">{config.name}</h2>
          <p className="text-zinc-500 mt-2 text-lg font-medium">{config.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <CategoryManager initialCategories={initialCategories} />
          <AddTodo categories={initialCategories} />
        </div>
      </div>

      <TodoList 
        initialTodos={filteredTodos} 
        categories={initialCategories} 
        filterLayout={filterLayout} 
      />
    </div>
  );
}
