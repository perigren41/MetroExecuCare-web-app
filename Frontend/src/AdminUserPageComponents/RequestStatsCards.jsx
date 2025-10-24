import { useState, useEffect, useRef } from "react";

export default function RequestStatsCards({ stats, loading, onFilterClick, activeFilter }) {
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
  }, [stats, loading]);
  if (loading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="md:hidden overflow-x-auto scrollbar-hide mb-4">
          <div className="flex gap-2 pb-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-3 animate-pulse flex-shrink-0 w-28">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  const cards = [
    {
      label: "Total",
      value: stats.total_requests || 0,
      filterKey: "all",
      variant: "primary"
    },
    {
      label: "Pending",
      value: stats.pending || 0,
      filterKey: "pending",
      variant: "neutral"
    },
    {
      label: "In Progress",
      value: (stats.hr_stage || 0) + (stats.benefits_stage || 0) + (stats.welfare_stage || 0),
      filterKey: "in_progress",
      variant: "info"
    },
    {
      label: "Approved",
      value: (stats.approved || 0) + (stats.completed || 0),
      filterKey: "approved",
      variant: "success"
    },
    {
      label: "Rejected",
      value: stats.rejected || 0,
      filterKey: "rejected",
      variant: "danger"
    },
    {
      label: "Overdue",
      value: stats.overdue || 0,
      filterKey: "overdue",
      variant: "warning"
    },
    {
      label: "Unassigned",
      value: stats.unassigned_requests || 0,
      filterKey: "unassigned",
      variant: "neutral"
    },
  ];

  const gradientStyle = {
    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)"
  };

  return (
    <>
      {/* Mobile and Tablet: Horizontal Scroll */}
      <div className="lg:hidden relative mb-4">
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
                  className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg p-3 text-left cursor-pointer flex-shrink-0 w-32 md:w-36"
                  style={gradientStyle}
                >
                  <div className="text-xs font-semibold bg-white/90 text-blue-700 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                    Active
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-0.5 text-white">
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
              <div key={index} className="relative p-[2px] rounded-lg flex-shrink-0 w-32 md:w-36" style={gradientStyle}>
                <button
                  onClick={() => onFilterClick(card.filterKey)}
                  className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3 text-left cursor-pointer"
                >
                  <div className="text-2xl md:text-3xl font-bold mb-0.5 text-gray-900">
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

        {/* Swipe Indicator - Mobile and Tablet */}
        {showSwipeIndicator && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
            <div className="flex items-center animate-pulse bg-white/90 px-2 py-1 rounded-full shadow-lg">
              <span className="text-sm font-medium text-blue-600 mr-1">Swipe</span>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Grid Layout - Optimized for smaller screens */}
      <div className="hidden lg:grid grid-cols-4 xl:grid-cols-7 gap-2 lg:gap-3 mb-4 lg:mb-6">
        {cards.map((card, index) => {
          const isActive = activeFilter === card.filterKey;

          if (isActive) {
            // Active card with gradient background
            return (
              <button
                key={index}
                onClick={() => onFilterClick(card.filterKey)}
                className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg scale-105 p-2 md:p-3 lg:p-4 text-left cursor-pointer"
                style={gradientStyle}
              >
                <div className="flex items-start justify-between mb-1 md:mb-2">
                  <span className="text-xs font-semibold bg-white/90 text-blue-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-0.5 md:mb-1 text-white">
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
            <div key={index} className="relative p-[2px] rounded-lg" style={gradientStyle}>
              <button
                onClick={() => onFilterClick(card.filterKey)}
                className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-2 md:p-3 lg:p-4 text-left cursor-pointer"
              >
                <div className="text-2xl md:text-3xl font-bold mb-0.5 md:mb-1 text-gray-900">
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
    </>
  );
}