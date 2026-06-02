import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm font-medium">ClinicFlow Ethiopia</p>
          <p className="text-xs text-muted-foreground">
            Clinic Queue & Appointment Management System for modern health teams.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="#contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ClinicFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
