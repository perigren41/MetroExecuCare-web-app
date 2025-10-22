import React, { useState, useEffect } from "react";
import apiService from "@/services/api";

export default function FAQManagementModal({ onClose, onFAQChange }) {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editFAQ, setEditFAQ] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiService.get("/faqs/categories");
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiService.get("/faqs");

      if (response.success) {
        // Flatten the grouped FAQs into a single array
        const allFAQs = [];
        Object.entries(response.data.categories).forEach(([categoryName, categoryFAQs]) => {
          categoryFAQs.forEach(faq => {
            allFAQs.push({
              ...faq,
              categoryDisplayName: categoryName
            });
          });
        });
        setFaqs(allFAQs);
      } else {
        setError(response.message || "Failed to fetch FAQs");
        setFaqs([]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setError(error.message || "Failed to load FAQs");
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = () => {
    setEditFAQ(null);
    setShowFormModal(true);
  };

  const handleEditFAQ = (faq) => {
    setEditFAQ(faq);
    setShowFormModal(true);
  };

  const handleDeleteFAQ = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await apiService.delete(`/faqs/${id}`);

      if (response.success) {
        alert("FAQ deleted successfully");
        fetchFAQs();
        if (onFAQChange) onFAQChange();
      } else {
        alert(response.error || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert(error.message || "Failed to delete FAQ");
    }
  };

  const handleSaveFAQ = async (faqData) => {
    try {
      let response;

      if (editFAQ) {
        response = await apiService.put(`/faqs/${editFAQ.id}`, faqData);
      } else {
        response = await apiService.post("/faqs", faqData);
      }

      if (response.success) {
        alert(response.message || "FAQ saved successfully");
        setShowFormModal(false);
        fetchFAQs();
        if (onFAQChange) onFAQChange();
      } else {
        alert(response.error || "Failed to save FAQ");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert(error.message || "Failed to save FAQ");
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Main Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">FAQ Management</h2>
              <p className="text-blue-100 text-sm mt-1">Manage frequently asked questions</p>
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
              <div className="relative flex-1 min-w-[200px] h-[38px]">
                <div
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                  }}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.displayName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddFAQ}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm shadow-sm hover:shadow-md cursor-pointer"
              >
                + Add FAQ
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Content Area - Table with horizontal scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading FAQs...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-x-auto border border-gray-200 shadow-sm">
                <table className="w-full min-w-max">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                        Question
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[250px]">
                        Answer
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                        Order
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFAQs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">No FAQs found</p>
                            <p className="text-sm text-gray-400 mt-1">Create your first FAQ to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredFAQs.map((faq) => (
                        <tr key={faq.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {faq.categoryDisplayName}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold text-gray-900 max-w-[300px] break-words">
                              {faq.question}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-600 max-w-[350px] line-clamp-2">
                              {faq.answer}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-700">
                              {faq.displayOrder || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditFAQ(faq)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFAQ(faq.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md cursor-pointer font-medium"
                              >
                                Delete
                              </button>
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
        </div>
      </div>

      {/* FAQ Form Modal */}
      {showFormModal && (
        <FAQFormModal
          faq={editFAQ}
          categories={categories}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveFAQ}
        />
      )}
    </>
  );
}

// FAQ Form Modal Component
function FAQFormModal({ faq, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "",
    displayOrder: faq?.displayOrder || 0,
    isActive: faq?.isActive !== undefined ? faq.isActive : true
  });
  const [missingFields, setMissingFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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
      await onSave({
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to save FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  const borderClass = (fieldName) =>
    missingFields.includes(fieldName) ? "border-red-500" : "border-gray-300";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">{faq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${borderClass("category")} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the FAQ question"
                className={`w-full px-3 py-2 border ${borderClass("question")} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Answer Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                placeholder="Enter the FAQ answer"
                rows={6}
                className={`w-full px-3 py-2 border ${borderClass("answer")} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical`}
              />
            </div>

            {/* Display Order Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. Default is 0.
              </p>
            </div>

            {/* Active Status */}
            {faq && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-semibold text-gray-700">
                  Active (Visible to users)
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer font-semibold"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : faq ? "Update FAQ" : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
