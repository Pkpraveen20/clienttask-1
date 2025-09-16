import { useState } from "react";
import {  FileSpreadsheet, FileText, LogOutIcon } from "lucide-react";

export default function ExportMenu({ exportToExcel, exportToPDF }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
          <button
        onClick={() => setOpen(!open)}
        className="flex items-center text-black px-4 py-2  border-gray-300  rounded-lg shadow"
        title="Export"
      >
        <LogOutIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white border z-50">
          <button
            onClick={() => {
              exportToExcel();
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => {
              exportToPDF();
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
