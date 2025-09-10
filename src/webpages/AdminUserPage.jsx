import React, { useState } from "react";
import SearchBar from "@/AdminUserPageComponents/SearchBar";
import UserTable from "@/AdminUserPageComponents/UserTable";
import UserDetailsModal from "@/AdminUserPageComponents/UserDetailsModal";
import NewUserFormModal from "@/AdminUserPageComponents/NewUserFormModal";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { USERS_DATABASE } from "@/webpages/MockUsers.jsx";

export default function AdminUsersPage() {
  // Initialize users state with mock data
  const [users, setUsers] = useState(USERS_DATABASE);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentBranch, setCurrentBranch] = useState(
    "Metrobank Fort - Ecoprime Tower" // replace with real logged-in user's branch
  );

  // Add New User
  const handleAddUser = () => {
    setEditUser(null);
    setShowFormModal(true);
  };

  // Save New or Edited User from NewUserFormModal
  const handleSaveUser = (userData) => {
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? userData : u))
      );
    } else {
      setUsers((prev) => [...prev, userData]);
    }
  };

  // Delete User (no more browser confirm)
  const handleDeleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setSelectedUser(null); // close modal after delete
  };

  // Update User from UserDetailsModal
  const handleUpdateUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSelectedUser(updatedUser); // optional: keep modal open and updated
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ? true : u.role.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBarSide />

      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        MetroExecuCare Users
      </h1>

      <div className="flex-1 py-0 px-4 md:px-8 lg:px-8 xl:px-16">
        {/* SearchBar + Add Button */}
      
        <div className="flex flex-col mb-1">
          <h1 className="text-left text-xs mb-2 pt-2">
            <span className="font-bold">Branch:</span> {currentBranch}
          </h1>

          <div className="flex items-center justify-between gap-2 mb-1">
            <SearchBar
              search={searchQuery}
              setSearch={setSearchQuery}
              filter={filter}
              setFilter={setFilter}
            />

            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">Add</span>
              <button
                onClick={handleAddUser}
                className="w-8 h-8 bg-blue-700 text-white 
                  rounded-full hover:bg-blue-800 transition 
                  flex items-center justify-center"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UserTable users={filteredUsers} onView={setSelectedUser} />

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser} // ✅ update table after save
          />
        )}

        {/* New User Modal */}
        {showFormModal && (
          <NewUserFormModal
            user={editUser}
            onClose={() => setShowFormModal(false)}
            onSave={handleSaveUser}
          />
        )}
      </div>
    </div>
  );
}