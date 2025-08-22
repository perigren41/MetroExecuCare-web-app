// src/components/UserTable.jsx
import React from "react";

export default function UserTable({ users, onView }) {
  return (
    <div className="overflow-x-auto shadow-xl/30 shadow-blue-500/50 rounded-xl bg-white max-h-[300px] text-xs">
      <table className="min-w-full border-collapse border-white">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
            
            <th className="px-4 py-2 ">Name</th>
            <th className="px-4 py-2 ">Employee ID</th>
            <th className="px-4 py-2 ">Position</th>
            <th className="px-4 py-2 ">Date Added</th>
            <th className="px-0 py-2 ">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-blue-0 transition text-center"
              >
              <td className="pl-5 pr-2 py-2 border-b text-left">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-4 h-4 rounded-full"
                />
                <span>{user.name}</span>
              </div>
            </td>

                <td className="px-4 py-2 border-b">{user.id}</td>
                <td className="px-4 py-2 border-b">{user.position}</td>
                <td className="px-4 py-2 border-b">{user.dateAdded}</td>
                <td className="px-4 py-2 border-b justify-center">
                  <button
                  onClick={() => onView(user)}
                  className="bg-blue-700 text-white w-5 h-5 rounded-full hover:bg-blue-800 transition 
                  flex items-center justify-center mx-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3 h-3 justify-center mx-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
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
