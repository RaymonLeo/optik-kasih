import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open, onCancel, onConfirm,
  title = "Konfirmasi", description = "Lanjutkan aksi ini?",
  cancelText = "Batal", confirmText = "Ya, Lanjut", danger = false,
}) {
  return (
    <Modal open={open} onClose={onCancel} width="max-w-lg">
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🫡</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            {cancelText}
          </button>
          <button onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
