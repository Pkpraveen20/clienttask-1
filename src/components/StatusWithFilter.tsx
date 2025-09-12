import { useState, useRef, useEffect } from "react";

export default function StatusFilterDropdown({
  statusFilter,
  setStatusFilter,
}: {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>(
    statusFilter === "All" ? "" : statusFilter
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    setStatusFilter(tempStatus || "All");
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStatus("");
    setStatusFilter("All");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border rounded px-4 py-1 hover:bg-gray-50 text-gray-700 text-opacity-70"
      >
        ⚙️ {statusFilter === "All" ? "Filter" : `Status: ${statusFilter}`}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
