import React from "react";

export default function Modal({ open, onClose, children, width = "max-w-2xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${width} rounded-2xl bg-white shadow-xl`}>{children}</div>
      </div>
    </div>
  );
}
