import React from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * Reusable Confirmation Modal Component
 * Used for confirming actions before proceeding (replaces window.confirm())
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when modal is closed/cancelled
 * @param {function} onConfirm - Function to call when action is confirmed
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message content
 * @param {string} confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 * @param {string} type - 'danger' | 'warning' | 'info' (default: 'warning')
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Type-specific styling
  const typeConfig = {
    danger: {
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      confirmButtonColor: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      confirmButtonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`${config.bgColor} p-2 rounded-full`}>
              <AlertCircle className={`${config.iconColor} w-6 h-6`} />
            </div>
            <h3 className={`text-lg font-semibold ${config.titleColor}`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`${config.confirmButtonColor} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
