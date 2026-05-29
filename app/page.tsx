import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Clinic Queue System — Queue & appointment management",
  description:
    "Manage clinic walk-in queues and daily appointments from one admin dashboard.",
};

export default function HomePage() {
  return <LandingPage />;
}
