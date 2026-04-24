"use client";

import { useLanguage } from "@/hooks/useLanguage";

interface MessageCheckerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MessageChecker({ value, onChange }: MessageCheckerProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-primary uppercase">
        {t("scan.pasteTitle")}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("scan.pastePlaceholder")}
        rows={6}
        className="
          w-full p-4
          bg-surface border-2 border-dashed border-border rounded-2xl
          text-sm text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-none focus:border-solid focus:ring-1 focus:ring-primary/20
          transition-colors duration-150 resize-none
        "
      />
    </div>
  );
}
