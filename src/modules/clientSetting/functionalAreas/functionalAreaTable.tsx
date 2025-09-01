import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import FunctionalAreaForm from "./functionalAreaForm";
import { Folder } from "lucide-react";

export default function FunctionalArea() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["functionalarea"],
    queryFn: () =>
      axios.get("http://localhost:3000/functionalarea").then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/functionalarea/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["functionalarea"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      functionalstatus,
    }: {
      id: number;
      functionalstatus: string;
    }) =>
      axios.patch(`http://localhost:3000/functionalarea/${id}`, {
        functionalstatus,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["functionalarea"] }),
  });

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this Functional Area?")) {
      deleteMutation.mutate(id);
    }
    refetch();
  }

  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getStatus(role: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const functionalenddate = parseDate(role.functionalenddate);
    functionalenddate.setHours(0, 0, 0, 0);

    return functionalenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedRoles(functionalareas: any[]) {
    let filteredfunctioal = functionalareas.filter((functionalarea) =>
      functionalarea.functionalname.toLowerCase().includes(search.toLowerCase())
    );

    filteredfunctioal.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (
        sortKey === "functionalstartdate" ||
        sortKey === "functionalenddate"
      ) {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredfunctioal;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((role: any) => {
        const shouldBeActive = getStatus(role) === "Active";
        if (
          (shouldBeActive && role.functionalstatus !== "Active") ||
          (!shouldBeActive && role.functionalstatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: role.id,
            functionalstatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredFunction = getFilteredSortedRoles(data || []);
  const functionCount = filteredFunction.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Folder className="w-6 h-6" />
          Functional Area - {functionCount} {functionCount !== 1 ? "" : ""}
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
          Add Functional Area
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
              <Folder className="w-6 h-6" />
              Create New Functional Area
            </h2>
            <FunctionalAreaForm onClose={() => setShowForm(false)} />
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
                    Functional ID
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
                    setSortKey("functionalname");
                    setSortOrder(
                      sortKey === "functionalname" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Functional Area Name{" "}
                  {sortKey === "rolename"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("functionaltype");
                    setSortOrder(
                      sortKey === "functionaltype" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Functional Area Type{" "}
                  {sortKey === "functionaltype"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("functionalstatus");
                    setSortOrder(
                      sortKey === "functionalstatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "functionalstatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("functionalstartdate");
                    setSortOrder(
                      sortKey === "functionalstartdate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Start Date{" "}
                  {sortKey === "functionalstartdate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("functionalenddate");
                    setSortOrder(
                      sortKey === "functionalenddate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  End Date{" "}
                  {sortKey === "functionalenddate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Aligned Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFunction.map((functionalarea: any) => (
                <tr key={functionalarea.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {functionalarea.id}
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {functionalarea.functionalname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {functionalarea.functionaltype}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(functionalarea)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {functionalarea.functionalstartdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {functionalarea.functionalenddate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {functionalarea.functionaldescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(functionalarea.functionalclient)
                      ? functionalarea.functionalclient.join(", ")
                      : functionalarea.functionalclient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === functionalarea.id
                            ? null
                            : functionalarea.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === functionalarea.id && (
                      <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleDelete(functionalarea.id)}
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
          {filteredFunction.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search
                ? "No functional found matching your search."
                : "No functional found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
