import { projectsCol } from "@/lib/db";
import { getRecentTransactions } from "@/lib/stellarService";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const doc = await projectsCol.ref.doc(projectId).get();

  if (!doc.exists) return Response.json({ error: "Project not found" }, { status: 404 });
  const project = doc.data()!;
  if (!project.stellar_account_id) {
    return Response.json({ error: "No Stellar account linked" }, { status: 400 });
  }

  try {
    const transactions = await getRecentTransactions(project.stellar_account_id);
    return Response.json({ transactions });
  } catch (err) {
    console.error("Transactions error:", err);
    return Response.json({ error: "Failed to fetch transactions from Stellar" }, { status: 502 });
  }
}
