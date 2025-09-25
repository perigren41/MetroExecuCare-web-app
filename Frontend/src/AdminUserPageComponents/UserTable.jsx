import React from "react";
import ChevronRight from "@/assets/chevronright.svg";
import NoProfilePicture from "@/assets/profilegray.svg";

// Function to convert role variable names to user-friendly names
const getRoleDisplayName = (role) => {
  const roleMap = {
    'admin': 'Admin',
    'hr_personnel': 'Human Resource Personnel',
    'benefits_officer': 'Benefits Officer',
    'welfare_head': 'Division Head',
    'executive': 'Executive'
  };

  return roleMap[role] || role; // Return original if not found in map
};

export default function UserTable({ users, onView }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto shadow-xl/30 shadow-blue-500/50 rounded-xl bg-white max-h-[calc(100vh-200px)] text-xs">
        <table className="min-w-full border-collapse border-white">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Date Added</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50 transition text-center"
                >
                  <td className="pl-5 pr-2 py-2 border-t text-left border-gray-700">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.profile_picture_url || NoProfilePicture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{`${user.first_name || ""} ${user.last_name || ""}`.trim()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-t border-gray-700">{user.employee_id}</td>
                  <td className="px-4 py-2 border-t border-gray-700">{getRoleDisplayName(user.role)}</td>
                  <td className="px-4 py-2 border-t border-gray-700">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border-t border-gray-700 justify-center">
                    <button
                      onClick={() => onView(user)}
                      className="bg-blue-700 text-white w-5 h-5 rounded-full hover:bg-blue-800 transition flex items-center justify-center mx-auto"
                    >
                      <img src={ChevronRight} alt="Chevron Right" className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="1000"
                  className="text-center text-gray-500 py-4 border"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={user.profile_picture_url || NoProfilePicture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                    </h3>
                    <p className="text-xs text-gray-600">ID: {user.employee_id}</p>
                    <p className="text-xs text-blue-600 font-medium">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onView(user)}
                    className="bg-blue-700 text-white w-8 h-8 rounded-full hover:bg-blue-800 transition flex items-center justify-center"
                  >
                    <img src={ChevronRight} alt="View" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-200">
            No users found
          </div>
        )}
      </div>
    </>
  );
}
