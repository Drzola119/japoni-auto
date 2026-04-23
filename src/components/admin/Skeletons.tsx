'use client';

import { cn } from '@/lib/utils';

// ─── Base shimmer atom ────────────────────────────────────────────────────────
interface ShimmerProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  style?: React.CSSProperties;
}

export function Shimmer({ className, rounded = 'md', style }: ShimmerProps) {
  const radiusMap = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#1A1A1A]',
        radiusMap[rounded],
        className
      )}
      style={style}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent"
        style={{
          transform: 'translateX(-100%)',
          animation: 'shimmer 1.6s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// ─── KPI Card Skeleton ────────────────────────────────────────────────────────
export function KPICardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 space-y-3">
      <Shimmer className="w-9 h-9" rounded="lg" />
      <Shimmer className="w-16 h-7" rounded="md" />
      <Shimmer className="w-28 h-3.5" rounded="sm" />
      <Shimmer className="w-20 h-2.5" rounded="sm" />
    </div>
  );
}

export function KPIRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────
interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  hasAvatar?: boolean;
  hasBadge?: boolean;
  hasActions?: boolean;
}

export function TableRowSkeleton({
  cols = 5,
  hasAvatar = false,
  hasBadge = false,
  hasActions = true,
}: Omit<TableSkeletonProps, 'rows'>) {
  return (
    <tr className="border-b border-[#1E1E1E]">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          {hasAvatar && <Shimmer className="w-9 h-9 flex-shrink-0" rounded="full" />}
          <div className="space-y-1.5 flex-1">
            <Shimmer className="h-3.5 w-32" rounded="sm" />
            <Shimmer className="h-2.5 w-24" rounded="sm" />
          </div>
        </div>
      </td>
      {Array.from({ length: cols - 2 }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          {hasBadge && i === 0 ? (
            <Shimmer className="h-5 w-20" rounded="full" />
          ) : (
            <div className="space-y-1.5">
              <Shimmer className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-16'}`} rounded="sm" />
              <Shimmer className="h-2.5 w-14" rounded="sm" />
            </div>
          )}
        </td>
      ))}
      {hasActions && (
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            <Shimmer className="w-7 h-7" rounded="md" />
            <Shimmer className="w-7 h-7" rounded="md" />
          </div>
        </td>
      )}
    </tr>
  );
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
  hasAvatar = false,
  hasBadge = false,
  hasActions = true,
}: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1E1E1E]">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <Shimmer className="h-2.5 w-16" rounded="sm" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton
              key={i}
              cols={cols}
              hasAvatar={hasAvatar}
              hasBadge={hasBadge}
              hasActions={hasActions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Listing Card Skeleton ────────────────────────────────────────────────────
export function ListingCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      <Shimmer className="w-full h-44" rounded="sm" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-3/4" rounded="sm" />
        <Shimmer className="h-5 w-1/2" rounded="sm" />
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16" rounded="full" />
          <Shimmer className="h-5 w-20" rounded="full" />
          <Shimmer className="h-5 w-14" rounded="full" />
        </div>
        <div className="flex gap-2 pt-1">
          <Shimmer className="h-8 flex-1" rounded="lg" />
          <Shimmer className="h-8 w-8" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── User/Seller Row Skeleton ─────────────────────────────────────────────────────
export function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1E1E1E]">
      <Shimmer className="w-9 h-9 flex-shrink-0" rounded="full" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Shimmer className="h-3.5 w-32" rounded="sm" />
        <Shimmer className="h-2.5 w-40" rounded="sm" />
      </div>
      <Shimmer className="h-5 w-16 flex-shrink-0" rounded="full" />
      <Shimmer className="h-3 w-20 flex-shrink-0" rounded="sm" />
      <div className="flex gap-1.5 flex-shrink-0">
        <Shimmer className="w-7 h-7" rounded="md" />
        <Shimmer className="w-7 h-7" rounded="md" />
      </div>
    </div>
  );
}

export function UserListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2" style={{ height }}>
        <div className="flex flex-col justify-between h-full pb-6 pr-2 space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-2.5 w-8" rounded="sm" />
          ))}
        </div>
        <div className="flex-1 flex flex-col justify-end gap-0">
          <Shimmer className="w-full" rounded="lg" style={{ height: `${height - 24}px` }} />
          <div className="flex justify-between mt-2 px-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Shimmer key={i} className="h-2.5 w-6" rounded="sm" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-6 pl-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="w-3 h-3" rounded="sm" />
            <Shimmer className="h-2.5 w-16" rounded="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut Chart Skeleton ─────────────────────────────────────────────────────
export function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <Shimmer className="w-full h-full" rounded="full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[#111111]" />
        </div>
      </div>
      <div className="w-full space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="w-2 h-2 flex-shrink-0" rounded="full" />
            <Shimmer className={`h-2.5 flex-1 ${i % 2 === 0 ? 'max-w-24' : 'max-w-32'}`} rounded="sm" />
            <Shimmer className="h-2.5 w-8 flex-shrink-0" rounded="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics Page Skeleton ───────────────────────────────────────────────────
export function AnalyticsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-6 w-40" rounded="lg" />
          <Shimmer className="h-3.5 w-56" rounded="sm" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20" rounded="lg" />
          ))}
        </div>
      </div>
      <KPIRowSkeleton count={4} />
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <Shimmer className="h-5 w-48 mb-6" rounded="md" />
        <ChartSkeleton height={320} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map(i => (
          <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <Shimmer className="h-5 w-40 mb-4" rounded="md" />
            <DonutSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Home Skeleton ─────────────────────────────────────────────────
export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Shimmer className="h-7 w-52" rounded="lg" />
          <Shimmer className="h-3.5 w-44" rounded="sm" />
        </div>
        <Shimmer className="h-8 w-32" rounded="lg" />
      </div>
      <KPIRowSkeleton count={4} />
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1E1E1E]">
          <Shimmer className="h-5 w-36" rounded="md" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-7 w-16" rounded="lg" />
            ))}
          </div>
        </div>
        <TableSkeleton rows={6} cols={6} hasAvatar hasBadge hasActions />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
          <Shimmer className="h-5 w-40 mb-4" rounded="md" />
          <ChartSkeleton height={200} />
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 space-y-3">
          <Shimmer className="h-5 w-32" rounded="md" />
          <UserListSkeleton rows={5} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TopSearchesWidgetSkeleton />
        </div>
      </div>
    </div>
  );
}

export function TopSearchesWidgetSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <Shimmer className="w-7 h-7" rounded="lg" />
          <div className="space-y-1">
            <Shimmer className="h-3.5 w-24" rounded="sm" />
            <Shimmer className="h-2 w-16" rounded="sm" />
          </div>
        </div>
        <Shimmer className="h-3 w-12" rounded="sm" />
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Shimmer className="w-3 h-3" rounded="sm" />
              <Shimmer className="w-1.5 h-1.5" rounded="full" />
              <Shimmer className="h-3 flex-1" rounded="sm" />
              <Shimmer className="h-3 w-6" rounded="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tracking / Security Page Skeleton ───────────────────────────────────────
export function TrackingPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-6 w-48" rounded="lg" />
          <Shimmer className="h-3.5 w-64" rounded="sm" />
        </div>
        <Shimmer className="h-8 w-28" rounded="lg" />
      </div>
      <KPIRowSkeleton count={4} />
      <div className="bg-[#0D1117] border border-[#1E2A38] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#1E2A38]">
          <Shimmer className="h-5 w-44" rounded="md" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-8 w-28" rounded="lg" />
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-5 py-3 border-b border-[#1E2A38]">
          <Shimmer className="h-9 w-52" rounded="lg" />
          <Shimmer className="h-9 w-36" rounded="lg" />
          <Shimmer className="h-9 w-48" rounded="lg" />
        </div>
        <TableSkeleton rows={10} cols={7} hasActions={false} />
      </div>
    </div>
  );
}

// ─── Search Analytics Page Skeleton ───────────────────────────────────────
export function SearchAnalyticsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-6 w-52" rounded="lg" />
          <Shimmer className="h-3.5 w-64" rounded="sm" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20" rounded="lg" />
          ))}
        </div>
      </div>
      <KPIRowSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1E1E1E]">
            <Shimmer className="h-5 w-40" rounded="md" />
            <Shimmer className="h-8 w-36" rounded="lg" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Shimmer className="w-4 h-3" rounded="sm" />
                <Shimmer className="h-5 w-16" rounded="full" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Shimmer className={`h-3.5 ${i % 3 === 0 ? 'w-32' : i % 3 === 1 ? 'w-44' : 'w-28'}`} rounded="sm" />
                    <Shimmer className="h-3 w-8" rounded="sm" />
                  </div>
                  <Shimmer className="h-1 w-full" rounded="full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 space-y-3">
              <Shimmer className="h-4 w-32" rounded="md" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Shimmer className="h-3 w-20" rounded="sm" />
                    <Shimmer className="h-3 w-8" rounded="sm" />
                  </div>
                  <Shimmer className="h-1.5 w-full" rounded="full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Approval Queue Skeleton ───────────────────────────────────────────────────
export function QueueCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <Shimmer className="w-full h-56 md:h-full" rounded="sm" />
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <Shimmer className="h-6 w-3/4" rounded="md" />
            <Shimmer className="h-7 w-1/2" rounded="md" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-6 w-20" rounded="full" />
            ))}
          </div>
          <Shimmer className="h-16 w-full" rounded="lg" />
          <div className="flex gap-3 pt-2">
            <Shimmer className="h-11 flex-1" rounded="xl" />
            <Shimmer className="h-11 flex-1" rounded="xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page header skeleton ─────────────────────────────────────────────────────
export function PageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Shimmer className="h-6 w-44" rounded="lg" />
        <Shimmer className="h-3.5 w-60" rounded="sm" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-9 w-28" rounded="lg" />
        <Shimmer className="h-9 w-28" rounded="lg" />
      </div>
    </div>
  );
}