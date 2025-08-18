import React, { useState } from "react";
import SearchBar from "@/AdminUserPageComponents/SearchBar";
import UserTable from "@/AdminUserPageComponents/UserTable";
import UserDetailsModal from "@/AdminUserPageComponents/UserDetailsModal";
import NewUserFormModal from "@/AdminUserPageComponents/NewUserFormModal";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";

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
      <NavBarSide />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Add Button (left) + SearchBar (right) */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAddUser}
            className="bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition"
          >
            + Add User
          </button>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
  );
}
