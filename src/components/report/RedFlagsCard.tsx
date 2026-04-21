import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface RedFlagsCardProps {
  flags: string[];
}

export default function RedFlagsCard({ flags }: RedFlagsCardProps) {
  const { t } = useLanguage();

  if (!flags || flags.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
        {t("report.redFlags")}
      </h2>
      <div className="p-4 bg-surface rounded-2xl border border-border space-y-3">
        {flags.map((flag, i) => (
          <div key={i} className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
            <span className="text-sm text-text-primary leading-snug">{flag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
