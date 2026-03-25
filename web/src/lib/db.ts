import firestore from "./firebase";

// Lazy collection getters — avoid touching Firestore at module load (build time)
function col(name: string) {
  return firestore.collection(name);
}

export const usersCol = { get ref() { return col("users"); } };
export const projectsCol = { get ref() { return col("projects"); } };
export const ratingsCol = { get ref() { return col("ratings"); } };
export const financialSnapshotsCol = { get ref() { return col("financial_snapshots"); } };

// Auto-incrementing numeric ID
export async function nextId(collection: string): Promise<number> {
  const ref = col("counters").doc(collection);
  return firestore.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const current = doc.exists ? (doc.data()!.value as number) : 0;
    const next = current + 1;
    t.set(ref, { value: next });
    return next;
  });
}

export default firestore;
