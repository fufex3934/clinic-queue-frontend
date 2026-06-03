"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, Menu, UserCircle } from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-provider";
import { getPageMeta } from "@/lib/page-meta";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const meta = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-subtle bg-background/90 shadow-elevation-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="shrink-0 md:hidden" />
              }
            >
              <Menu className="size-4" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[17rem] border-0 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <Sidebar className="w-full" />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            {meta.breadcrumbs && meta.breadcrumbs.length > 1 && (
              <nav
                aria-label="Breadcrumb"
                className="mb-0.5 hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
              >
                {meta.breadcrumbs.map((crumb, i) => (
                  <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                    {i > 0 && (
                      <ChevronRight className="size-3 opacity-50" aria-hidden />
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground/80">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
              {meta.title}
            </h1>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground lg:inline">
            {user?.name}
          </span>
          <NotificationBell />
          <Button variant="ghost" size="icon" aria-label="Profile">
            <UserCircle className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("hidden sm:inline-flex")}
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
      </div>
    </header>
  );
}
