import React from "react";

export default function HRRequestStatsCards({ stats, onFilterClick, activeFilter }) {
  const cards = [
    {
      key: "all",
      label: "All Requests",
      count: stats.total || 0,
      gradient: "from-blue-500 to-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      count: stats.pending || 0,
      gradient: "from-gray-500 to-gray-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "hr_processing",
      label: "HR Processing",
      count: stats.hr_processing || 0,
      gradient: "from-blue-600 to-blue-700",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      key: "benefits_review",
      label: "Benefits Review",
      count: stats.benefits_review || 0,
      gradient: "from-yellow-500 to-yellow-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "welfare_review",
      label: "Welfare Review",
      count: stats.welfare_review || 0,
      gradient: "from-orange-500 to-orange-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      key: "hr_final_verification",
      label: "Final Verification",
      count: stats.hr_final_verification || 0,
      gradient: "from-purple-500 to-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: "approved",
      label: "Approved",
      count: stats.approved || 0,
      gradient: "from-green-500 to-green-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "rejected",
      label: "Rejected",
      count: stats.rejected || 0,
      gradient: "from-red-500 to-red-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => (
        <button
          key={card.key}
          onClick={() => onFilterClick(card.key)}
          className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 ${
            activeFilter === card.key ? "ring-4 ring-blue-400" : ""
          }`}
        >
          <div className={`bg-gradient-to-br ${card.gradient} p-4 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg">{card.icon}</div>
              <div className="text-3xl font-bold">{card.count}</div>
            </div>
            <div className="text-sm font-medium opacity-90">{card.label}</div>
          </div>
        </button>
      ))}
    </div>
  );
}