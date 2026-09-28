"use client";
import { Suspense } from "react";
import SlotsPage from "@/features/slots";

// Reads the URL query (?id=, ?centre=…), so it renders inside Suspense.
export default function Page() {
  return (
    <Suspense>
      <SlotsPage kind="centre" />
    </Suspense>
  );
}
