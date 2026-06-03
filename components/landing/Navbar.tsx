import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-background/90 shadow-elevation-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-sm">
            <Stethoscope className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight md:text-base">
            Clinic Queue
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Staff login
          </Button>
          <Button render={<Link href="#contact" />} size="sm" className="shadow-elevation-sm">
            Start trial
          </Button>
        </div>
      </div>
    </header>
  );
}
