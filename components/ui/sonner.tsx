"use client";

import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastBase =
  "group toast !flex !w-[min(100vw-2rem,22rem)] !items-start !gap-3 !rounded-xl !border !p-4 !pr-10 !shadow-lg !shadow-black/5 backdrop-blur-sm";

const toastTypes = {
  toast: `${toastBase} !border-border/80 !bg-card !text-card-foreground`,
  title: "!text-sm !font-semibold !leading-snug !text-foreground",
  description: "!text-sm !leading-relaxed !text-muted-foreground",
  content: "!gap-1",
  icon: "!mt-0.5 !size-5 !shrink-0",
  closeButton:
    "!absolute !top-3 !right-3 !left-auto !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground !transition-colors",
  success: `${toastBase} !border-teal-200 !bg-teal-50 !text-teal-950 [&_[data-icon]]:!text-teal-600`,
  error: `${toastBase} !border-rose-200 !bg-rose-50 !text-rose-950 [&_[data-icon]]:!text-rose-600`,
  warning: `${toastBase} !border-amber-200 !bg-amber-50 !text-amber-950 [&_[data-icon]]:!text-amber-600`,
  info: `${toastBase} !border-cyan-200 !bg-cyan-50 !text-cyan-950 [&_[data-icon]]:!text-cyan-700`,
};

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster pointer-events-none"
      icons={{
        success: <CircleCheck className="size-5 text-teal-600" aria-hidden />,
        error: <CircleAlert className="size-5 text-rose-600" aria-hidden />,
        warning: <TriangleAlert className="size-5 text-amber-600" aria-hidden />,
        info: <Info className="size-5 text-cyan-700" aria-hidden />,
        close: <X className="size-4" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: toastTypes,
      }}
      {...props}
    />
  );
}
