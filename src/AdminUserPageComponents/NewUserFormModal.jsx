import React, { useState, useEffect } from "react";

export default function NewUserFormModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    position: "",
    email: "",
    contact: "",
    department: "",
    birthDate: "",
    avatar: "",
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        id: "EMP" + String(Date.now()).slice(-4), // auto-generate ID
        name: "",
        position: "",
        email: "",
        contact: "",
        department: "",
        birthDate: "",
        avatar: "https://i.pravatar.cc/100", // default avatar
      });
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {"Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
<form onSubmit={handleSubmit} className="space-y-4 text-xs">
  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Full Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Position</label>
    <input
      type="text"
      name="position"
      value={formData.position}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Contact</label>
    <input
      type="text"
      name="contact"
      value={formData.contact}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Department</label>
    <input
      type="text"
      name="department"
      value={formData.department}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Birth Date</label>
    <input
      type="date"
      name="birthDate"
      value={formData.birthDate}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  <div className="flex items-center gap-4">
    <label className="w-1/3 font-medium">Avatar URL</label>
    <input
      type="text"
      name="avatar"
      value={formData.avatar}
      onChange={handleChange}
      className="flex-1 border rounded-lg px-3 py-2 text-xs"
    />
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-3 mt-4">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 rounded-lg border hover:bg-gray-100 text-xs"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-xs"
    >
      {user ? "Update" : "Save"}
    </button>
  </div>
</form>
</div>

</div>
  );
}