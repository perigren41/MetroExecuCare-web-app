import React from "react";

export default function RequestStatsCards({ stats, loading, onFilterClick, activeFilter }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total",
      value: stats.total_requests || 0,
      icon: "📋",
      filterKey: "all",
      variant: "primary"
    },
    {
      label: "Pending",
      value: stats.pending || 0,
      icon: "⏳",
      filterKey: "pending",
      variant: "neutral"
    },
    {
      label: "In Progress",
      value: (stats.hr_stage || 0) + (stats.benefits_stage || 0) + (stats.welfare_stage || 0),
      icon: "🔄",
      filterKey: "in_progress",
      variant: "info"
    },
    {
      label: "Approved",
      value: (stats.approved || 0) + (stats.completed || 0),
      icon: "✓",
      filterKey: "approved",
      variant: "success"
    },
    {
      label: "Rejected",
      value: stats.rejected || 0,
      icon: "✕",
      filterKey: "rejected",
      variant: "danger"
    },
    {
      label: "Overdue",
      value: stats.overdue || 0,
      icon: "⚠",
      filterKey: "overdue",
      variant: "warning"
    },
    {
      label: "Unassigned",
      value: stats.unassigned_requests || 0,
      icon: "○",
      filterKey: "unassigned",
      variant: "neutral"
    },
  ];

  const getVariantStyles = (variant, isActive) => {
    const variants = {
      primary: isActive
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-400",
      neutral: isActive
        ? "bg-gray-600 text-white border-gray-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
      info: isActive
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400",
      success: isActive
        ? "bg-green-600 text-white border-green-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-green-400",
      danger: isActive
        ? "bg-red-600 text-white border-red-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-red-400",
      warning: isActive
        ? "bg-amber-600 text-white border-amber-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-amber-400",
    };
    return variants[variant] || variants.neutral;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {cards.map((card, index) => {
        const isActive = activeFilter === card.filterKey;
        return (
          <button
            key={index}
            onClick={() => onFilterClick(card.filterKey)}
            className={`
              relative overflow-hidden rounded-lg border-2 transition-all duration-200
              ${getVariantStyles(card.variant, isActive)}
              ${isActive ? 'shadow-lg scale-105' : 'shadow hover:shadow-md'}
              p-4 text-left
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`text-2xl ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                {card.icon}
              </span>
              {isActive && (
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
              {card.value}
            </div>
            <div className={`text-xs font-medium ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
              {card.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}