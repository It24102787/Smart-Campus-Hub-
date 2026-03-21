import React from 'react';
import { X } from 'lucide-react';

/**
 * QR Code Modal Component
 * Displays a full-screen modal with the campus map QR code
 *
 * Props:
 * - isOpen: boolean - Whether the modal should be displayed
 * - onClose: function - Callback when the modal is closed
 * - qrImage: string - Image source/path for the QR code
 * - onDomEvent: function - Optional handler for additional DOM events (default: empty)
 */
const QRCodeModal = ({ isOpen, onClose, qrImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Map QR Code</h2>
            <p className="text-sm text-slate-500">Scan with your phone camera</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-xl bg-white p-4 border border-slate-200">
            <img
              src={qrImage}
              alt="Campus map QR code"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mb-4">
          Use your phone camera to scan this QR code and access the campus map
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
