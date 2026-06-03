"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Maximize2, QrCode, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaymentQrDisplayProps = {
  imageUrl: string;
  instructions?: string | null;
  /** Shown above the QR, e.g. plan price */
  amountLabel?: string;
  /** scan = clinic billing; preview = platform admin */
  variant?: "scan" | "preview";
  className?: string;
};

export function PaymentQrDisplay({
  imageUrl,
  instructions,
  amountLabel,
  variant = "scan",
  className,
}: PaymentQrDisplayProps) {
  const [enlarged, setEnlarged] = useState(false);
  const isScan = variant === "scan";

  const closeEnlarged = useCallback(() => setEnlarged(false), []);

  useEffect(() => {
    if (!enlarged) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEnlarged();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [enlarged, closeEnlarged]);

  const frameClass = cn(
    "relative mx-auto w-full rounded-xl border-2 border-border bg-white shadow-sm",
    isScan ? "max-w-[20rem] p-5 sm:max-w-[22rem] sm:p-6" : "max-w-[11rem] p-3",
  );

  const imageClass = cn(
    "mx-auto block h-auto w-full object-contain",
    isScan ? "min-h-[14rem] max-h-[min(72vw,20rem)] sm:min-h-[16rem] sm:max-h-[20rem]" : "min-h-[8rem] max-h-[9rem]",
  );

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {amountLabel && (
        <p
          className={cn(
            "mb-3 text-center font-semibold text-foreground",
            isScan ? "text-lg" : "text-sm",
          )}
        >
          {amountLabel}
        </p>
      )}

      <div className={frameClass}>
        <button
          type="button"
          onClick={() => isScan && setEnlarged(true)}
          className={cn(
            "block w-full text-left",
            isScan &&
              "cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !isScan && "cursor-default",
          )}
          aria-label={isScan ? "Enlarge payment QR code" : undefined}
          disabled={!isScan}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Payment QR code"
            className={imageClass}
            decoding="async"
            fetchPriority={isScan ? "high" : "auto"}
          />
        </button>
        {isScan && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Maximize2 className="size-3.5 shrink-0" aria-hidden />
            Tap QR to enlarge for scanning
          </p>
        )}
      </div>

      {isScan && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "inline-flex gap-1.5",
            })}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Open full size
          </a>
        </div>
      )}

      {isScan && (
        <ul className="mt-5 w-full max-w-md space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <span>
              Scan the QR with your bank or wallet app and complete payment for
              the amount shown.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <span>
              Submit a payment request, then upload a{" "}
              <strong className="font-medium text-foreground">
                receipt screenshot
              </strong>{" "}
              (not this QR again).
            </span>
          </li>
        </ul>
      )}

      {instructions?.trim() && (
        <div
          className={cn(
            "mt-4 w-full rounded-lg border border-border bg-muted/40 px-4 py-3",
            isScan ? "max-w-md text-center" : "text-left",
          )}
        >
          <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {!isScan && <QrCode className="size-3.5" aria-hidden />}
            Payment details
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {instructions.trim()}
          </p>
        </div>
      )}

      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Payment QR code enlarged"
          onClick={closeEnlarged}
        >
          <button
            type="button"
            onClick={closeEnlarged}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close enlarged QR"
          >
            <X className="size-6" />
          </button>
          {amountLabel && (
            <p className="mb-4 text-center text-lg font-semibold text-white">
              {amountLabel}
            </p>
          )}
          <div
            className="rounded-2xl bg-white p-6 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Payment QR code enlarged"
              className="mx-auto block size-[min(78vw,78vh)] max-w-none object-contain sm:size-[min(70vw,70vh)]"
              decoding="async"
            />
          </div>
          <p className="mt-6 max-w-xs text-center text-sm text-white/80">
            Hold steady · increase screen brightness if the code won&apos;t scan
          </p>
          <p className="mt-2 text-center text-xs text-white/60">
            Tap outside or press Escape to close
          </p>
        </div>
      )}
    </div>
  );
}
