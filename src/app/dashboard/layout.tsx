import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let userId = session?.user?.id;

  if (!userId) {
    const firstTodo = await db.query.todos.findFirst();
    if (firstTodo?.userId) userId = firstTodo.userId;
    else {
      const firstCat = await db.query.categories.findFirst();
      if (firstCat?.userId) userId = firstCat.userId;
      else {
        const firstUser = await db.query.users.findFirst();
        if (firstUser?.id) userId = firstUser.id;
      }
    }
  }

  if (!userId) {
    userId = "default-admin-id";
    try {
      await db.insert(users).values({
        id: userId,
        name: "JannikJBI",
        email: "admin@nordverkehr.de",
        filterLayout: "tabs",
      }).onConflictDoNothing();
    } catch (e) {}
  }

  let user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const filterLayout = user?.filterLayout || "tabs";
  const userName = session?.user?.name || user?.name || "JannikJBI";
  const userEmail = session?.user?.email || user?.email || "admin@nordverkehr.de";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#080808]/50 backdrop-blur-md sticky top-0 z-50 h-20">
          <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Management</p>
              <h2 className="text-sm font-bold text-white">FiveM Projekt-Planer</h2>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 pr-6 border-r border-white/5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{userName}</p>
                  <p className="text-[10px] text-purple-500 font-bold">{userEmail}</p>
                </div>
                <Image 
                  src="/jannikjbi2.png" 
                  alt="Avatar" 
                  width={40} 
                  height={40} 
                  className="rounded-2xl border-2 border-purple-500/20 shadow-lg shadow-purple-500/10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  href="/dashboard/settings"
                  className="p-3.5 text-zinc-400 hover:text-white transition-all glass rounded-2xl border border-white/10 hover:bg-white/5 group relative"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Einstellungen</span>
                </Link>
                <form action={async () => {
                  "use server";
                  await signOut();
                }}>
                  <button className="p-3.5 text-zinc-400 hover:text-white transition-all glass rounded-2xl border border-white/10 hover:bg-white/5 group relative">
                    <LogOut className="w-5 h-5" />
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Abmelden</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
