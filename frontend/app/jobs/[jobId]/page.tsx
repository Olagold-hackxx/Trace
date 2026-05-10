"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Employer job management is accessed via /jobs — redirect there
export default function JobDetailRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/jobs"); }, [router]);
  return null;
}
