import React, { useState, useEffect } from "react";
import apiService from "@/services/api";

export default function DepartmentManagementModal({ onClose, onDepartmentChange }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDepartments();
  }, [filter]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filter !== "all") {
        params.is_active = filter === "active" ? "1" : "0";
      }

      const response = await apiService.get("/departments", { params });

      if (response.success) {
        setDepartments(response.data || []);
      } else {
        setError(response.message || "Failed to fetch departments");
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError(error.message || "Failed to load departments");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setEditDepartment(null);
    setShowFormModal(true);
  };

  const handleEditDepartment = (dept) => {
    setEditDepartment(dept);
    setShowFormModal(true);
  };

  const handleDeleteDepartment = async (id) => {
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await apiService.delete(`/departments/${id}`);

      if (response.success) {
        alert("Department deleted successfully");
        fetchDepartments();
        if (onDepartmentChange) onDepartmentChange();
      } else {
        alert(response.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert(error.message || "Failed to delete department");
    }
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      let response;

      if (editDepartment) {
        response = await apiService.put(`/departments/${editDepartment.id}`, departmentData);
      } else {
        response = await apiService.post("/departments", departmentData);
      }

      if (response.success) {
        alert(response.message || "Department saved successfully");
        setShowFormModal(false);
        fetchDepartments();
        if (onDepartmentChange) onDepartmentChange();
      } else {
        alert(response.error || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert(error.message || "Failed to save department");
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      {/* Main Modal Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Department Management</h2>
              <p className="text-blue-100 text-sm mt-1">Manage organization departments</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold transition cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />

              <button
                onClick={handleAddDepartment}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm shadow-sm hover:shadow-md cursor-pointer"
              >
                + Add Department
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading departments...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-lg font-medium">No departments found</p>
                            <p className="text-sm text-gray-400 mt-1">Create your first department to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{dept.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {dept.description || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                              {dept.user_count || 0} {dept.user_count === 1 ? 'user' : 'users'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditDepartment(dept)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
                              >
                                ✏️ Edit
                              </button>
                              {dept.user_count === 0 && (
                                <button
                                  onClick={() => handleDeleteDepartment(dept.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Department Form Modal */}
      {showFormModal && (
        <DepartmentFormModal
          department={editDepartment}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveDepartment}
        />
      )}
    </>
  );
}

// Department Form Modal Component
function DepartmentFormModal({ department, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: department?.name || "",
    description: department?.description || "",
    is_active: department?.is_active !== undefined ? department.is_active : true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {department ? "Edit Department" : "Add New Department"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {department ? "Update department information" : "Create a new department"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                required
                placeholder="e.g., Information Technology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                rows="3"
                placeholder="Brief description of the department"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
            >
              {department ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
