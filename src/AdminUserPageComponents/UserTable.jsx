import React from "react";
import ChevronRight from "@/assets/chevronright.svg";

export default function UserTable({ users, onView }) {
  return (
    <>
      {/* Desktop & Large Tablet View (768px and up) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto shadow-xl/30 shadow-blue-500/50 rounded-xl bg-white 
                        max-h-[300px] lg:max-h-[400px] text-xs lg:text-sm">
          <table className="min-w-full border-collapse border-white">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
                <th className="px-2 md:px-4 py-2 text-left">Name</th>
                <th className="px-2 md:px-4 py-2">Employee ID</th>
                <th className="px-2 md:px-4 py-2">Role</th>
                <th className="px-2 md:px-4 py-2 hidden lg:table-cell">Date Added</th>
                <th className="px-0 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50 transition text-center"
                  >
                    <td className="pl-3 md:pl-5 pr-2 py-2 border-t text-left border-gray-700">
                      <div className="flex items-center gap-1 md:gap-2">
                        <img
                          src={user.profileImage || "https://i.pravatar.cc/100?img=68"}
                          alt={user.name}
                          className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="truncate min-w-0">
                          {`${user.firstName} ${user.lastName}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border-t border-gray-700 truncate">
                      {user.employeeid}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-t border-gray-700 truncate">
                      {user.role}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-t border-gray-700 hidden lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-t border-gray-700 justify-center">
                      <button
                        onClick={() => onView(user)}
                        className="bg-blue-700 text-white w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 
                                 rounded-full hover:bg-blue-800 transition-colors duration-200
                                 flex items-center justify-center mx-auto touch-manipulation"
                      >
                        <img 
                          src={ChevronRight} 
                          alt="Chevron Right" 
                          className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5" 
                        />
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
      </div>

      {/* Mobile & Small Tablet View (below 768px) */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 
                         hover:shadow-lg transition-shadow duration-200"
              >
                {/* User Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={user.profileImage || "https://i.pravatar.cc/100?img=68"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {`${user.firstName} ${user.lastName}`}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {user.employeeid}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onView(user)}
                    className="bg-blue-700 text-white w-8 h-8 rounded-full 
                             hover:bg-blue-800 transition-colors duration-200
                             flex items-center justify-center touch-manipulation flex-shrink-0"
                  >
                    <img src={ChevronRight} alt="View Details" className="w-4 h-4" />
                  </button>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Role:</span>
                    <p className="text-gray-900 mt-0.5 truncate">{user.role}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date Added:</span>
                    <p className="text-gray-900 mt-0.5">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Department/Branch if available */}
                {(user.department || user.branch) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {user.department && (
                        <div>
                          <span className="font-medium text-gray-600">Department:</span>
                          <p className="text-gray-900 mt-0.5 truncate">{user.department}</p>
                        </div>
                      )}
                      {user.branch && (
                        <div>
                          <span className="font-medium text-gray-600">Branch:</span>
                          <p className="text-gray-900 mt-0.5 truncate">{user.branch}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}