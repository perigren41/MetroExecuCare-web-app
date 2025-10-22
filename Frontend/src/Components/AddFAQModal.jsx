import React, { useState, useEffect } from "react";
import apiService from "@/services/api";

export default function AddFAQModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    displayOrder: 0
  });

  const [categories, setCategories] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get("/faqs/categories");
        if (response.success) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Remove field from missing fields when user starts typing
    if (missingFields.includes(name)) {
      setMissingFields(prev => prev.filter(field => field !== name));
    }
  };

  const validateForm = () => {
    const missing = [];

    if (!formData.question.trim()) missing.push("question");
    if (!formData.answer.trim()) missing.push("answer");
    if (!formData.category) missing.push("category");

    setMissingFields(missing);

    if (missing.length > 0) {
      setErrorMessage("Please fill in all required fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.post("/faqs", {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        displayOrder: parseInt(formData.displayOrder) || 0
      });

      if (response.success) {
        onSave(response.data.faq);
        onClose();
      } else {
        setErrorMessage(response.error || "Failed to create FAQ");
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      setErrorMessage(error.response?.data?.error || "Failed to create FAQ. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Utility to add red border for missing fields
  const borderClass = (fieldName) =>
    missingFields.includes(fieldName) ? "border-red-500" : "border-gray-500";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-sm sm:max-w-2xl h-auto relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="flex justify-between items-center
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
            text-white px-3 sm:px-4 py-2 sm:py-1 rounded-t-lg"
        >
          <h2 className="text-xs sm:text-sm font-bold">Add New FAQ</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-3 sm:mx-5 mt-3 p-3 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">{errorMessage}</h3>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5">
          <div className="space-y-4">
            {/* Category Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${borderClass("category")} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the FAQ question"
                className={`w-full px-3 py-2 border ${borderClass("question")} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            {/* Answer Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                placeholder="Enter the FAQ answer"
                rows={6}
                className={`w-full px-3 py-2 border ${borderClass("answer")} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-vertical`}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use line breaks to format your answer
              </p>
            </div>

            {/* Display Order Field (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Display Order (Optional)
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-500 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. Default is 0.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-semibold cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Adding FAQ..." : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}