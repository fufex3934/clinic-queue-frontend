import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Clinic Queue & Appointment Management | Ethiopia",
  description:
    "Modern queue and appointment management software for Ethiopian clinics.",
};

export default function MarketingPage() {
  return (
    <div className="scroll-smooth bg-background text-foreground antialiased">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Pricing />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
