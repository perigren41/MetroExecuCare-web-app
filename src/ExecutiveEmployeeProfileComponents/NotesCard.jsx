import React from "react";
import CircleButton from "./CircleButton";

export default function NotesCard() {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-blue-900 font-semibold mb-4">Notes</h2>
      <textarea
        placeholder="Write down notes or reminders..."
        className="w-full border rounded-lg p-2 h-32 resize-none"
      ></textarea>
      <div className="flex gap-2 mt-3">
        <CircleButton text="Save" color="bg-blue-600" />
        <CircleButton text="Cancel" color="bg-gray-400" />
      </div>
    </div>
  );
}
