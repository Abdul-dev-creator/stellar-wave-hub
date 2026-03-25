import { Keypair } from "@stellar/stellar-sdk";
import firestore from "@/lib/firebase";
import { usersCol, nextId } from "@/lib/db";
import { signToken } from "@/lib/auth";
export const dynamic = "force-dynamic";

function challengesCol() { return firestore.collection("auth_challenges"); }

export async function POST(request: Request) {
  try {
    const { publicKey, signature } = await request.json();

    if (!publicKey || !signature) {
      return Response.json({ error: "publicKey and signature are required" }, { status: 400 });
    }

    // Retrieve and validate challenge
    const challengeDoc = await challengesCol().doc(publicKey).get();
    if (!challengeDoc.exists) {
      return Response.json({ error: "No challenge found. Request a new one." }, { status: 400 });
    }

    const challengeData = challengeDoc.data()!;
    if (Date.now() > (challengeData.expires_at as number)) {
      await challengesCol().doc(publicKey).delete();
      return Response.json({ error: "Challenge expired. Request a new one." }, { status: 400 });
    }

    // Verify signature
    const challenge = challengeData.challenge as string;
    const keypair = Keypair.fromPublicKey(publicKey);
    const messageBuffer = Buffer.from(challenge, "utf-8");
    const signatureBuffer = Buffer.from(signature, "base64");

    const isValid = keypair.verify(messageBuffer, signatureBuffer);
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Clean up used challenge
    await challengesCol().doc(publicKey).delete();

    // Find or create user by stellar_address
    let user;
    const existingSnap = await usersCol.ref
      .where("stellar_address", "==", publicKey)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      // Existing wallet user — log them in
      const userData = existingSnap.docs[0].data();
      user = {
        id: userData.numericId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        stellar_address: userData.stellar_address,
        github_url: userData.github_url,
        bio: userData.bio,
      };
    } else {
      // New wallet user — auto-register
      const numericId = await nextId("users");
      const shortKey = publicKey.slice(0, 8);
      const username = `stellar_${shortKey.toLowerCase()}`;

      const newUser = {
        numericId,
        username,
        email: null,
        password_hash: null,
        role: "contributor",
        stellar_address: publicKey,
        github_url: null,
        bio: null,
        auth_method: "wallet",
        created_at: new Date().toISOString(),
      };

      await usersCol.ref.doc(String(numericId)).set(newUser);

      user = {
        id: numericId,
        username,
        email: null,
        role: "contributor",
        stellar_address: publicKey,
        github_url: null,
        bio: null,
      };
    }

    const token = signToken({ userId: user.id as number, role: user.role as string });

    return Response.json({ token, user });
  } catch (err) {
    console.error("Wallet auth error:", err);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}
