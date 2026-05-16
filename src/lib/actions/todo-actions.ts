"use server";

import { db } from "@/lib/db";
import { todos, categories, users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.todos.findMany({
    where: eq(todos.userId, session.user.id),
    orderBy: [desc(todos.createdAt)],
  });
}

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.query.categories.findMany({
    where: eq(categories.userId, session.user.id),
    orderBy: [desc(categories.createdAt)],
  });
}

export async function addCategory(name: string, color: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  await db.insert(categories).values({
    name,
    slug,
    color,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, session.user.id)));
  revalidatePath("/dashboard");
}

export async function addTodo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
}

export async function updateTodoStatus(id: string, status: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(todos)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

  revalidatePath("/dashboard");
}

export async function updateTodo(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

  revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

  revalidatePath("/dashboard");
}

export async function updateUserSettings(settings: { filterLayout: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ filterLayout: settings.filterLayout })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
}
