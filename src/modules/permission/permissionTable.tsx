import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import PermissionForm from "./permissionForm";
import { ShieldCheck } from "lucide-react";

export default function PermissionTable() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () =>
      axios.get("http://localhost:3000/permission").then((res) => res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/permission/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      permissionstatus,
    }: {
      id: number;
      permissionstatus: string;
    }) =>
      axios.patch(`http://localhost:3000/permission/${id}`, {
        permissionstatus,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteMutation.mutate(id);
    }
  }

  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getStatus(role: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const permissionenddate = parseDate(role.permissionenddate);
    permissionenddate.setHours(0, 0, 0, 0);

    return permissionenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedpermission(permissions: any[]) {
    let filteredpermission = permissions.filter((permission) =>
      permission.permissionname.toLowerCase().includes(search.toLowerCase())
    );

    filteredpermission.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (
        sortKey === "permissionstartdate" ||
        sortKey === "permissionenddate"
      ) {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredpermission;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((role: any) => {
        const shouldBeActive = getStatus(role) === "Active";
        if (
          (shouldBeActive && role.permissionstatus !== "Active") ||
          (!shouldBeActive && role.permissionstatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: role.id,
            permissionstatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredPermissions = getFilteredSortedpermission(data || []);
  const permissionCount = filteredPermissions.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="w-6 h-6" />
          Permission - {permissionCount} {permissionCount !== 1 ? "" : ""}
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
          Add Permission
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
              <ShieldCheck className="w-6 h-6" />
              Create New Permission
            </h2>
            <PermissionForm onClose={() => setShowForm(false)} />
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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-1/3"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("permissionname");
                  setSortOrder(
                    sortKey === "permissionname" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Permission Name{" "}
                {sortKey === "permissionname"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("permissionstatus");
                  setSortOrder(
                    sortKey === "permissionstatus" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Status{" "}
                {sortKey === "permissionstatus"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("permissionstartdate");
                  setSortOrder(
                    sortKey === "permissionstartdate" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Start Date{" "}
                {sortKey === "permissionstartdate"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("permissionenddate");
                  setSortOrder(
                    sortKey === "permissionenddate" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                End Date{" "}
                {sortKey === "permissionenddate"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th className="border px-4 py-2">Definition</th>
              <th className="border px-4 py-2">Aligned Client</th>
              <th className="border px-4 py-2">Role</th>

              <th className="border px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map((permission: any) => (
              <tr key={permission.id}>
                <td className="border px-4 py-2">
                  {permission.permissionname}
                </td>

                <td className="border px-4 py-2">{getStatus(permission)}</td>
                <td className="border px-4 py-2">
                  {permission.permissionstartdate}
                </td>
                <td className="border px-4 py-2">
                  {permission.permissionenddate}
                </td>
                <td className="border px-4 py-2">
                  {permission.permissiondefinition}
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(permission.permissionclient)
                    ? permission.permissionclient
                        .map((c: any) => {
                          if (typeof c === "object" && c !== null) {
                            return c.label || c.value || String(c);
                          }
                          return String(c);
                        })
                        .filter(Boolean)
                        .join(", ")
                    : String(permission.permissionclient || "")}
                </td>

                <td className="border px-4 py-2">
                  {Array.isArray(permission.permissionrole)
                    ? permission.permissionrole
                        .map((r: any) => {
                          if (typeof r === "object" && r !== null) {
                            return r.label || r.value || String(r);
                          }
                          return String(r);
                        })
                        .filter(Boolean)
                        .join(", ")
                    : String(permission.permissionrole || "")}
                </td>

                <td className="border px-4 py-2 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === permission.id ? null : permission.id      
                      )
                    }
                    className="px-2 py-1 rounded hover:bg-gray-200"
                  >
                    ⋮
                  </button>

                  {openMenuId === permission.id && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-md z-10">
                      <button
                        onClick={() => handleDelete(permission.id)}
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
      )}
    </div>
  );
}
