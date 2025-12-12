import React, { useState, useRef, useEffect } from "react";

export default function CustomDropdown({ label, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((o) => o.code === value);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Box hiển thị */}
      <div
        className={`mt-1 border rounded-lg px-4 py-2.5 bg-white cursor-pointer flex justify-between items-center transition
          ${disabled ? "opacity-60 bg-gray-100 cursor-not-allowed" : "hover:border-green-500"}
        `}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>

        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Menu xổ xuống */}
      {open && !disabled && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 
                     max-h-56 overflow-y-auto animate-fadeIn"
        >
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">Không có dữ liệu</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.code}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-green-50 ${
                  value === opt.code ? "bg-green-100 font-medium" : ""
                }`}
                onClick={() => {
                  onChange(opt.code);
                  setOpen(false);
                }}
              >
                {opt.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
