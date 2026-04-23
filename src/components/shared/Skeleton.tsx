/**
 * Reusable skeleton loader component with shimmer effect.
 * Use as placeholder while content loads.
 *
 * @module components/shared/Skeleton
 */

interface SkeletonProps {
  /** Width class (Tailwind). Defaults to "w-full" */
  width?: string;
  /** Height class (Tailwind). Defaults to "h-4" */
  height?: string;
  /** Border radius class. Defaults to "rounded-xl" */
  rounded?: string;
  /** Additional class names */
  className?: string;
}

export default function Skeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-xl",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${width} ${height} ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

/** Skeleton for a stats card (matches StatsSection layout) */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-4 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <Skeleton width="w-8" height="h-8" rounded="rounded-lg" />
      <Skeleton width="w-3/4" height="h-3" />
      <Skeleton width="w-1/2" height="h-6" />
    </div>
  );
}

/** Skeleton for the feature card (matches FeatureCardList layout) */
export function SkeletonFeatureCard() {
  return (
    <div className="rounded-2xl p-6 bg-surface-hover/60 h-[140px]">
      <div className="space-y-3 pr-16">
        <Skeleton width="w-16" height="h-3" />
        <Skeleton width="w-40" height="h-7" />
        <Skeleton width="w-5" height="h-5" rounded="rounded-full" />
      </div>
    </div>
  );
}

/** Full home page skeleton */
export function HomePageSkeleton() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-surface" aria-label="Loading...">
      {/* Hero skeleton */}
      <div className="-mt-14 h-[420px] relative w-full">
        <div className="w-full h-full skeleton rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 bg-[#F8FAFC] rounded-t-[32px] -mt-6 relative z-10 px-5 pt-8 pb-6 space-y-6">
        <div className="container-app space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonFeatureCard />
        </div>
      </div>
    </div>
  );
}

/** Scan page skeleton */
export function ScanPageSkeleton() {
  return (
    <div className="container-app py-6 space-y-6" aria-label="Loading...">
      <Skeleton width="w-3/4" height="h-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-5 bg-white shadow-sm flex items-center gap-4">
            <Skeleton width="w-12" height="h-12" rounded="rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton width="w-2/3" height="h-4" />
              <Skeleton width="w-full" height="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
