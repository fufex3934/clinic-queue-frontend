"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";
import { PaymentQrDisplay } from "@/components/billing/payment-qr-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  paymentService,
  type PlatformPaymentConfig,
} from "@/services/paymentService";

export function PlatformPaymentSettingsCard() {
  const [config, setConfig] = useState<PlatformPaymentConfig | null>(null);
  const [instructions, setInstructions] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await paymentService.getAdminPaymentSettings();
      setConfig(data);
      setInstructions(data.paymentInstructions ?? "");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load payment settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveInstructions = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await paymentService.updateAdminPaymentSettings({
        paymentInstructions: instructions,
      });
      setConfig(data);
      setInstructions(data.paymentInstructions ?? "");
      notifySuccess(
        "Payment instructions saved",
        "Clinics will see these details on the Billing page.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save instructions"));
      notifyError(err, "Could not save payment instructions");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQr = async () => {
    if (!qrFile) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await paymentService.uploadAdminPaymentQr(qrFile);
      setConfig(data);
      setQrFile(null);
      notifySuccess(
        "Payment QR updated",
        "Clinics can now scan this code when renewing their subscription.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload QR code"));
      notifyError(err, "Could not upload payment QR");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="size-4" />
          Subscription payment QR
        </CardTitle>
        <CardDescription>
          Upload a clear, square QR (at least 400×400 px). Clinics see a large,
          scannable version on Billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <ErrorAlert
            title="Payment settings"
            message={error}
            onRetry={load}
          />
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr,minmax(0,16rem)] lg:items-start">
              <div className="space-y-2">
                <Label htmlFor="platform-qr-file">QR image</Label>
                <input
                  id="platform-qr-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm"
                  onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
                  disabled={saving}
                />
                <Button
                  size="sm"
                  onClick={() => void handleUploadQr()}
                  disabled={saving || !qrFile}
                >
                  {saving ? "Uploading…" : "Upload QR"}
                </Button>
                {config?.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last updated {new Date(config.updatedAt).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Preview matches what clinics see (tap to enlarge on Billing).
                </p>
              </div>
              <div className="flex justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 lg:justify-center">
                {config?.paymentQrImageUrl ? (
                  <PaymentQrDisplay
                    variant="preview"
                    imageUrl={config.paymentQrImageUrl}
                  />
                ) : (
                  <div className="flex min-h-[10rem] w-full max-w-[11rem] items-center justify-center text-center text-xs text-muted-foreground">
                    No QR uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-payment-instructions">
                Payment instructions (optional)
              </Label>
              <textarea
                id="platform-payment-instructions"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="e.g. Bank name, account number, reference format, mobile money number…"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={saving}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleSaveInstructions()}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save instructions"}
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw
                className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
