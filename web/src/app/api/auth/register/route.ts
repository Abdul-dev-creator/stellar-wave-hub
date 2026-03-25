import { usersCol, nextId } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return Response.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check existing email or username
    const byEmail = await usersCol.ref.where("email", "==", email).limit(1).get();
    if (!byEmail.empty) {
      return Response.json({ error: "Email or username already taken" }, { status: 409 });
    }
    const byUsername = await usersCol.ref.where("username", "==", username).limit(1).get();
    if (!byUsername.empty) {
      return Response.json({ error: "Email or username already taken" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const numericId = await nextId("users");

    await usersCol.ref.doc(String(numericId)).set({
      numericId,
      username,
      email,
      password_hash,
      role: "contributor",
      stellar_address: null,
      github_url: null,
      bio: null,
      created_at: new Date().toISOString(),
    });

    const token = signToken({ userId: numericId, role: "contributor" });
    return Response.json(
      { token, user: { id: numericId, username, email, role: "contributor" } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
