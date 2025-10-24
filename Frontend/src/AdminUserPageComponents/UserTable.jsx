import React, { useState, useEffect, useRef } from "react";
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showMobileScrollIndicator, setShowMobileScrollIndicator] = useState(false);
  const tableContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowScrollIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkScroll();
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [users]);

  useEffect(() => {
    const checkMobileScroll = () => {
      if (mobileContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mobileContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowMobileScrollIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkMobileScroll();
    const container = mobileContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkMobileScroll);
      window.addEventListener('resize', checkMobileScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkMobileScroll);
      }
      window.removeEventListener('resize', checkMobileScroll);
    };
  }, [users]);
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block relative h-full">
        <div ref={tableContainerRef} className="overflow-auto rounded-lg bg-white h-full shadow-sm border border-gray-200">
          <table className="min-w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
              <th className="px-6 py-3.5 text-left font-semibold">Name</th>
              <th className="px-6 py-3.5 text-center font-semibold">Employee ID</th>
              <th className="px-6 py-3.5 text-center font-semibold">Role</th>
              <th className="px-6 py-3.5 text-center font-semibold">Date Added</th>
              <th className="px-6 py-3.5 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  onClick={() => onView(user)}
                  className={`
                    hover:bg-blue-50 transition-colors cursor-pointer
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profile_picture_url || NoProfilePicture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span className="font-medium text-gray-900">
                        {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-gray-800 text-sm">{user.employee_id}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-700 text-base">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 text-base">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(user);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <img src={ChevronRight} alt="View" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Scroll Indicator - Desktop */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-sm font-medium text-blue-600 mb-1">Scroll</span>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden relative h-full">
        <div ref={mobileContainerRef} className="space-y-3 h-full overflow-y-auto pb-16">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => onView(user)}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking button
                      onView(user);
                    }}
                    className="bg-blue-700 text-white w-8 h-8 rounded-full hover:bg-blue-800 transition flex items-center justify-center cursor-pointer"
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

        {/* Swipe Indicator - Mobile */}
        {showMobileScrollIndicator && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-sm font-medium text-blue-600 mb-1">Swipe</span>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
