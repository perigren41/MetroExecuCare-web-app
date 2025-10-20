import React from "react";

export default function RequestStatsCards({ stats, loading }) {
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
    { label: "Total Requests", value: stats.total_requests || 0, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats.pending || 0, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "HR Stage", value: stats.hr_stage || 0, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Benefits Stage", value: stats.benefits_stage || 0, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Welfare Stage", value: stats.welfare_stage || 0, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Approved", value: stats.approved || 0, color: "text-green-600", bg: "bg-green-50" },
    { label: "Completed", value: stats.completed || 0, color: "text-green-700", bg: "bg-green-100" },
    { label: "Rejected", value: stats.rejected || 0, color: "text-red-600", bg: "bg-red-50" },
    { label: "Urgent", value: stats.urgent_requests || 0, color: "text-red-700", bg: "bg-red-100" },
    { label: "Overdue", value: stats.overdue || 0, color: "text-red-800", bg: "bg-red-200" },
    { label: "Unassigned", value: stats.unassigned_requests || 0, color: "text-gray-700", bg: "bg-gray-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bg} rounded-lg shadow p-4 transition-transform hover:scale-105`}>
          <div className="text-xs font-medium text-gray-600 mb-1">{card.label}</div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}