import React from "react";
import CircleButton from "./CircleButton";

export default function SummaryCard() {
  // Sample history (only 4 items)
  const history = [
    { date: "2025-04-20", package: "Regular Package", location: "Makati Medical Center", status: "Approved" },
    { date: "2024-03-17", package: "Regular Package", location: "St. Lukes Medical Center", status: "Approved" },
    { date: "2023-07-30", package: "Special Request", location: "The Medical City Clinic", status: "Approved" },
    { date: "2022-04-15", package: "Regular Package", location: "Makati Medical Center", status: "Approved" },
  ];

  // ✅ Ensure at least 10 rows (fill with empty placeholders)
  const paddedHistory = [
    ...history,
    ...Array.from({ length: Math.max(0, 9 - history.length) }, () => ({
      date: "-",
      package: "-",
      location: "-",
      status: "-",
    })),
  ];

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50 gap-4"
    >
      {/* Header */}
      <div className="text-left">
        <h2 className="text-blue-900 font-semibold">Summary</h2>
        <p className="text-sm">Your activity overview in MetroExecuCare</p>
      </div>

      {/* History Table */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col 
          outline outline-2 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 gap-4">
        <table className="w-full text-xs">
          <thead className="bg-purple-100 text-left">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Package</th>
              <th className="p-2">Location</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paddedHistory.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 text-blue-600">{item.date}</td>
                <td className="p-2">{item.package}</td>
                <td className="p-2">{item.location}</td>
                <td className="p-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col 
          outline outline-2 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50">
        <h2 className="text-blue-900 text-sm font-semibold mb-4 text-left">Notes</h2>
        <textarea
          placeholder="Write down notes or reminders..."
          className="w-full border rounded-lg p-2 h-22 resize-none"
        ></textarea>
        <div className="flex gap-2 mt-3">
          <CircleButton text="Save" color="bg-blue-600" />
          <CircleButton text="Cancel" color="bg-gray-400" />
        </div>
      </div>
    </div>
  );
}
