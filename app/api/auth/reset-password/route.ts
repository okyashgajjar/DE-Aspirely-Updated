import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { message: "Invalid request. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Find the token
    const vt = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (!vt) {
      return NextResponse.json(
        { message: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > vt.expires) {
      // Token expired, let's delete it to clean up
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
      
      return NextResponse.json(
        { message: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, vt.identifier));

    // Delete the used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
