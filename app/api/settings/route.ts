import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  let row = await db.query.settings.findFirst({
    where: eq(settings.userId, userId),
  });

  if (!row) {
    [row] = await db.insert(settings).values({
      id: crypto.randomUUID(),
      userId,
      email_alerts: true,
      job_notifications: true,
      weekly_digest: true,
    }).returning();
  }

  return NextResponse.json(row);
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  let body: { theme?: "light" | "dark" | "system"; email_alerts?: boolean; job_notifications?: boolean; weekly_digest?: boolean; };
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const existing = await db.query.settings.findFirst({
    where: eq(settings.userId, userId),
  });

  if (!existing) {
    const [row] = await db.insert(settings).values({
      id: crypto.randomUUID(),
      userId,
      ...body
    }).returning();
    return NextResponse.json(row);
  }

  const [row] = await db.update(settings)
    .set(body)
    .where(eq(settings.id, existing.id))
    .returning();

  return NextResponse.json(row);
}
