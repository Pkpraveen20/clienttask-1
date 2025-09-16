import { ListFilterIcon } from "lucide-react";
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-30 py-2 px-2 
             bg-white border border-gray-300 rounded-xl shadow-sm
             text-sm font-medium text-gray-700
             hover:bg-gray-50 hover:border-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        <ListFilterIcon className="w-4 h-4 " />
        <span>
          {statusFilter === "All" ? "Filter " : `Status: ${statusFilter}`}
        </span>
      </button>

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
