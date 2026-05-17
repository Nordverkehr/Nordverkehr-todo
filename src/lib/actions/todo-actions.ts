"use server";

import { db } from "@/lib/db";
import { todos, categories, users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getEffectiveUserId() {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // Suche nach dem ersten Todo, um die ID des echten Besitzers zu ermitteln
  const firstTodo = await db.query.todos.findFirst();
  if (firstTodo?.userId) return firstTodo.userId;

  // Suche nach der ersten Kategorie
  const firstCat = await db.query.categories.findFirst();
  if (firstCat?.userId) return firstCat.userId;

  // Suche nach dem ersten existierenden User
  const firstUser = await db.query.users.findFirst();
  if (firstUser?.id) return firstUser.id;

  const defaultId = "default-admin-id";
  try {
    await db.insert(users).values({
      id: defaultId,
      name: "JannikJBI",
      email: "admin@nordverkehr.de",
      filterLayout: "tabs",
    }).onConflictDoNothing();
  } catch (e) {}
  return defaultId;
}

export async function getTodos() {
  const userId = await getEffectiveUserId();

  return await db.query.todos.findMany({
    where: eq(todos.userId, userId),
    orderBy: [desc(todos.createdAt)],
  });
}

export async function getCategories() {
  const userId = await getEffectiveUserId();

  return await db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: [desc(categories.createdAt)],
  });
}

export async function addCategory(name: string, color: string) {
  const userId = await getEffectiveUserId();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  await db.insert(categories).values({
    name,
    slug,
    color,
    userId,
  });

  revalidatePath("/dashboard");
}

export async function deleteCategory(id: string) {
  const userId = await getEffectiveUserId();

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  revalidatePath("/dashboard");
}

export async function addTodo(formData: FormData) {
  const userId = await getEffectiveUserId();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as any;
  const price = formData.get("price") as string;
  const billingCycle = formData.get("billingCycle") as string;
  const previewUrl = formData.get("previewUrl") as string;
  const storeUrl = formData.get("storeUrl") as string;
  const priority = formData.get("priority") as string;
  const tags = formData.get("tags") as string;

  await db.insert(todos).values({
    title,
    description,
    category,
    price,
    billingCycle,
    previewUrl,
    storeUrl,
    priority,
    tags,
    userId,
  });

  revalidatePath("/dashboard");
}

export async function updateTodoStatus(id: string, status: any) {
  const userId = await getEffectiveUserId();

  await db
    .update(todos)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  revalidatePath("/dashboard");
}

export async function updateTodo(id: string, formData: FormData) {
  const userId = await getEffectiveUserId();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as any;
  const price = formData.get("price") as string;
  const billingCycle = formData.get("billingCycle") as string;
  const previewUrl = formData.get("previewUrl") as string;
  const storeUrl = formData.get("storeUrl") as string;
  const status = formData.get("status") as any;
  const priority = formData.get("priority") as string;
  const tags = formData.get("tags") as string;

  await db
    .update(todos)
    .set({
      title,
      description,
      category,
      price,
      billingCycle,
      previewUrl,
      storeUrl,
      status,
      priority,
      tags,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
  const userId = await getEffectiveUserId();

  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  revalidatePath("/dashboard");
}

export async function updateUserSettings(settings: { filterLayout: string }) {
  const userId = await getEffectiveUserId();

  await db
    .update(users)
    .set({ filterLayout: settings.filterLayout })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard");
}

