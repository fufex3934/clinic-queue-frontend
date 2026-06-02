import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground md:px-10">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Start simplifying your clinic operations today
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" render={<Link href="#contact" />}>
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              render={<Link href="#contact" />}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
