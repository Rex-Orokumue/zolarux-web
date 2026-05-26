'use client';
// components/reviews/StarRating.tsx
// Reusable star rating display + interactive input

import React from 'react';

interface StarRatingProps {
  rating: number;           // 0–5, supports decimals for display
  max?: number;
  size?: number;            // px
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  max = 5,
  size = 20,
  interactive = false,
  onChange,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const display = hovered ?? rating;

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Star rating' : `Rating: ${rating} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = display >= starValue;
        const halfFilled = !filled && display >= starValue - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            style={{ width: size, height: size }}
            className={`relative flex-shrink-0 transition-transform duration-100 ${
              interactive
                ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FFA600] focus:ring-offset-1 rounded-sm'
                : 'cursor-default'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
            >
              {/* Background star (empty) */}
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#E5E7EB"
                stroke="#D1D5DB"
                strokeWidth="0.5"
              />
              {/* Filled overlay */}
              {(filled || halfFilled) && (
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="#FFA600"
                  stroke="#FFA600"
                  strokeWidth="0.5"
                  style={
                    halfFilled
                      ? {
                          clipPath: 'inset(0 50% 0 0)',
                        }
                      : undefined
                  }
                />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ---- Compact inline variant used in lists ----
export function StarBadge({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFA600">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span className="text-xs font-semibold text-amber-700">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-amber-600">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}