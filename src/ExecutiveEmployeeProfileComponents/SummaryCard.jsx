import React, { useState } from "react";
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

  // 🔹 Notes state + lock/unlock
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setNotes("");
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50 gap-4"
    >
      {/* Header */}
      <div className="text-left">
        <h2 className="text-blue-900 font-semibold sm:text-base">Summary</h2>
        <p className="text-xs">Your activity overview in MetroExecuCare</p>
      </div>

      {/* History Table */}
      <div className="bg-white shadow-md rounded-2xl pt-2 pb-6 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 gap-2">
        <h1 className="text-xs sm:text-xs text-left">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your past ten (10) requests
        </h1>
        <table className="w-full text-xs">
          <thead className="bg-purple-300 text-center p-1">
            <tr>
              <th className="p-1">Date</th>
              <th className="p-1">Package</th>
              <th className="p-1">Location</th>
              <th className="p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {paddedHistory.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1 text-blue-600">{item.date}</td>
                <td className="p-1">{item.package}</td>
                <td className="p-1">{item.location}</td>
                <td className="p-1">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="bg-white shadow-md rounded-2xl py-3 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 text-xs">
        <h2 className="text-blue-900 text-sm font-semibold mb-2 text-left sm:text-sm">Notes: Write down notes or reminders of yourself ...</h2>
        <textarea
        className="w-full rounded-lg px-1 h-22 resize-none bg-[repeating-linear-gradient(white,white_23px,#6b7280_24px)]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        readOnly={!isEditing}
        onFocus={() => setIsEditing(true)}
        ></textarea>
        <div className="flex gap-2 mt-2">
          <CircleButton text="Save" color="bg-blue-600" onClick={handleSave} />
          <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}
