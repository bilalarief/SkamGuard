'use client'

import Image from 'next/image'
import { m } from 'framer-motion'

interface FakeUploadPreviewProps {
  /** Bounding rect of the real upload zone to overlay on top of */
  uploadZoneRect: DOMRect
}

/**
 * Fake upload preview card shown during Step 5.
 * Renders a static image preview with a dismiss button on top
 * of the real upload dropzone area.
 */
export default function FakeUploadPreview({ uploadZoneRect }: FakeUploadPreviewProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-transparent"
      style={{
        top: uploadZoneRect.top,
        left: uploadZoneRect.left,
        width: uploadZoneRect.width,
        height: uploadZoneRect.height,
        zIndex: 50,
      }}
    >
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-slate-500 shadow-sm backdrop-blur-sm font-bold text-lg pointer-events-auto">
          ×
        </button>
        <Image
          src="/images/onboarding-fake-message.png"
          alt="Fake Message"
          width={200}
          height={200}
          className="max-h-full object-contain rounded-lg shadow-sm"
        />
      </div>
    </m.div>
  )
}
