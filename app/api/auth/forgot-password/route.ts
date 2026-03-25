import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Invalid email" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // We don't want to leak whether a user exists or not
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we sent a reset link to it." },
        { status: 200 }
      );
    }

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // We can delete existing tokens for this user/identifier to keep it clean, but Drizzle doesn't have an easy way unless we run a delete query.
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

    // Save token to DB
    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { message: "If an account with that email exists, we sent a reset link to it." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
