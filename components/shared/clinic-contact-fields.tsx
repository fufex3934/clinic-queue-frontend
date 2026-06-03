"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CLINIC_TIMEZONE_OPTIONS,
  DEFAULT_CLINIC_TIMEZONE,
} from "@/lib/clinic-display";

export type ClinicContactFormState = {
  phone: string;
  email: string;
  timezone: string;
  addressLine: string;
  city: string;
  country: string;
};

export const emptyClinicContactForm = (): ClinicContactFormState => ({
  phone: "",
  email: "",
  timezone: DEFAULT_CLINIC_TIMEZONE,
  addressLine: "",
  city: "",
  country: "",
});

export function clinicContactFromClinic(c: {
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  country?: string | null;
}): ClinicContactFormState {
  return {
    phone: c.phone ?? "",
    email: c.email ?? "",
    timezone: c.timezone ?? DEFAULT_CLINIC_TIMEZONE,
    addressLine: c.addressLine ?? "",
    city: c.city ?? "",
    country: c.country ?? "",
  };
}

export function clinicContactPayload(contact: ClinicContactFormState) {
  return {
    phone: contact.phone.trim() || undefined,
    email: contact.email.trim() || undefined,
    timezone: contact.timezone.trim() || DEFAULT_CLINIC_TIMEZONE,
    addressLine: contact.addressLine.trim() || undefined,
    city: contact.city.trim() || undefined,
    country: contact.country.trim() || undefined,
  };
}

type ClinicContactFieldsProps = {
  idPrefix: string;
  contact: ClinicContactFormState;
  onChange: (contact: ClinicContactFormState) => void;
  disabled?: boolean;
};

export function ClinicContactFields({
  idPrefix,
  contact,
  onChange,
  disabled,
}: ClinicContactFieldsProps) {
  const set = (patch: Partial<ClinicContactFormState>) =>
    onChange({ ...contact, ...patch });

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Contact & location
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-phone`}>Clinic phone</Label>
          <Input
            id={`${idPrefix}-phone`}
            value={contact.phone}
            onChange={(e) => set({ phone: e.target.value })}
            disabled={disabled}
            placeholder="+1 555 0100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={contact.email}
            onChange={(e) => set({ email: e.target.value })}
            disabled={disabled}
            placeholder="contact@clinic.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-timezone`}>Timezone</Label>
        <select
          id={`${idPrefix}-timezone`}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={contact.timezone}
          onChange={(e) => set({ timezone: e.target.value })}
          disabled={disabled}
        >
          {CLINIC_TIMEZONE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-address`}>Street address</Label>
        <Input
          id={`${idPrefix}-address`}
          value={contact.addressLine}
          onChange={(e) => set({ addressLine: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-city`}>City</Label>
          <Input
            id={`${idPrefix}-city`}
            value={contact.city}
            onChange={(e) => set({ city: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-country`}>Country</Label>
          <Input
            id={`${idPrefix}-country`}
            value={contact.country}
            onChange={(e) => set({ country: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
