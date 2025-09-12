import { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function FilterDate({
  onApply,
}: {
  onApply: (range: [Date | null, Date | null]) => void;
}) {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDateFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    setShowDateFilter(false);
    onApply(dateRange);
  };

  const handleClear = () => {
    const cleared: [Date | null, Date | null] = [null, null];
    setDateRange(cleared);
    onApply(cleared);
    setShowDateFilter(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowDateFilter(!showDateFilter)}
        className="flex items-center gap-2 border rounded px-4 py-1 hover:bg-gray-50 text-gray-700 text-opacity-60"
      >
        📅{" "}
        {startDate && endDate
          ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          : "Select Date Range"}
      </button>

      {showDateFilter && (
        <div className="absolute mt-2 bg-white border rounded-lg shadow-lg z-50 p-4 w-[650px]">
          <div className="flex justify-between gap-6 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={startDate ? startDate.toLocaleDateString() : ""}
                className="border px-2 py-1 rounded w-60"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={endDate ? endDate.toLocaleDateString() : ""}
                className="border px-2 py-1 rounded w-60"
              />
            </div>
          </div>

          <div className="flex justify-between gap-6">
            <DatePicker
              selected={startDate}
              onChange={(date) => setDateRange([date, endDate])}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              inline
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setDateRange([startDate, date])}
              selectsEnd
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              minDate={startDate ?? undefined}
              inline
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
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
