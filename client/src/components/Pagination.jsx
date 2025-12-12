// components/Pagination.jsx
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4 gap-2 flex-wrap">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded border ${
            currentPage === i + 1
              ? "bg-green-700 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export default Pagination;
