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
      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden relative mb-4">
        <div ref={statsContainerRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {cards.map((card, index) => {
              const isActive = activeFilter === card.filterKey;

              if (isActive) {
                // Active card with gradient background
                return (
                  <button
                    key={index}
                    onClick={() => onFilterClick(card.filterKey)}
                    className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg p-3 text-left cursor-pointer flex-shrink-0 w-28"
                    style={gradientStyle}
                  >
                    <div className="text-xs font-semibold bg-white/90 text-blue-700 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                      Active
                    </div>
                    <div className="text-2xl font-bold mb-0.5 text-white">
                      {card.value}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      {card.label}
                    </div>
                  </button>
                );
              }

              // Inactive card with gradient border
              return (
                <div key={index} className="relative p-[2px] rounded-lg flex-shrink-0 w-28" style={gradientStyle}>
                  <button
                    onClick={() => onFilterClick(card.filterKey)}
                    className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3 text-left cursor-pointer"
                  >
                    <div className="text-2xl font-bold mb-0.5 text-gray-900">
                      {card.value}
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

        {/* Swipe Indicator - Mobile */}
        {showSwipeIndicator && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
            <div className="flex items-center animate-pulse">
              <span className="text-sm font-medium text-blue-600 mr-1">Swipe</span>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {cards.map((card, index) => {
          const isActive = activeFilter === card.filterKey;

          if (isActive) {
            // Active card with gradient background
            return (
              <button
                key={index}
                onClick={() => onFilterClick(card.filterKey)}
                className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg scale-105 p-4 text-left cursor-pointer"
                style={gradientStyle}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold bg-white/90 text-blue-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1 text-white">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-white/90">
                  {card.label}
                </div>
              </button>
            );
          }

          // Inactive card with gradient border
          return (
            <div key={index} className="relative p-[2px] rounded-lg" style={gradientStyle}>
              <button
                onClick={() => onFilterClick(card.filterKey)}
                className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-4 text-left cursor-pointer"
              >
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  {card.label}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}