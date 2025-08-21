import React, { useState } from "react";
import SearchBar from "@/AdminUserPageComponents/SearchBar";
import UserTable from "@/AdminUserPageComponents/UserTable";
import UserDetailsModal from "@/AdminUserPageComponents/UserDetailsModal";
import NewUserFormModal from "@/AdminUserPageComponents/NewUserFormModal";
import NavBarAdmin from "@/AdminUserPageComponents/NavBarAdmin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: "EMP001",
      name: "John Doe",
      position: "Software Engineer",
      email: "john.doe@example.com",
      contact: "09171234567",
      department: "IT",
      birthDate: "1995-04-15",
      dateAdded: "2023-08-15",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      position: "HR Manager",
      email: "jane.smith@example.com",
      contact: "09181234567",
      department: "HR",
      birthDate: "1990-08-20",
      dateAdded: "2023-09-01",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleAddUser = () => {
    setEditUser(null);
    setShowFormModal(true);
  };

  const handleSaveUser = (userData) => {
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? userData : u))
      );
    } else {
      setUsers((prev) => [...prev, userData]);
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Nav */}
      <NavBarAdmin />

      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">MetroExecuCare Users</h1>
      {/* Main Content */}
      <div className="flex-1 py-0 px-4 md:px-8 lg:px-8 xl:px-16">
        {/* SearchBar (left) + Add Button (right) */}
        <div className="flex flex-col mb-1">
        {/* Title */}
        <h1 className="text-left text-xs mb-2 pt-2">
        <span className="font-bold">Branch:</span> Metrobank Fort - Ecoprime Tower
      </h1>
        {/* SearchBar (left) + Button (right) */}
      <div className="flex items-center justify-between gap-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />

      <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-700">Add</span>
      <button
        onClick={handleAddUser}
        className="w-8 h-8 bg-blue-700 text-white
                  rounded-full hover:bg-blue-800 transition text-xs sm:text-base"
      >
        +
  </button>
      </div>
    </div>

        {/* Users Table */}
        <UserTable users={filteredUsers} onView={setSelectedUser} />

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onEdit={(user) => {
              setEditUser(user);
              setShowFormModal(true);
              setSelectedUser(null);
            }}
            onDelete={handleDeleteUser}
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
    </div>
  );
  }