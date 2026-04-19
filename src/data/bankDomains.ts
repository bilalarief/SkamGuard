/**
 * Official Malaysian bank domain registry for phishing detection.
 * Used by the URL checker to compare suspicious URLs against real bank domains.
 *
 * @module data/bankDomains
 */

export interface BankDomainEntry {
  /** Bank identifier */
  id: string
  /** Display name */
  name: string
  /** All official domains and subdomains */
  officialDomains: string[]
  /** Common keywords scammers use in phishing URLs */
  phishingKeywords: string[]
}

/** Official Malaysian bank domains — verified as of 2025 */
export const MALAYSIAN_BANK_DOMAINS: BankDomainEntry[] = [
  {
    id: 'maybank',
    name: 'Maybank',
    officialDomains: ['maybank.com.my', 'maybank2u.com.my', 'm2u.com.my', 'maybank.com'],
    phishingKeywords: ['maybank', 'maybank2u', 'm2u', 'may-bank', 'maybankk'],
  },
  {
    id: 'cimb',
    name: 'CIMB Bank',
    officialDomains: ['cimbbank.com.my', 'cimbclicks.com.my', 'cimb.com.my', 'cimb.com'],
    phishingKeywords: ['cimb', 'cimbbank', 'cimbclick', 'cimb-bank', 'cimbclicks'],
  },
  {
    id: 'rhb',
    name: 'RHB Bank',
    officialDomains: ['rhbgroup.com', 'rhbonline.com', 'rhb.com.my'],
    phishingKeywords: ['rhb', 'rhbbank', 'rhb-bank', 'rhbonline'],
  },
  {
    id: 'publicbank',
    name: 'Public Bank',
    officialDomains: ['publicbank.com.my', 'pbebank.com', 'pbbank.com.my'],
    phishingKeywords: ['publicbank', 'pbebank', 'public-bank', 'pbbank'],
  },
  {
    id: 'ambank',
    name: 'AmBank',
    officialDomains: ['ambank.com.my', 'ambankgroup.com', 'ambanking.com.my'],
    phishingKeywords: ['ambank', 'ambanking', 'am-bank', 'ambankk'],
  },
  {
    id: 'hongleong',
    name: 'Hong Leong Bank',
    officialDomains: ['hlb.com.my', 'hongleongbank.com.my', 'hongleong.com.my'],
    phishingKeywords: ['hongleong', 'hlb', 'hong-leong', 'hongleongbank'],
  },
  {
    id: 'bankislam',
    name: 'Bank Islam',
    officialDomains: ['bankislam.com.my', 'bankislam.com'],
    phishingKeywords: ['bankislam', 'bank-islam', 'bislam'],
  },
  {
    id: 'bsn',
    name: 'Bank Simpanan Nasional',
    officialDomains: ['bsn.com.my', 'mybsn.com.my'],
    phishingKeywords: ['bsn', 'mybsn', 'bank-simpanan'],
  },
  {
    id: 'affin',
    name: 'Affin Bank',
    officialDomains: ['affinbank.com.my', 'affinalways.com'],
    phishingKeywords: ['affin', 'affinbank', 'affin-bank'],
  },
  {
    id: 'ocbc',
    name: 'OCBC Bank',
    officialDomains: ['ocbc.com.my', 'ocbc.com'],
    phishingKeywords: ['ocbc', 'ocbcbank'],
  },
  {
    id: 'hsbc',
    name: 'HSBC Malaysia',
    officialDomains: ['hsbc.com.my', 'hsbc.co.uk'],
    phishingKeywords: ['hsbc', 'hsbcbank', 'hsbc-bank'],
  },
  {
    id: 'uob',
    name: 'UOB Malaysia',
    officialDomains: ['uob.com.my', 'uobgroup.com'],
    phishingKeywords: ['uob', 'uobbank', 'uob-bank'],
  },
]

/** Government / authority domains that are commonly impersonated */
export const GOVERNMENT_DOMAINS: BankDomainEntry[] = [
  {
    id: 'lhdn',
    name: 'LHDN (Inland Revenue)',
    officialDomains: ['hasil.gov.my', 'lhdn.gov.my'],
    phishingKeywords: ['lhdn', 'hasil', 'cukai', 'tax-refund-my'],
  },
  {
    id: 'pdrm',
    name: 'PDRM (Police)',
    officialDomains: ['rmp.gov.my', 'pdrm.gov.my'],
    phishingKeywords: ['pdrm', 'polis', 'rmp', 'police-my'],
  },
  {
    id: 'bnm',
    name: 'Bank Negara Malaysia',
    officialDomains: ['bnm.gov.my', 'bnm.my'],
    phishingKeywords: ['bnm', 'banknegara', 'bank-negara'],
  },
  {
    id: 'sprm',
    name: 'SPRM (Anti-Corruption)',
    officialDomains: ['sprm.gov.my'],
    phishingKeywords: ['sprm', 'macc'],
  },
]

/**
 * Checks if a domain is a phishing attempt targeting a known Malaysian institution.
 * Compares the URL domain against official domains and phishing keywords.
 */
export function detectBankPhishing(domain: string): {
  isPhishing: boolean
  targetBank: BankDomainEntry | null
  officialDomain: string | null
  similarity: number
} {
  const lowerDomain = domain.toLowerCase()
  const allTargets = [...MALAYSIAN_BANK_DOMAINS, ...GOVERNMENT_DOMAINS]

  for (const target of allTargets) {
    // Check if it IS an official domain (not phishing)
    if (target.officialDomains.some((d) => lowerDomain === d || lowerDomain.endsWith(`.${d}`))) {
      return { isPhishing: false, targetBank: null, officialDomain: null, similarity: 0 }
    }

    // Check if domain contains phishing keywords but is NOT official
    for (const keyword of target.phishingKeywords) {
      if (lowerDomain.includes(keyword)) {
        const officialDomain = target.officialDomains[0]
        // Calculate basic similarity
        const similarity = calculateSimilarity(lowerDomain, officialDomain)
        if (similarity > 0.3) {
          return {
            isPhishing: true,
            targetBank: target,
            officialDomain,
            similarity,
          }
        }
      }
    }
  }

  return { isPhishing: false, targetBank: null, officialDomain: null, similarity: 0 }
}

/**
 * Similarity Checking between the potential scam domain and official domains
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigramsA = new Set<string>()
  for (let i = 0; i < a.length - 1; i++) {
    bigramsA.add(a.substring(i, i + 2))
  }

  let intersection = 0
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2)
    if (bigramsA.has(bigram)) {
      intersection++
      bigramsA.delete(bigram)
    }
  }

  return (2 * intersection) / (a.length - 1 + b.length - 1)
}
