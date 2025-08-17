import React from "react";

export default function SummaryCard() {
  const history = [
    { date: "2025-04-20", package: "Regular Package", location: "Makati Medical Center", status: "Approved" },
    { date: "2024-03-17", package: "Regular Package", location: "St. Lukes Medical Center", status: "Approved" },
    { date: "2023-07-30", package: "Special Request", location: "The Medical City Clinic", status: "Approved" },
    { date: "2022-04-15", package: "Regular Package", location: "Makati Medical Center", status: "Approved" },
  ];

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-blue-900 font-semibold mb-4">Summary</h2>
      <p className="text-sm mb-4">
        Your activity overview in MetroExecuCare
      </p>
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-purple-100 text-left">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Package</th>
              <th className="p-2">Location</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
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
    </div>
  );
}
