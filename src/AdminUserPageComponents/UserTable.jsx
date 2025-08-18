// src/components/UserTable.jsx
import React from "react";

export default function UserTable({ users, onView }) {
  return (
    <div className="overflow-x-auto shadow-md rounded-xl bg-white max-h-[500px] text-xs">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
            <th className="px-4 py-2 border">Employee ID</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Position</th>
            <th className="px-4 py-2 border">Date Added</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-blue-50 transition text-center"
              >
                <td className="px-4 py-2 border">{user.id}</td>
                <td className="px-4 py-2 border flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  {user.name}
                </td>
                <td className="px-4 py-2 border">{user.position}</td>
                <td className="px-4 py-2 border">{user.dateAdded}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => onView(user)}
                    className="bg-blue-700 text-white px-3 py-1 rounded-full hover:bg-blue-800 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="text-center text-gray-500 py-4 border"
              >
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
