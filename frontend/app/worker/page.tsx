"use client";

// Worker is now part of the Normal User account type.
// Redirect to the main user dashboard.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkerRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return null;
}
