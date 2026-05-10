'use client'

import Image from 'next/image'
import { m } from 'framer-motion'

interface FakeUploadPreviewProps {
  /** Bounding rect of the real upload zone to overlay on top of */
  uploadZoneRect: DOMRect
}

/**
 * Fake upload preview card shown during Step 5.
 * Renders a static image preview with a dismiss button
 * positioned exactly on top of the real upload dropzone area.
 */
export default function FakeUploadPreview({ uploadZoneRect }: FakeUploadPreviewProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute bg-slate-100 rounded-2xl border-2 border-transparent overflow-hidden"
      style={{
        top: uploadZoneRect.top,
        left: uploadZoneRect.left,
        width: uploadZoneRect.width,
        height: uploadZoneRect.height,
        zIndex: 50,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <button className="absolute top-3 right-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-slate-500 shadow-sm backdrop-blur-sm font-bold text-sm pointer-events-auto z-10">
          ×
        </button>
        <Image
          src="/images/onboarding-fake-message.png"
          alt="Fake Message"
          width={180}
          height={180}
          className="object-contain rounded-lg shadow-sm"
          style={{
            maxWidth: 'calc(100% - 2rem)',
            maxHeight: 'calc(100% - 2rem)',
          }}
        />
      </div>
    </m.div>
  )
}
