"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/contexts/auth-provider";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Overview",
    description: "Clinic operations at a glance",
  },
  "/dashboard/patients": {
    title: "Patients",
    description: "Register and search clinic patients",
  },
  "/dashboard/appointments/book": {
    title: "Book appointment",
    description: "Schedule a visit with slot availability",
  },
  "/dashboard/queue": {
    title: "Queue Management",
    description: "Serve patients and monitor today's waiting line",
  },
  "/dashboard/appointments": {
    title: "Appointments",
    description: "View scheduled visits by date",
  },
  "/dashboard/admin": {
    title: "Administration",
    description: "Clinic and staff management",
  },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const meta = pageMeta[pathname] ?? {
    title: "Dashboard",
    description: "Clinic queue system",
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" />
            }
          >
            <Menu className="size-4" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            {meta.title}
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground md:inline">
          {user?.name}{" "}
          <span className="capitalize text-foreground/70">({user?.role})</span>
        </span>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Profile">
          <UserCircle className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => void logout()}
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden"
          aria-label="Log out"
          onClick={() => void logout()}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
