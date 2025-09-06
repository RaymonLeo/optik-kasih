import React, { useEffect } from "react";

export default function Toast({ open, type = "success", message = "", onClose, duration = 2500 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const styles = {
    success: "bg-green-50 border-green-400 text-green-800",
    error:   "bg-red-50 border-red-400 text-red-800",
    info:    "bg-blue-50 border-blue-400 text-blue-800",
  }[type];

  return (
    <div className="fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow ${styles}`}>
        <span>{type === "success" ? "🎉" : type === "error" ? "⚠️" : "ℹ️"}</span>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-lg leading-none opacity-60 hover:opacity-100">×</button>
      </div>
    </div>
  );
}
