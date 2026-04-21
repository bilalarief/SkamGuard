import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ScamTypeCardProps {
  scamType: string;
}

export default function ScamTypeCard({ scamType }: ScamTypeCardProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
        {t("report.scamType")}
      </h2>
      <div className="p-4 bg-surface rounded-2xl border border-border">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-text-primary">
              {t(`scamTypes.${scamType}.name`)}
            </span>
            <span className="text-sm text-text-secondary">
              {" – "}{t(`scamTypes.${scamType}.desc`)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
