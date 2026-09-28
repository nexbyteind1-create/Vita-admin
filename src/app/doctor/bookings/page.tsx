"use client";
import { Suspense } from "react";
import BookingsPage from "@/features/bookings";

// Reads the URL query (?id=, ?centre=…), so it renders inside Suspense.
export default function Page() {
  return (
    <Suspense>
      <BookingsPage />
    </Suspense>
  );
}
