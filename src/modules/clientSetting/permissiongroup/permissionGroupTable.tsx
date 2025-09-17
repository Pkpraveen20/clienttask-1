import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FileLineChartIcon } from "lucide-react";
import PermissionGroupForm from "./permissionGroupForm";
import StatusFilterDropdown from "../../../components/StatusWithFilter";
import FilterDate from "../../../components/filterDate";
import { useNavigate } from "@tanstack/react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PermissionGroupEditModal from "./permissionGroupEditModule";
import ExportMenu from "../../../components/export";

export default function PermissionGroupTable() {
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
    queryKey: ["permissiongroup"],
    queryFn: () =>
      axios
        .get("http://localhost:3000/permissiongroup")
        .then((res) => res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) =>
      axios.delete(`http://localhost:3000/permissiongroup/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissiongroup"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      permissiongroupstatus,
    }: {
      id: number;
      permissiongroupstatus: string;
    }) =>
      axios.patch(`http://localhost:3000/permissiongroup/${id}`, {
        permissiongroupstatus,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissiongroup"] }),
  });

  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this Permission Group?")) {
      deleteMutation.mutate(id);
    }
  }
  function handleViewDetails(id: number) {
    navigate({ to: `/permissiongroup/${id}` });
  }
  function handleEdit(id: number) {
    setEditId(id);
  }

  function getStatus(permissiongroup: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const permissiongroupenddate = parseDate(
      permissiongroup.permissiongroupenddate
    );
    permissiongroupenddate.setHours(0, 0, 0, 0);

    return permissiongroupenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedpermission(permissiongroup: any[]) {
    let filteredpermissionGroup = permissiongroup.filter((permissiongroup) =>
      permissiongroup.permissiongroupname
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    if (startDate || endDate) {
      filteredpermissionGroup = filteredpermissionGroup.filter(
        (permissiongroup) => {
          const prodStart = parseDate(permissiongroup.permissiongroupstartdate);
          const prodEnd = parseDate(permissiongroup.permissiongroupenddate);

          if (startDate && prodStart < startDate) return false;
          if (endDate && prodEnd > endDate) return false;

          return true;
        }
      );
    }
    if (statusFilterGroup !== "All") {
      filteredpermissionGroup = filteredpermissionGroup.filter(
        (permissiongroup) =>
          permissiongroup.permissiongroupstatus === statusFilterGroup
      );
    }

    filteredpermissionGroup.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (
        sortKey === "permissiongroupstartdate" ||
        sortKey === "permissiongroupenddate"
      ) {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredpermissionGroup;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((permissiongroup: any) => {
        const shouldBeActive = getStatus(permissiongroup) === "Active";
        if (
          (shouldBeActive &&
            permissiongroup.permissiongroupstatus !== "Active") ||
          (!shouldBeActive &&
            permissiongroup.permissiongroupstatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: permissiongroup.id,
            permissiongroupstatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredPermissionsGroup = getFilteredSortedpermission(data || []);
  const permissionGroupCount = filteredPermissionsGroup.length;

   const exportToExcel = () => {
      const exportData = filteredPermissionsGroup.map((c: any) => ({
        ID: c.id,
        Name: c.permissiongroupname,
        Status: getStatus(c),
  
        "Start Date": c.permissiongroupstartdate,
        "End Date": c.permissiongroupenddate,
        Description: c.permissiongroupdefinition,
        " Permission Name": Array.isArray(c.permissionGroupPname)
          ? c.permissionGroupPname
              .map((p: any) =>
                typeof p === "object" ? p.label || p.value : String(p)
              )
              .join(", ")
          : String(c.permissionGroupPname || ""),
  
        " Role": Array.isArray(c.permissiongrouprole)
          ? c.permissiongrouprole
              .map((p: any) =>
                typeof p === "object" ? p.label || p.value : String(p)
              )
              .join(", ")
          : String(c.permissiongrouprole || ""),
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "permissiongroup");
      XLSX.writeFile(workbook, "permissiongroup.xlsx");
    };
  
    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.text("Permission Group List", 14, 15);
  
      autoTable(doc, {
        startY: 20,
        head: [
          [
            "ID",
            "Name",
            "Status",
            "Start Date",
            "End Date",
            "Description",
            "Permission Name",
            "Role",
          ],
        ],
        body: filteredPermissionsGroup.map((c: any) => [
          c.id,
          c.permissiongroupname,
          getStatus(c),
          c.permissiongroupstartdate,
          c.permissiongroupenddate,
          c.permissiongroupdefinition,
          c.permissionGroupPname,
          c.permissiongrouprole,
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
      });
  
      doc.save("permissiongroup.pdf");
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <FileLineChartIcon className="w-6 h-6" />
          Permission Group - {permissionGroupCount}{" "}
          {permissionGroupCount !== 1 ? "" : ""}
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
          Add Permission Group
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <FileLineChartIcon className="w-6 h-6" />
              Create New Permission Group
            </h2>
            <PermissionGroupForm onClose={() => setShowForm(false)} />
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

      {editId !== null && (
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
      )}
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
                    setSortKey("permissiongroupname");
                    setSortOrder(
                      sortKey === "permissiongroupname" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Permission Group Name{" "}
                  {sortKey === "permissiongroupname"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("permissiongroupstatus");
                    setSortOrder(
                      sortKey === "permissiongroupstatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "permissiongroupstatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("permissiongroupstartdate");
                    setSortOrder(
                      sortKey === "permissiongroupstartdate" &&
                        sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Start Date{" "}
                  {sortKey === "permissiongroupstartdate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("permissiongroupenddate");
                    setSortOrder(
                      sortKey === "permissiongroupenddate" &&
                        sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  End Date{" "}
                  {sortKey === "permissiongroupenddate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Definition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Permission Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Role
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissionsGroup.map((permissiongroup: any) => (
                <tr key={permissiongroup.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permissiongroup.id}
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permissiongroup.permissiongroupname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(permissiongroup)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permissiongroup.permissiongroupstartdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permissiongroup.permissiongroupenddate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permissiongroup.permissiongroupdefinition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(permissiongroup.permissionGroupPname)
                      ? permissiongroup.permissionGroupPname
                          .map((c: any) => {
                            if (typeof c === "object" && c !== null) {
                              return c.label || c.value || String(c);
                            }
                            return String(c);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(permissiongroup.permissionGroupPname || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(permissiongroup.permissiongrouprole)
                      ? permissiongroup.permissiongrouprole
                          .map((r: any) => {
                            if (typeof r === "object" && r !== null) {
                              return r.label || r.value || String(r);
                            }
                            return String(r);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(permissiongroup.permissiongrouprole || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === permissiongroup.id
                            ? null
                            : permissiongroup.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    
                    {openMenuId === permissiongroup.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleViewDetails(permissiongroup.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(permissiongroup.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(permissiongroup.id)}
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
          {filteredPermissionsGroup.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search
                ? "No Permissions found matching your search."
                : "No Permissions found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
