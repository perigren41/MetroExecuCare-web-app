import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

/**
 * Reusable Alert Modal Component
 * Used for displaying success/error messages instead of alert()
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} title - Modal title
 * @param {string} message - Modal message content
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {function} onConfirm - Optional callback for action button
 * @param {string} confirmText - Text for confirm button (default: 'OK')
 */
export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'OK'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Type-specific styling
  const typeConfig = {
    success: {
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      Icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      Icon: XCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      Icon: XCircle
    },
    info: {
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      Icon: CheckCircle
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.Icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`${config.bgColor} p-2 rounded-full`}>
              <IconComponent className={`${config.iconColor} w-6 h-6`} />
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
            onClick={handleConfirm}
            className={`${config.buttonColor} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
