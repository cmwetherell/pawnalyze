'use client'

import React from 'react'

interface ChartSkeletonProps {
  variant?: 'line' | 'bar'
  height?: string
  className?: string
}

const ShimmerOverlay = () => (
  <div className="absolute inset-0 overflow-hidden rounded">
    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-[var(--text-muted)]/10 to-transparent" />
  </div>
)

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  variant = 'line',
  height = '500px',
  className = '',
}) => {
  return (
    <div className={className} style={{ height }}>
      <div className="relative h-full w-full rounded-lg bg-[var(--bg-surface-1)] p-4 pt-6 overflow-hidden">
        <ShimmerOverlay />

        {/* Y-axis label area */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2.5 w-6 rounded bg-[var(--border)]" />
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-8 mr-4 h-[calc(100%-40px)] relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-[var(--border)]/50 border-dashed" />
            ))}
          </div>

          {variant === 'line' ? (
            <svg
              viewBox="0 0 400 250"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              fill="none"
            >
              <path
                d="M 0 200 C 50 190, 80 160, 120 140 S 200 90, 260 100 S 340 60, 400 40"
                stroke="var(--border)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0 160 C 60 150, 100 170, 150 155 S 240 130, 300 145 S 370 120, 400 110"
                stroke="var(--border)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 0 100 C 40 110, 90 130, 140 150 S 220 180, 280 175 S 360 190, 400 200"
                stroke="var(--border)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0 140 C 50 135, 100 145, 160 138 S 250 150, 320 142 S 370 148, 400 145"
                stroke="var(--border)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-end justify-around gap-2 pb-1">
              {[65, 45, 80, 35, 70, 50, 85, 40].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[var(--border)]/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          )}

          {variant === 'line' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[var(--bg-surface-1)]/80 pl-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm bg-[var(--border)]" />
                  <div className="h-2.5 rounded bg-[var(--border)]" style={{ width: `${50 + i * 10}px` }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* X-axis label area */}
        <div className="ml-8 mr-4 flex justify-between mt-2">
          {[...Array(variant === 'bar' ? 8 : 6)].map((_, i) => (
            <div key={i} className="h-2.5 w-8 rounded bg-[var(--border)]" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChartSkeleton
