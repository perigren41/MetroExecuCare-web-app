import { useState, useEffect, useRef } from "react";

export default function HRRequestStatsCards({ stats, onFilterClick, activeFilter }) {
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const statsContainerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (statsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = statsContainerRef.current;
        const hasMoreContent = scrollWidth > clientWidth;
        const isAtEnd = scrollWidth - scrollLeft - clientWidth < 10;
        setShowSwipeIndicator(hasMoreContent && !isAtEnd);
      }
    };

    checkScroll();
    const container = statsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [stats]);

  const cards = [
    {
      label: "All Requests",
      value: stats.total || 0,
      filterKey: "all",
    },
    {
      label: "Pending",
      value: stats.pending || 0,
      filterKey: "pending",
    },
    {
      label: "HR Processing",
      value: stats.hr_processing || 0,
      filterKey: "hr_processing",
    },
    {
      label: "Benefits Review",
      value: stats.benefits_review || 0,
      filterKey: "benefits_review",
    },
    {
      label: "Welfare Review",
      value: stats.welfare_review || 0,
      filterKey: "welfare_review",
    },
    {
      label: "Final Verification",
      value: stats.hr_final_verification || 0,
      filterKey: "hr_final_verification",
    },
    {
      label: "Approved",
      value: stats.approved || 0,
      filterKey: "approved",
    },
    {
      label: "Rejected",
      value: stats.rejected || 0,
      filterKey: "rejected",
    },
  ];

  const gradientStyle = {
    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)"
  };

  return (
    <>
      {/* All Screens: Always use horizontal scroll for single row */}
      <div className="relative mb-4">
        <div ref={statsContainerRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 lg:gap-3 pb-2" style={{ minWidth: 'max-content' }}>
            {cards.map((card, index) => {
              const isActive = activeFilter === card.filterKey;

              if (isActive) {
                // Active card with gradient background
                return (
                  <button
                    key={index}
                    onClick={() => onFilterClick(card.filterKey)}
                    className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg p-3 lg:p-4 text-left cursor-pointer flex-shrink-0 w-32 md:w-36 lg:w-36 xl:w-40"
                    style={gradientStyle}
                  >
                    <div className="text-xs font-semibold bg-white/90 text-blue-700 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                      Active
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-0.5 lg:mb-1 text-white">
                      {String(card.value).replace(/^0+/, '') || '0'}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      {card.label}
                    </div>
                  </button>
                );
              }

              // Inactive card with gradient border
              return (
                <div key={index} className="relative p-[2px] rounded-lg flex-shrink-0 w-32 md:w-36 lg:w-36 xl:w-40" style={gradientStyle}>
                  <button
                    onClick={() => onFilterClick(card.filterKey)}
                    className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3 lg:p-4 text-left cursor-pointer"
                  >
                    <div className="text-2xl md:text-3xl font-bold mb-0.5 lg:mb-1 text-gray-900">
                      {String(card.value).replace(/^0+/, '') || '0'}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {card.label}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Swipe Indicator - Positioned relative to stats cards on the right */}
        {showSwipeIndicator && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none pr-2">
            <div className="flex items-center animate-pulse bg-white/95 px-2 py-1 rounded-full shadow-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-600 mr-1">Swipe</span>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}