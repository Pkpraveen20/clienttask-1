import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CarFrontIcon } from "lucide-react";
import StatusFilterDropdown from "../../../components/StatusWithFilter";
import FilterDate from "../../../components/filterDate";
import { useNavigate } from "@tanstack/react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExportMenu from "../../../components/export";
import VendorForm from "./vendorForm";

export default function VendorTable() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [statusFilterGroup, setStatusFilter] = useState<string>("All");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor"],
    queryFn: () =>
      axios.get("http://localhost:3000/vendor").then((res) => res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) =>
      axios.delete(`http://localhost:3000/vendor/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, vendorStatus }: { id: number; vendorStatus: string }) =>
      axios.patch(`http://localhost:3000/vendor/${id}`, {
        vendorStatus,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });

  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this vendor Group?")) {
      deleteMutation.mutate(id);
    }
  }
  function handleViewDetails(id: number) {
    navigate({ to: `/vendor/${id}` });
  }
  function handleEdit(id: number) {
    setEditId(id);
  }

  function getStatus(vendor: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vendorEndDate = parseDate(vendor.vendorEndDate);
    vendorEndDate.setHours(0, 0, 0, 0);

    return vendorEndDate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedpermission(vendor: any[]) {
    let filteredvendor = vendor.filter((vendor) =>
      vendor.vendorName.toLowerCase().includes(search.toLowerCase())
    );
    if (startDate || endDate) {
      filteredvendor = filteredvendor.filter((vendor) => {
        const prodStart = parseDate(vendor.vendorStartDate);
        const prodEnd = parseDate(vendor.vendorEndDate);

        if (startDate && prodStart < startDate) return false;
        if (endDate && prodEnd > endDate) return false;

        return true;
      });
    }
    if (statusFilterGroup !== "All") {
      filteredvendor = filteredvendor.filter(
        (vendor) => vendor.vendorStatus === statusFilterGroup
      );
    }

    filteredvendor.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === "vendorStartDate" || sortKey === "vendorEndDate") {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredvendor;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((vendor: any) => {
        const shouldBeActive = getStatus(vendor) === "Active";
        if (
          (shouldBeActive && vendor.vendorStatus !== "Active") ||
          (!shouldBeActive && vendor.vendorStatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: vendor.id,
            vendorStatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredvendor = getFilteredSortedpermission(data || []);
  const vendorCount = filteredvendor.length;

  const exportToExcel = () => {
    const exportData = filteredvendor.map((c: any) => ({
      ID: c.id,
      Name: c.vendorName,
      Status: getStatus(c),

      "Start Date": c.vendorStartDate,
      "End Date": c.vendorEndDate,
      " vendor type": Array.isArray(c.vendorType)
        ? c.vendorType
            .map((p: any) =>
              typeof p === "object" ? p.label || p.value : String(p)
            )
            .join(", ")
        : String(c.vendorType || ""),
      Address: c.address1.address1,
      City: c.address1.city,
      State: c.address1.state,
      zipcode: c.address1.zipcode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "vendor");
    XLSX.writeFile(workbook, "vendor.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("vendor List", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "ID",
          "Name",
          "Status",
          "Start Date",
          "End Date",
          " vendor type",
          "Address",
          "City",
          "State",
          "zipcode",
        ],
      ],
      body: filteredvendor.map((c: any) => [
        c.id,
        c.vendorName,
        getStatus(c),
        c.vendorStartDate,
        c.vendorEndDate,
        c.vendorType,
        c.address1.address1,
        c.address1.city,
        c.address1.state,
        c.address1.zipcode,
      ]),
      styles: { fontSize: 10, cellPadding: 2 },
    });

    doc.save("vendor.pdf");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <CarFrontIcon className="w-6 h-6" />
          Vendor - {vendorCount} {vendorCount !== 1 ? "" : ""}
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <CarFrontIcon className="w-6 h-6" />
              Create New Vendor
            </h2>

            <VendorForm onClose={() => setShowForm(false)} />
          </div>
          <style>
            {`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97);}
          to { opacity: 1; transform: scale(1);}
        }
      `}
          </style>
        </div>
      )}

      {/* {editId !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setEditId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <FileLineChartIcon className="w-6 h-6" />
              Edit Permission Group
            </h2>
            <PermissionGroupEditModal
              id={editId}
              onClose={() => setEditId(null)}
            />
          </div>
          <style>
            {`
              .animate-fadeIn {
                animation: fadeIn 0.25s ease;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.97);}
                to { opacity: 1; transform: scale(1);}
              }
            `}
          </style>
        </div>
      )} */}
      <div className="flex items-center gap-4 mb-2">
        <div>
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 pl-8 pr-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <StatusFilterDropdown
          statusFilter={statusFilterGroup}
          setStatusFilter={setStatusFilter}
        />

        <FilterDate onApply={setDateRange} />

        <ExportMenu exportToExcel={exportToExcel} exportToPDF={exportToPDF} />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="bg-gray-100">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("id");
                    setSortOrder(
                      sortKey === "id" && sortOrder === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  <div className="flex items-center gap-1">
                    ID
                    {sortKey === "id" && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("vendorName");
                    setSortOrder(
                      sortKey === "vendorName" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Vendor Name{" "}
                  {sortKey === "vendorName"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("vendorStatus");
                    setSortOrder(
                      sortKey === "vendorStatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "vendorStatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("vendorStartDate");
                    setSortOrder(
                      sortKey === "vendorStartDate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Start Date{" "}
                  {sortKey === "vendorStartDate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("vendorEndDate");
                    setSortOrder(
                      sortKey === "vendorEndDate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  End Date{" "}
                  {sortKey === "vendorEndDate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Vendor Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Zipcode
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredvendor.map((vendor: any) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.id}</td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(vendor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendorStartDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendorEndDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendorType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.address1.address1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.address1.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.address1.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.address1.zipcode}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(vendor.permissionGroupPname)
                      ? vendor.permissionGroupPname
                          .map((c: any) => {
                            if (typeof c === "object" && c !== null) {
                              return c.label || c.value || String(c);
                            }
                            return String(c);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(vendor.permissionGroupPname || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(vendor.permissiongrouprole)
                      ? vendor.permissiongrouprole
                          .map((r: any) => {
                            if (typeof r === "object" && r !== null) {
                              return r.label || r.value || String(r);
                            }
                            return String(r);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(vendor.permissiongrouprole || "")}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === vendor.id ? null : vendor.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === vendor.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleViewDetails(vendor.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(vendor.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredvendor.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search
                ? "No vendor found matching your search."
                : "No vendor found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
