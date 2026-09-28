"use client";
import { Suspense } from "react";
import TestsPage from "@/features/tests";

// Reads the URL query (?id=, ?centre=…), so it renders inside Suspense.
export default function Page() {
  return (
    <Suspense>
      <TestsPage />
    </Suspense>
  );
}
