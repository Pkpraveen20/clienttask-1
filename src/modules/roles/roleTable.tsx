import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import RoleForm from "./roleForm";
import { User } from "lucide-react";

export default function RoleTable() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      axios.get("http://localhost:3000/roles").then((res) => res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, rolestatus }: { id: number; rolestatus: string }) =>
      axios.patch(`http://localhost:3000/roles/${id}`, { rolestatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
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

    const roleenddate = parseDate(role.roleenddate);
    roleenddate.setHours(0, 0, 0, 0);

    return roleenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedRoles(roles: any[]) {
    let filteredRoles = roles.filter((role) =>
      role.rolename.toLowerCase().includes(search.toLowerCase())
    );

    filteredRoles.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === "rolestartdate" || sortKey === "roleenddate") {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredRoles;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((role: any) => {
        const shouldBeActive = getStatus(role) === "Active";
        if (
          (shouldBeActive && role.rolestatus !== "Active") ||
          (!shouldBeActive && role.rolestatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: role.id,
            rolestatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);
  const filteredRole = getFilteredSortedRoles(data || []);
  const roleCount = filteredRole.length;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <User className="w-6 h-6" />
          Roles - {roleCount} {roleCount !== 1 ? "" : ""}
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
          Add Role
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
              <User className="w-6 h-6" />
              Create New Role
            </h2>
            <RoleForm onClose={() => setShowForm(false)} />
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
                  setSortKey("rolename");
                  setSortOrder(
                    sortKey === "rolename" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Role Name{" "}
                {sortKey === "rolename"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("rolestatus");
                  setSortOrder(
                    sortKey === "rolestatus" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Role Status{" "}
                {sortKey === "rolestatus"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("roletype");
                  setSortOrder(
                    sortKey === "roletype" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Role Type{" "}
                {sortKey === "roletype"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("rolestartdate");
                  setSortOrder(
                    sortKey === "rolestartdate" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                Start Date{" "}
                {sortKey === "rolestartdate"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => {
                  setSortKey("roleenddate");
                  setSortOrder(
                    sortKey === "roleenddate" && sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  );
                }}
              >
                End Date{" "}
                {sortKey === "roleenddate"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRole.map((role: any) => (
              <tr key={role.id}>
                <td className="border px-4 py-2">{role.rolename}</td>
                <td className="border px-4 py-2">{getStatus(role)}</td>
                <td className="border px-4 py-2">{role.roletype}</td>

                <td className="border px-4 py-2">{role.rolestartdate}</td>
                <td className="border px-4 py-2">{role.roleenddate}</td>
                <td className="border px-4 py-2">{role.roledescription}</td>
                <td className="border px-4 py-2 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === role.id ? null : role.id)
                    }
                    className="px-2 py-1 rounded  hover:bg-gray-200 "
                  >
                    ⋮
                  </button>

                  {openMenuId === role.id && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-md z-10">
                      <button
                        onClick={() => handleDelete(role.id)}
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
