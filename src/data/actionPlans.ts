/**
 * Action plan configuration data.
 * Contains action type metadata, visual configs, and emergency contacts.
 *
 * @module data/actionPlans
 */

import type { ActionType } from '@/types/analysis'

/** Step definition for static action plans (fallback when AI is unavailable) */
export interface ActionStep {
  id: string;
  labelKey: string;
  priority: "critical" | "high" | "normal";
}

/** Static action plans by risk level (used as fallback) */
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

/** Emergency contacts for Malaysia */
export const EMERGENCY_CONTACTS = {
  nsrc: { name: "NSRC", number: "997", hours: "8 AM - 8 PM" },
  police: { name: "PDRM Hotline", number: "03-2610 1559", hours: "24/7" },
  bnm: { name: "Bank Negara", number: "1-300-88-5465", hours: "Mon-Fri" },
  mcmc: { name: "MCMC", number: "1-800-188-030", hours: "Mon-Fri" },
  semakMule: { name: "Semak Mule", url: "https://semakmule.rmp.gov.my" },
};

/**
 * Metadata for each action type — URLs and phone numbers.
 * Used by risk-engine.ts to enrich Gemini's raw action items.
 * Dynamic entries (like semakMuleRedirectUrl) are handled at runtime.
 */
export const ACTION_TYPE_METADATA: Record<string, { url?: string; phone?: string }> = {
  call_police: { phone: '999' },
  call_nsrc: { phone: '997' },
  call_bnm: { phone: '1-300-88-5465', url: 'https://www.bnm.gov.my/consumer-alert' },
  check_semak_mule: { url: 'https://semakmule.rmp.gov.my' },
  report_skmm: { url: 'https://aduan.skmm.gov.my' },
  report_bnm: { url: 'https://www.bnm.gov.my/consumer-alert' },
}

/**
 * All valid action types.
 * Used to validate Gemini output before rendering in the frontend.
 */
export const VALID_ACTION_TYPES: ActionType[] = [
  'call_police', 'call_nsrc', 'call_bnm', 'block_number',
  'check_semak_mule', 'report_skmm', 'report_bnm',
  'delete_message', 'do_not_respond', 'do_not_click',
  'do_not_pay', 'verify_official', 'info',
]

/**
 * Visual configuration for each action type in the ActionButton component.
 * Defines icon name (string key), colors, and clickability.
 */
export const ACTION_VISUAL_CONFIG: Record<ActionType, {
  iconName: string
  bgColor: string
  iconBg: string
  iconColor: string
  isClickable: boolean
}> = {
  call_police: {
    iconName: 'Phone',
    bgColor: 'bg-[#FEF2F2] border-[#FCA5A5]/30',
    iconBg: 'bg-[#EF4444]/10',
    iconColor: 'text-[#DC2626]',
    isClickable: true,
  },
  call_nsrc: {
    iconName: 'Phone',
    bgColor: 'bg-[#FFF7ED] border-[#FDBA74]/30',
    iconBg: 'bg-[#F97316]/10',
    iconColor: 'text-[#EA580C]',
    isClickable: true,
  },
  call_bnm: {
    iconName: 'Phone',
    bgColor: 'bg-[#EFF6FF] border-[#93C5FD]/30',
    iconBg: 'bg-[#3B82F6]/10',
    iconColor: 'text-[#2563EB]',
    isClickable: true,
  },
  block_number: {
    iconName: 'Ban',
    bgColor: 'bg-[#FEF9C3] border-[#FDE047]/30',
    iconBg: 'bg-[#EAB308]/10',
    iconColor: 'text-[#CA8A04]',
    isClickable: false,
  },
  check_semak_mule: {
    iconName: 'ExternalLink',
    bgColor: 'bg-[#EFF6FF] border-[#93C5FD]/30',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    isClickable: true,
  },
  report_skmm: {
    iconName: 'Flag',
    bgColor: 'bg-[#F5F3FF] border-[#C4B5FD]/30',
    iconBg: 'bg-[#8B5CF6]/10',
    iconColor: 'text-[#7C3AED]',
    isClickable: true,
  },
  report_bnm: {
    iconName: 'ShieldAlert',
    bgColor: 'bg-[#EFF6FF] border-[#93C5FD]/30',
    iconBg: 'bg-[#3B82F6]/10',
    iconColor: 'text-[#2563EB]',
    isClickable: true,
  },
  delete_message: {
    iconName: 'Trash2',
    bgColor: 'bg-[#FEF2F2] border-[#FCA5A5]/20',
    iconBg: 'bg-[#EF4444]/10',
    iconColor: 'text-[#DC2626]',
    isClickable: false,
  },
  do_not_respond: {
    iconName: 'MessageCircleOff',
    bgColor: 'bg-[#F8FAFC] border-border',
    iconBg: 'bg-[#64748B]/10',
    iconColor: 'text-[#475569]',
    isClickable: false,
  },
  do_not_click: {
    iconName: 'Link2Off',
    bgColor: 'bg-[#FFF7ED] border-[#FDBA74]/20',
    iconBg: 'bg-[#F97316]/10',
    iconColor: 'text-[#EA580C]',
    isClickable: false,
  },
  do_not_pay: {
    iconName: 'BanknoteArrowDown',
    bgColor: 'bg-[#FEF2F2] border-[#FCA5A5]/20',
    iconBg: 'bg-[#EF4444]/10',
    iconColor: 'text-[#DC2626]',
    isClickable: false,
  },
  verify_official: {
    iconName: 'BadgeCheck',
    bgColor: 'bg-[#ECFDF5] border-[#6EE7B7]/30',
    iconBg: 'bg-[#10B981]/10',
    iconColor: 'text-[#059669]',
    isClickable: false,
  },
  info: {
    iconName: 'Info',
    bgColor: 'bg-[#F8FAFC] border-border',
    iconBg: 'bg-[#64748B]/10',
    iconColor: 'text-[#475569]',
    isClickable: false,
  },
}
