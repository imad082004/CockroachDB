import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function addAdminLog(
  userEmail: string | undefined | null,
  type: "error" | "security" | "info" | "action",
  message: string,
  details: string
) {
  const newLog = {
    id: Date.now().toString(),
    type,
    message,
    details,
    userEmail: userEmail || "system",
    createdAt: new Date().toISOString(),
  };

  // Always save to localStorage as backup/cache
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("movis_admin_logs") || "[]");
      localStorage.setItem("movis_admin_logs", JSON.stringify([newLog, ...existing].slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
  }

  // Try Firestore
  try {
    await addDoc(collection(db, "admin_logs"), {
      type,
      message,
      details,
      userEmail: userEmail || "system",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firestore logging failed, saved to local cache instead.", err);
  }
}
