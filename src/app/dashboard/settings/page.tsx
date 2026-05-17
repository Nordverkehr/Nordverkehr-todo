import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon, LayoutGrid, ListFilter, User as UserIcon } from "lucide-react";
import { updateUserSettings } from "@/lib/actions/todo-actions";
import Image from "next/image";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id || "default-admin-id";

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const filterLayout = user?.filterLayout || "tabs";
  const userName = session?.user?.name || user?.name || "JannikJBI";
  const userEmail = session?.user?.email || user?.email || "admin@nordverkehr.de";

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
      <div className="flex items-center space-x-4 border-b border-white/5 pb-8">
        <div className="p-4 rounded-[2rem] bg-zinc-900 border border-white/10 text-zinc-400">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">Einstellungen</h2>
          <p className="text-zinc-500 mt-1 text-lg">Personalisiere dein Dashboard und Profil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Dein Profil</h3>
          <p className="text-sm text-zinc-500">Diese Informationen werden von Discord synchronisiert.</p>
        </div>
        
        <div className="md:col-span-2 glass rounded-[2rem] p-8 border-white/5 space-y-8">
          <div className="flex items-center space-x-6">
            <Image 
              src="/jannikjbi2.png" 
              alt="Avatar" 
              width={80} 
              height={80} 
              className="rounded-[2rem] border-4 border-purple-500/20 shadow-2xl shadow-purple-500/10"
            />
            <div>
              <p className="text-2xl font-black uppercase tracking-tight">{userName}</p>
              <p className="text-purple-400 font-bold">{userEmail}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                Authorized Admin
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 md:col-span-3" />

        <div className="space-y-2">
          <h3 className="text-xl font-bold">Dashboard Layout</h3>
          <p className="text-sm text-zinc-500">Wähle wie deine Filter angezeigt werden sollen.</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form action={async () => {
            "use server";
            await updateUserSettings({ filterLayout: "tabs" });
          }}>
            <button
              type="submit"
              className={`w-full flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all ${
                filterLayout === "tabs"
                  ? "bg-white text-black border-white shadow-2xl"
                  : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
              }`}
            >
              <LayoutGrid className="w-10 h-10" />
              <div className="text-center">
                <p className="font-black uppercase tracking-widest text-xs">Standard</p>
                <p className={`text-[10px] mt-1 ${filterLayout === "tabs" ? "text-black/60" : "text-zinc-600"}`}>Übersichtliche Tabs</p>
              </div>
            </button>
          </form>

          <form action={async () => {
            "use server";
            await updateUserSettings({ filterLayout: "dropdown" });
          }}>
            <button
              type="submit"
              className={`w-full flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all ${
                filterLayout === "dropdown"
                  ? "bg-white text-black border-white shadow-2xl"
                  : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
              }`}
            >
              <ListFilter className="w-10 h-10" />
              <div className="text-center">
                <p className="font-black uppercase tracking-widest text-xs">Drop-Down</p>
                <p className={`text-[10px] mt-1 ${filterLayout === "dropdown" ? "text-black/60" : "text-zinc-600"}`}>Kompaktes Menü</p>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
