"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isValidUrl } from "@/lib/validators/url";

interface UrlCheckerProps {
  onSubmit: (url: string) => void;
  onChange?: (url: string) => void;
}

export default function UrlChecker({ onSubmit, onChange }: UrlCheckerProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    if (!url.trim()) return;
    if (!isValidUrl(url)) {
      setError(t("errors.invalidUrl"));
      return;
    }
    onSubmit(url.trim());
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-text-primary uppercase">
        {t("scan.urlTitle")}
      </label>

      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); onChange?.(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("scan.urlPlaceholder")}
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
