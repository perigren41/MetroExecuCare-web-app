import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "@/AdminUserPageComponents/SearchBar";
import UserTable from "@/AdminUserPageComponents/UserTable";
import UserDetailsModal from "@/AdminUserPageComponents/UserDetailsModal";
import NewUserFormModal from "@/AdminUserPageComponents/NewUserFormModal";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { USERS_DATABASE } from "@/webpages/MockUsers.jsx";

export default function AdminUsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user data from location state or localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    if (location.state?.userData) {
      return location.state.userData;
    }
    const storedUserData = localStorage.getItem('userData');
    return storedUserData ? JSON.parse(storedUserData) : null;
  });

  // Initialize users state with mock data or from location state
  const [users, setUsers] = useState(() => {
    return location.state?.usersDatabase || USERS_DATABASE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentBranch, setCurrentBranch] = useState("");

  // Authentication check and branch setup
  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!currentUser) {
      navigate("/");
      return;
    }

    if (currentUser.role !== "Admin" && currentUser.position !== "Admin") {
      navigate("/executive-employee-dashboard");
      return;
    }

    // Set the current branch from the logged-in user
    setCurrentBranch(currentUser.branch || "Metrobank Fort - Ecoprime Tower");
  }, [currentUser, navigate]);

  // Add New User
  const handleAddUser = () => {
    setEditUser(null);
    setShowFormModal(true);
  };

  // Save New or Edited User from NewUserFormModal
  const handleSaveUser = (userData) => {
    if (editUser) {
      const updatedUsers = users.map((u) => (u.id === editUser.id ? userData : u));
      setUsers(updatedUsers);
      
      // Update USERS_DATABASE if needed (for persistence across sessions)
      const userIndex = USERS_DATABASE.findIndex(u => u.id === editUser.id);
      if (userIndex !== -1) {
        USERS_DATABASE[userIndex] = userData;
      }
    } else {
      // Generate new ID for new user
      const newId = Math.max(...users.map(u => parseInt(u.id) || 0), 0) + 1;
      const newUserData = { ...userData, id: newId.toString() };
      
      const updatedUsers = [...users, newUserData];
      setUsers(updatedUsers);
      
      // Add to USERS_DATABASE for persistence
      USERS_DATABASE.push(newUserData);
    }
  };

  // Delete User (no more browser confirm)
  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    
    // Remove from USERS_DATABASE for persistence
    const userIndex = USERS_DATABASE.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      USERS_DATABASE.splice(userIndex, 1);
    }
    
    setSelectedUser(null); // close modal after delete
  };

  // Update User from UserDetailsModal
  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    
    // Update USERS_DATABASE for persistence
    const userIndex = USERS_DATABASE.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      USERS_DATABASE[userIndex] = updatedUser;
    }
    
    setSelectedUser(updatedUser); // optional: keep modal open and updated
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const userName = u.name || `${u.firstName} ${u.lastName}` || "";
    const userId = u.id || "";
    
    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ? true : u.role.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Show loading or redirect if no current user
  if (!currentUser) {
    return <div>Redirecting to login...</div>;
  }

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