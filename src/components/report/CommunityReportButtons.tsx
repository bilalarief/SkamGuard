import { ExternalLink, Flag, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CommunityReportButtonsProps {
  phoneResult: { number: string } | null;
  firstUrl?: string;
  semakMuleUrl: string | null;
  onOpenModal: (type: "phone" | "url") => void;
}

export default function CommunityReportButtons({
  phoneResult,
  firstUrl,
  semakMuleUrl,
  onOpenModal,
}: CommunityReportButtonsProps) {
  const { t } = useLanguage();

  function handleSemakMule() {
    if (semakMuleUrl) window.open(semakMuleUrl, "_blank");
  }

  return (
    <>
      <section className="space-y-2">
        {/* Further Verification Title */}
        {(phoneResult?.number !== "UNKNOWN" || firstUrl) && (
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mt-2">
            {t("report.furtherVerification")}
          </h2>
        )}

        {/* Semak Mule + Phone Community Report */}
        {phoneResult && phoneResult.number !== "UNKNOWN" && (
          <>
            <button
              onClick={handleSemakMule}
              className="w-full flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-text-primary">{t("report.semakMuleTitle")}</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t("report.semakMuleDesc").replace("{{number}}", phoneResult.number)}
                </p>
              </div>
            </button>

            <button
              onClick={() => onOpenModal("phone")}
              className="w-full flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-accent/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-accent-dark" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-text-primary">{t("report.reportNumberTitle")}</h3>
                <p className="text-xs text-text-secondary mt-0.5">{t("report.reportNumberDesc")}</p>
              </div>
            </button>
          </>
        )}

        {/* URL Community Report */}
        {firstUrl && (
          <button
            onClick={() => onOpenModal("url")}
            className="w-full flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-accent/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5 text-accent-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-text-primary">{t("report.reportUrlTitle")}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{t("report.reportUrlDesc")}</p>
            </div>
          </button>
        )}
      </section>
    </>
  );
}
