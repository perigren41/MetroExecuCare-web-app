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
  const [showPassword, setShowPassword] = useState(false);

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
  <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl h-auto relative overflow-hidden mx-4 my-8 sm:mx-6 sm:my-10 md:mx-0 md:my-0">
            {/* Header */}
        <div className="flex justify-between items-center 
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            text-white px-4 py-1 rounded-t-lg">
          <h2 className="text-sm font-bold">New User</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[7fr_14fr_auto] gap-1 p-5 text-xs items-start text-left"
        >
          {/* Full Name */}
          <label className="font-medium text-blue-900">First Name</label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            required
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"

            
          />

          
      {/* Profile upload section */}
      <div className="row-span-10 flex flex-col items-center gap-2 mt-6 ml-4">
        {/* Circle that only shows the image */}
        <div className="w-40 h-40 rounded-full border flex items-center justify-center bg-white overflow-hidden">
          {formData.profileImage ? (
            <img
              src={formData.profileImage}
              alt="Profile"
              className="w-40 h-40 object-cover"
            />
          ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10 text-gray-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 
          2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 
          21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 
          0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 
          2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 
          0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 
          10.5h.008v.008h-.008V10.5Z"
        />
      </svg>
    )}
  </div>

  {/* Upload button as text under the circle */}
        <label
          htmlFor="profileImage"
          className="text-xs text-blue-600 cursor-pointer hover:underline"
        >
          {formData.profileImage ? "Change Image" : "Add Image"}
        </label>

        {/* Hidden file input */}
        <input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
              };
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
        />
      </div>



          <label className="font-medium text-blue-900">Middle Name</label>
          <input
            type="text"
            name="MiddleName"
            value={formData.MiddleName}
            onChange={handleChange}
            required
            className="border rounded-sm gap-1 py-0  text-xs w-full border-gray-500 px-1"
          />
          <label className="font-medium text-blue-900">Last Name</label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            required
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

            {/* Employee Number */}
          <label className="font-medium text-blue-900">Employee ID</label>
          <input
            type="text"
            name="employeeNumber"
            value={formData.employeeNumber}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

          {/* Password */}
          {/* Password */}
<label className="font-medium text-blue-900">Password</label>
<div className="relative w-full">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    onChange={handleChange}
    className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 pr-8 px-1"
  />

  {/* Toggle Eye Icon */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
  >
    {showPassword ? (
      // Eye Slash (hidden)
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
        viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
        className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 
        0 1 0-.639C3.423 7.51 7.36 
        4.5 12 4.5c4.638 0 8.573 
        3.007 9.963 7.178.07.207.07.431 
        0 .639C20.577 16.49 16.64 
        19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 
        1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ) : (
      // Eye (visible)
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
        viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
        className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 
        19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 
        4.5c4.756 0 8.773 3.162 10.065 
        7.498a10.522 10.522 0 0 1-4.293 
        5.774M6.228 6.228 3 3m3.228 3.228 
        3.65 3.65m7.894 7.894L21 
        21m-3.228-3.228-3.65-3.65m0 
        0a3 3 0 1 0-4.243-4.243m4.242 
        4.242L9.88 9.88" />
      </svg>
    )}
  </button>
</div>


          {/* Role */}
          <label className="font-medium text-blue-900">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full shadow-lg border-gray-500 px-1"
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="admin">Admin</option>
            <option value="Senior Executive Officer">Senior Executive Officer</option>
            <option value="Benefits Assistant">Benefits Assistant</option>
            <option value="Benefits Services Officer">Benefits Services Officer</option>
            <option value="Division Head">Division Head</option>
          </select> 

          {/* Position */}
          <label className="font-medium text-blue-900">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

          {/* Email */}
          <label className="font-medium text-blue-900">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

          {/* Contact */}
          <label className="font-medium text-blue-900">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

          {/* Department */}
          <label className="font-medium text-blue-900">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500  px-1"
          />

          {/* Birth Date */}
          <label className="font-medium text-blue-900">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="border rounded-sm gap-1 py-0 text-xs w-full border-gray-500 px-1"
          />

          {/* Actions */}
          <div className="col-span-3 flex justify-end gap-2 mt-0">
            <button
              type="submit"
              className="px-4 py-1 w-15 h-6 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
            >
              {user ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 w-15 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
        </div>
  );
}