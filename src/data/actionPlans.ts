export interface ActionStep {
  id: string;
  labelKey: string;
  priority: "critical" | "high" | "normal";
}

export const ACTION_PLANS: Record<string, ActionStep[]> = {
  high: [
    { id: "dont-transfer", labelKey: "report.actionItems.dontTransfer", priority: "critical" },
    { id: "screenshot-evidence", labelKey: "report.actionItems.screenshot", priority: "critical" },
    { id: "call-nsrc", labelKey: "report.actionItems.callNSRC", priority: "critical" },
    { id: "block-sender", labelKey: "report.actionItems.blockSender", priority: "high" },
    { id: "report-police", labelKey: "report.actionItems.reportPolice", priority: "high" },
  ],
  medium: [
    { id: "dont-click", labelKey: "report.actionItems.dontClick", priority: "high" },
    { id: "dont-share-otp", labelKey: "report.actionItems.dontShareOTP", priority: "high" },
    { id: "verify-identity", labelKey: "report.actionItems.verifyIdentity", priority: "normal" },
    { id: "block-sender", labelKey: "report.actionItems.blockSender", priority: "normal" },
  ],
  low: [
    { id: "verify-identity", labelKey: "report.actionItems.verifyIdentity", priority: "normal" },
    { id: "check-semak-mule", labelKey: "report.actionItems.checkSemakMule", priority: "normal" },
  ],
};

export const EMERGENCY_CONTACTS = {
  nsrc: { name: "NSRC", number: "997", hours: "8 AM - 8 PM" },
  police: { name: "PDRM Hotline", number: "03-2610 1559", hours: "24/7" },
  bnm: { name: "Bank Negara", number: "1-300-88-5465", hours: "Mon-Fri" },
  mcmc: { name: "MCMC", number: "1-800-188-030", hours: "Mon-Fri" },
  semakMule: { name: "Semak Mule", url: "https://semakmule.rmp.gov.my" },
};
