/**
 * Static content configuration for each onboarding tour step.
 * Uses i18n key paths — resolved at render time by the `t()` function.
 *
 * @module components/onboarding/onboarding-steps
 */

export type NotchPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface OnboardingStepConfig {
  step: number
  /** i18n key for the headline, e.g. "onboarding.step2.headline" */
  headlineKey: string
  /** i18n key for the subtext */
  subtextKey: string
  /** i18n key for the optional tip */
  tipKey?: string
  notchPosition: NotchPosition
}

/**
 * Static tooltip config for each step (Step 1 uses a custom modal).
 */
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  { step: 2,  headlineKey: 'onboarding.step2.headline',  subtextKey: 'onboarding.step2.subtext',  notchPosition: 'top-left' },
  { step: 3,  headlineKey: 'onboarding.step3.headline',  subtextKey: 'onboarding.step3.subtext',  notchPosition: 'top-left' },
  { step: 4,  headlineKey: 'onboarding.step4.headline',  subtextKey: 'onboarding.step4.subtext',  tipKey: 'onboarding.step4.tip', notchPosition: 'top-left' },
  { step: 5,  headlineKey: 'onboarding.step5.headline',  subtextKey: 'onboarding.step5.subtext',  notchPosition: 'top-left' },
  { step: 6,  headlineKey: 'onboarding.step6.headline',  subtextKey: 'onboarding.step6.subtext',  notchPosition: 'top-center' },
  { step: 7,  headlineKey: 'onboarding.step7.headline',  subtextKey: 'onboarding.step7.subtext',  notchPosition: 'bottom-center' },
  { step: 8,  headlineKey: 'onboarding.step8.headline',  subtextKey: 'onboarding.step8.subtext',  notchPosition: 'bottom-left' },
  { step: 9,  headlineKey: 'onboarding.step9.headline',  subtextKey: 'onboarding.step9.subtext',  notchPosition: 'bottom-left' },
  { step: 10, headlineKey: 'onboarding.step10.headline', subtextKey: 'onboarding.step10.subtext', notchPosition: 'bottom-left' },
  { step: 11, headlineKey: 'onboarding.step11.headline', subtextKey: 'onboarding.step11.subtext', notchPosition: 'bottom-left' },
  { step: 12, headlineKey: 'onboarding.step12.headline', subtextKey: 'onboarding.step12.subtext', notchPosition: 'top-right' },
]

/** Mock report data used during onboarding step 6 auto-advance */
export const MOCK_REPORT_DATA = {
  overallScore: 80,
  riskLevel: 'high' as const,
  verdict: 'DANGEROUS' as const,
  scamType: 'macauScam' as const,
  redFlags: [
    'Mengaku sebagai pihak berkuasa (polis/mahkamah)',
    'Mendesak untuk tindakan segera',
  ],
  explanation: 'This message is likely a scam.',
  actionPlan: [
    {
      type: 'do_not_pay' as const,
      label: 'JANGAN pindahkan wang ke mana-mana akaun',
    },
    {
      type: 'call_nsrc' as const,
      label: 'Hubungi NSRC 997 segera (8 pagi - 8 malam)',
      phone: '997',
    },
  ],
  extractedContent: {
    messageText: 'Mock analysis content',
    urls: [] as string[],
    phoneNumbers: [] as string[],
    sender: 'Unknown',
  },
  phoneResult: null,
  urlResults: [] as never[],
  semakMuleUrl: null,
}

/** Look up step config by step number */
export function getStepConfig(step: number): OnboardingStepConfig | undefined {
  return ONBOARDING_STEPS.find((s) => s.step === step)
}
