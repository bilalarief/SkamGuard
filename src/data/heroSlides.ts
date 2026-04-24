/**
 * Hero banner slide data for the home page carousel.
 * Each slide has an image, i18n key for badge/title, and styling config.
 *
 * Images are stored in /public/img/ — use next/image for optimization.
 *
 * @module data/heroSlides
 */

export interface HeroSlide {
  /** Unique slide ID */
  id: string
  /** Path to banner image in /public */
  imageSrc: string
  /** Alt text for accessibility */
  imageAlt: string
  /** i18n key for the badge label (e.g. "Berita", "Amaran", "Petua") */
  badgeKey: string
  /** i18n key for the slide title */
  titleKey: string
  /** Badge background color */
  badgeColor: string
  /** Badge text color */
  badgeTextColor: string
}

/**
 * Slide data array — add/remove slides here.
 * The component maps over this array dynamically.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    imageSrc: '/img/Banner1.png',
    imageAlt: 'RM1.47 billion scam losses news',
    badgeKey: 'home.heroSlides.news',
    titleKey: 'home.heroSlides.slide1Title',
    badgeColor: 'bg-white',
    badgeTextColor: 'text-[#003B73]',
  },
  {
    id: 'slide-2',
    imageSrc: '/img/Banner2.png',
    imageAlt: 'Online scam awareness alert',
    badgeKey: 'home.heroSlides.alert',
    titleKey: 'home.heroSlides.slide2Title',
    badgeColor: 'bg-red-500',
    badgeTextColor: 'text-white',
  },
  {
    id: 'slide-3',
    imageSrc: '/img/Banner3.png',
    imageAlt: 'SkamGuard verification tip',
    badgeKey: 'home.heroSlides.tip',
    titleKey: 'home.heroSlides.slide3Title',
    badgeColor: 'bg-emerald-500',
    badgeTextColor: 'text-white',
  },
]

/** Autoplay delay in milliseconds */
export const HERO_AUTOPLAY_DELAY = 5000
