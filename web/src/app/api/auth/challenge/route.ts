import { randomBytes } from "crypto";
import firestore from "@/lib/firebase";
export const dynamic = "force-dynamic";

function challengesCol() { return firestore.collection("auth_challenges"); }

export async function GET(request: Request) {
  const url = new URL(request.url);
  const publicKey = url.searchParams.get("publicKey");

  if (!publicKey || publicKey.length !== 56 || !publicKey.startsWith("G")) {
    return Response.json({ error: "Valid Stellar public key required" }, { status: 400 });
  }

  const nonce = randomBytes(32).toString("hex");
  const challenge = `Stellar Wave Hub Authentication\n\nSign this message to verify your identity.\n\nPublic Key: ${publicKey}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

  // Store challenge with 5-minute TTL
  await challengesCol().doc(publicKey).set({
    challenge,
    nonce,
    created_at: Date.now(),
    expires_at: Date.now() + 5 * 60 * 1000,
  });

  return Response.json({ challenge });
}
