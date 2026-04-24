"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isValidMalaysianPhone } from "@/lib/validators/phone";

interface PhoneCheckerProps {
  onSubmit: (phone: string) => void;
  onChange?: (phone: string) => void;
}

export default function PhoneChecker({ onSubmit, onChange }: PhoneCheckerProps) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    if (!phone.trim()) return;
    if (!isValidMalaysianPhone(phone)) {
      setError(t("errors.invalidPhone"));
      return;
    }
    onSubmit(phone.trim());
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-text-primary uppercase">
        {t("scan.phoneTitle")}
      </label>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); onChange?.(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("scan.phonePlaceholder")}
          className="
            w-full h-11 pl-10 pr-4
            bg-surface border-2 border-border rounded-md border-dashed
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-none focus:ring-1 focus:ring-primary/20
            transition-colors duration-150
          "
        />
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}
    </div>
  );
}
