'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/analysis.store'
import { useLanguage } from '@/hooks/useLanguage'

import DimOverlay from './DimOverlay'
import TooltipCard from './TooltipCard'
import FakeHistoryCard from './FakeHistoryCard'
import FakeUploadPreview from './FakeUploadPreview'
import FakeAnalyzeButton from './FakeAnalyzeButton'
import ShareDrawer from '@/components/report/ShareDrawer'
import { useTrackRect } from './useTrackRect'
import { getStepConfig, MOCK_REPORT_DATA } from './onboarding-steps'

/** Shared cleanup helper for resize/scroll listeners */
function trackElement(
  findEl: () => Element | null,
  setRect: (r: DOMRect) => void,
  delay: number,
  onReady?: () => void,
  poll = false,
) {
  const update = () => { const el = findEl(); if (el) setRect(el.getBoundingClientRect()) }
  const timeout = setTimeout(() => { update(); onReady?.() }, delay)
  const interval = poll ? setInterval(update, 100) : null
  window.addEventListener('resize', update)
  window.addEventListener('scroll', update)
  return () => {
    clearTimeout(timeout)
    if (interval) clearInterval(interval)
    window.removeEventListener('resize', update)
    window.removeEventListener('scroll', update)
  }
}

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const setReport = useAnalysisStore((s) => s.setReport)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()

  // Element rects
  const [ctaRect, setCtaRect] = useState<DOMRect | null>(null)
  const [scanCardRect, setScanCardRect] = useState<DOMRect | null>(null)
  const [uploadZoneRect, setUploadZoneRect] = useState<DOMRect | null>(null)
  const [analyzeBtnRect, setAnalyzeBtnRect] = useState<DOMRect | null>(null)
  const [progressCircleRect, setProgressCircleRect] = useState<DOMRect | null>(null)
  const [reportCardRect, setReportCardRect] = useState<DOMRect | null>(null)

  // Delayed tooltip flags
  const [showStep3, setShowStep3] = useState(false)
  const [showStep4, setShowStep4] = useState(false)
  const [showStep5, setShowStep5] = useState(false)
  const [showStep12, setShowStep12] = useState(false)

  // Steps 8/10/11 — data-tour button tracking via hook
  const tourTarget = step === 8 ? 'share-score-btn' : step === 10 ? 'scan-again-btn' : step === 11 ? 'history-nav-btn' : ''
  const highlightRect = useTrackRect({
    active: ((step === 8 || step === 10) && pathname === '/report') || step === 11,
    selector: tourTarget, strategy: 'dataTour',
    delay: step === 11 ? 400 : 100, pollInterval: 100,
    scrollIntoView: step !== 11,
  })

  // ── Callbacks ──
  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.setItem('skamguard_onboarding_complete', 'true')
    setStep(0)
  }, [])

  const nextStep = useCallback(() => {
    if (step === 1) setStep(2)
    else if (step === 2) { setStep(3); router.push('/scan') }
    else if (step === 3) { setStep(4); router.push('/scan?mode=screenshot') }
    else if (step === 4) setStep(5)
    else if (step === 5) { setStep(6); router.push('/scan?mock_loading=true') }
    else if (step === 6) setStep(7)
    else if (step === 7) setStep(8)
    else if (step === 8) setStep(9)
    else if (step === 9) setStep(10)
    else if (step === 10) setStep(11)
    else if (step === 11) { setStep(12); router.push('/history') }
    else if (step === 12) {
      if (typeof window !== 'undefined') localStorage.setItem('skamguard_onboarding_complete', 'true')
      setStep(0); router.push('/')
    }
  }, [step, router])

  // ── Effects ──

  useEffect(() => {
    if (step !== 6) return
    const h = () => {
      setReport({ ...MOCK_REPORT_DATA, timestamp: new Date().toISOString() })
      setStep(7); router.push('/report')
    }
    window.addEventListener('mock_analysis_complete', h)
    return () => window.removeEventListener('mock_analysis_complete', h)
  }, [step, setReport, router])

  useEffect(() => { if (!localStorage.getItem('skamguard_onboarding_complete')) setStep(1) }, [])

  useEffect(() => {
    if (step === 0) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [step, dismiss])

  useEffect(() => {
    if (step !== 2) return
    return trackElement(() => document.querySelector('a[href="/scan"]'), setCtaRect, 50)
  }, [step])

  useEffect(() => {
    if (step !== 3 || pathname !== '/scan') return
    const cleanup = trackElement(
      () => Array.from(document.querySelectorAll('button')).find(b => b.className.includes('p-5') && b.className.includes('rounded-2xl')) ?? null,
      setScanCardRect, 300, () => setShowStep3(true),
    )
    return () => { cleanup(); setShowStep3(false) }
  }, [step, pathname])

  useEffect(() => {
    if (step !== 4 || pathname !== '/scan') return
    const cleanup = trackElement(
      () => Array.from(document.querySelectorAll('div')).find(el => typeof el.className === 'string' && el.className.includes('border-dashed')) ?? null,
      setUploadZoneRect, 500, () => setShowStep4(true),
    )
    return () => { cleanup(); setShowStep4(false) }
  }, [step, pathname])

  useEffect(() => {
    if (step !== 5 || pathname !== '/scan') return
    const cleanup = trackElement(
      () => Array.from(document.querySelectorAll('button')).find(b => typeof b.className === 'string' && b.className.includes('w-full') && b.className.includes('h-12')) ?? null,
      setAnalyzeBtnRect, 50, () => setShowStep5(true),
    )
    return () => { cleanup(); setShowStep5(false) }
  }, [step, pathname])

  useEffect(() => {
    if (step === 6 && pathname === '/scan')
      return trackElement(() => document.getElementById('analyzing-content'), setProgressCircleRect, 0, undefined, true)
    if (step === 7 && pathname === '/report')
      return trackElement(() => document.getElementById('report-risk-card'), setReportCardRect, 0, undefined, true)
  }, [step, pathname])

  useEffect(() => {
    if (step !== 12 || pathname !== '/history') return
    const t = setTimeout(() => setShowStep12(true), 300)
    return () => { clearTimeout(t); setShowStep12(false) }
  }, [step, pathname])

  // ── Render ──
  if (step === 0) return null
  const cfg = getStepConfig(step)

  /** Resolve a step config into translated TooltipCard props */
  const tooltipProps = cfg ? {
    headline: t(cfg.headlineKey),
    subtext: t(cfg.subtextKey),
    tip: cfg.tipKey ? t(cfg.tipKey) : undefined,
    notchPosition: cfg.notchPosition,
  } : null

  return (
    <AnimatePresence mode="wait">
      {/* Step 1 — Welcome */}
      {step === 1 && (
        <DimOverlay key="s1" highlightRect={null}>
          <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl sm:rounded-2xl px-6 py-8 shadow-2xl z-10">
              <div className="bg-sky-100 rounded-2xl p-6 flex justify-center mb-6">
                <Image src="/images/onboarding-suspicious-message.png" alt="Suspicious message illustration" width={180} height={180} className="object-contain h-[180px] w-auto" priority />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 mb-3 tracking-tight">{t('onboarding.step1.headline')}</h2>
              <p className="text-slate-600 text-center mb-8 text-[15px] sm:text-base leading-relaxed max-w-sm mx-auto">
                {t('onboarding.step1.subtext1')} <span className="font-bold">{t('onboarding.step1.millions')}</span> {t('onboarding.step1.of')} <span className="font-bold">{t('onboarding.step1.malaysians')}</span> {t('onboarding.step1.subtext2')}
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
                <button onClick={nextStep} className="w-full bg-primary hover:bg-primary-dark text-text-inverse font-bold py-3.5 rounded-full transition-colors text-base">{t('onboarding.step1.showMeHow')}</button>
                <button onClick={dismiss} className="w-full text-text-secondary hover:text-text-primary text-sm font-medium underline underline-offset-4 transition-colors py-2">{t('onboarding.step1.skip')}</button>
              </div>
            </div>
          </div>
        </DimOverlay>
      )}

      {/* Step 2 — CTA */}
      {step === 2 && tooltipProps && (
        <DimOverlay key="s2" highlightRect={ctaRect} cursor onClick={nextStep}>
          {ctaRect && <div className="absolute pointer-events-none" style={{ top: ctaRect.bottom + 16, left: ctaRect.left, width: ctaRect.width }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 3 — Scan card */}
      {step === 3 && pathname === '/scan' && showStep3 && tooltipProps && (
        <DimOverlay key="s3" highlightRect={scanCardRect} cursor onClick={nextStep}>
          {scanCardRect && <div className="absolute pointer-events-none" style={{ top: scanCardRect.bottom + 16, left: scanCardRect.left, width: scanCardRect.width }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 4 — Upload */}
      {step === 4 && pathname === '/scan' && showStep4 && tooltipProps && (
        <DimOverlay key="s4" highlightRect={uploadZoneRect} cursor onClick={nextStep}>
          {uploadZoneRect && <div className="absolute pointer-events-none" style={{ top: uploadZoneRect.bottom + 16, left: uploadZoneRect.left, width: uploadZoneRect.width }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 5 — Fake preview + analyse */}
      {step === 5 && pathname === '/scan' && showStep5 && tooltipProps && (
        <DimOverlay key="s5" highlightRect={analyzeBtnRect} borderRadius="rounded-sm" cursor onClick={nextStep}>
          <div className="absolute inset-0 pointer-events-none">
            {uploadZoneRect && <FakeUploadPreview uploadZoneRect={uploadZoneRect} />}
            {analyzeBtnRect && <FakeAnalyzeButton analyzeBtnRect={analyzeBtnRect} label={t('onboarding.step5.analyseNow')} />}
            {analyzeBtnRect && <div className="absolute" style={{ top: analyzeBtnRect.bottom + 16, left: analyzeBtnRect.left, width: analyzeBtnRect.width, zIndex: 60 }}><TooltipCard {...tooltipProps} /></div>}
          </div>
        </DimOverlay>
      )}

      {/* Step 6 — Analysing (no click) */}
      {step === 6 && tooltipProps && (
        <DimOverlay key="s6" highlightRect={progressCircleRect} borderRadius="rounded-3xl" padding={16} className="flex flex-col items-center justify-end pb-[10vh] p-4">
          <div className="relative z-[60] w-[calc(100vw-2rem)] max-w-[400px] border border-slate-100 rounded-2xl"><TooltipCard {...tooltipProps} /></div>
        </DimOverlay>
      )}

      {/* Step 7 — Report */}
      {step === 7 && tooltipProps && (
        <DimOverlay key="s7" highlightRect={reportCardRect} borderRadius="rounded-3xl" padding={8} cursor onClick={nextStep}>
          {reportCardRect && <div className="absolute z-50 w-[calc(100vw-2rem)] max-w-[400px]" style={{ top: reportCardRect.top - 24, left: '50%', transform: 'translate(-50%, -100%)' }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 8 — Share */}
      {step === 8 && tooltipProps && (
        <DimOverlay key="s8" highlightRect={highlightRect} borderRadius="rounded-xl" cursor onClick={nextStep}>
          {highlightRect && <div className="fixed z-[60] w-full max-w-[400px]" style={{ bottom: window.innerHeight - highlightRect.top + 16, left: '50%', transform: 'translateX(-50%)' }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 9 — Drawer */}
      {step === 9 && tooltipProps && (
        <DimOverlay key="s9" highlightRect={null} cursor onClick={nextStep}>
          <ShareDrawer isOpen onClose={nextStep} score={80} verdict="DANGEROUS" isTourActive />
          <div className="absolute bottom-[360px] left-0 w-full max-w-[400px] z-[110]"><TooltipCard {...tooltipProps} /></div>
        </DimOverlay>
      )}

      {/* Step 10 — Scan Again */}
      {step === 10 && tooltipProps && (
        <DimOverlay key="s10" highlightRect={highlightRect} borderRadius="rounded-xl" cursor onClick={nextStep}>
          {highlightRect && <div className="fixed z-[60] w-full max-w-[400px]" style={{ bottom: window.innerHeight - highlightRect.top + 16, left: '50%', transform: 'translateX(-50%)' }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 11 — History nav */}
      {step === 11 && tooltipProps && (
        <DimOverlay key="s11" highlightRect={highlightRect} borderRadius="rounded-full" cursor onClick={nextStep}>
          {highlightRect && <div className="fixed z-[60] w-full max-w-[400px]" style={{ bottom: window.innerHeight - highlightRect.top + 24, left: '50%', transform: 'translateX(-50%)' }}><TooltipCard {...tooltipProps} /></div>}
        </DimOverlay>
      )}

      {/* Step 12 — History card */}
      {step === 12 && pathname === '/history' && showStep12 && tooltipProps && (
        <DimOverlay key="s12" highlightRect={null} cursor onClick={nextStep}>
          <div className="absolute left-4 right-4 z-50" style={{ top: 140 }}><FakeHistoryCard t={t} /></div>
          <div className="absolute z-[60] w-full max-w-[400px]" style={{ top: 280, left: '50%', transform: 'translateX(-50%)' }}>
            <TooltipCard {...tooltipProps}>
              <button className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-sky-600 transition-colors" onClick={nextStep}>{t('onboarding.step12.gotIt')}</button>
            </TooltipCard>
          </div>
        </DimOverlay>
      )}
    </AnimatePresence>
  )
}
