// components/SearchBar.jsx
import { Search } from "lucide-react";

function SearchBar({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white shadow-sm">
      <Search size={18} className="text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none w-60"
      />
    </div>
  );
}

export default SearchBar;
