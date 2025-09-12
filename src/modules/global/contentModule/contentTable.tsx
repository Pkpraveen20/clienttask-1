import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BookCheck, BookCheckIcon } from "lucide-react";
import ContentForm from "./contentForm";
import { useNavigate } from "@tanstack/react-router";
import ContentEditModal from "./contentEditModule";
import FilterDate from "../../../components/filterDate";
import StatusFilterDropdown from "../../../components/StatusWithFilter";
import searchBg from "../../../assets/search-bg.png";


export default function ContentTable() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [editId, setEditId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [statusfilteredcontent, setStatusFilter] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: () =>
      axios.get("http://localhost:3000/content").then((res) => res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/content/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      contentstatus,
    }: {
      id: number;
      contentstatus: string;
    }) =>
      axios.patch(`http://localhost:3000/content/${id}`, {
        contentstatus,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(id);
    }
  }
  function handleViewDetails(id: number) {
    navigate({ to: `/content/${id}` });
  }
  function handleEdit(id: number) {
    setEditId(id);
  }
  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getStatus(role: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contentenddate = parseDate(role.contentenddate);
    contentenddate.setHours(0, 0, 0, 0);

    return contentenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedContent(content: any[]) {
    let filteredcontent = content.filter((content) =>
      content.contentname.toLowerCase().includes(search.toLowerCase())
    );
    if (startDate || endDate) {
      filteredcontent = filteredcontent.filter((item) => {
        const contentStart = parseDate(item.contentstartdate);
        const contentEnd = parseDate(item.contentenddate);

        if (startDate && contentStart < startDate) return false;
        if (endDate && contentEnd > endDate) return false;

        return true;
      });
    }
    if (statusfilteredcontent !== "All") {
      filteredcontent = filteredcontent.filter(
        (content) => content.contentstatus === statusfilteredcontent
      );
    }

    filteredcontent.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === "contentstartdate" || sortKey === "contentenddate") {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredcontent;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((content: any) => {
        const shouldBeActive = getStatus(content) === "Active";
        if (
          (shouldBeActive && content.contentstatus !== "Active") ||
          (!shouldBeActive && content.contentstatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: content.id,
            contentstatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredcontent = getFilteredSortedContent(data || []);
  const contentCount = filteredcontent.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <BookCheckIcon className="w-6 h-6" />
          Content - {contentCount} {contentCount !== 1 ? "" : ""}
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
          Add Content
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
              <BookCheck className="w-6 h-6" />
              Create New Content
            </h2>
            <ContentForm onClose={() => setShowForm(false)} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setEditId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <BookCheck className="w-6 h-6" />
              Edit Content
            </h2>
            <ContentEditModal id={editId} onClose={() => setEditId(null)} />
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
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-1/3"
        />
        <StatusFilterDropdown
          statusFilter={statusfilteredcontent}
          setStatusFilter={setStatusFilter}
        />

        <FilterDate onApply={setDateRange} />
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
                    Content ID
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
                    setSortKey("contentname");
                    setSortOrder(
                      sortKey === "contentname" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Content Name{" "}
                  {sortKey === "contentname"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("contentstatus");
                    setSortOrder(
                      sortKey === "contentstatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "contentstatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("contentstartdate");
                    setSortOrder(
                      sortKey === "contentstartdate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Start Date{" "}
                  {sortKey === "contentstartdate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("contentenddate");
                    setSortOrder(
                      sortKey === "contentenddate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  End Date{" "}
                  {sortKey === "contentenddate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Definition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Content Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Content Topic
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredcontent.map((content: any) => (
                <tr key={content.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{content.id}</td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.contentname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(content)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.contentstartdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.contentenddate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.contentdefinition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(content.contentproduct)
                      ? content.contentproduct
                          .map((c: any) => {
                            if (typeof c === "object" && c !== null) {
                              return c.label || c.value || String(c);
                            }
                            return String(c);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(content.contentproduct || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(content.contenttopic)
                      ? content.contenttopic
                          .map((r: any) => {
                            if (typeof r === "object" && r !== null) {
                              return r.label || r.value || String(r);
                            }
                            return String(r);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(content.contenttopic || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === content.id ? null : content.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === content.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleViewDetails(content.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(content.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
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
          {filteredcontent.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <img
                src={searchBg}
                alt="No results"
                className="w-48 h-48 object-contain mb-4 opacity-80"
              />
              <p>
                {search
                  ? "No content found matching your search."
                  : "No content found."}
              </p>
            </div>
            
          )}
        </div>
      )}
    </div>
  );
}
