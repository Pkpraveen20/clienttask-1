import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Book } from "lucide-react";
import TopicForm from "./topicForm";
import { useNavigate } from "@tanstack/react-router";
import TopicEditModal from "./topicEditModal";
import StatusFilterDropdown from "../../../components/StatusWithFilter";
import FilterDate from "../../../components/filterDate";
import searchBg from "../../../assets/search-bg.png";
import { Search } from "lucide-react";

export default function TopicTable() {
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
  const [statusfilteredtopic, setStatusFilter] = useState<string>("All");

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["topic"],
    queryFn: () =>
      axios.get("http://localhost:3000/topic").then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/topic/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topic"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, topicstatus }: { id: number; topicstatus: string }) =>
      axios.patch(`http://localhost:3000/topic/${id}`, {
        topicstatus,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topics"] }),
  });

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this topic?")) {
      deleteMutation.mutate(id);
    }
  }
  function handleViewDetails(id: number) {
    navigate({ to: `/topic/${id}` });
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

    const topicenddate = parseDate(role.topicenddate);
    topicenddate.setHours(0, 0, 0, 0);

    return topicenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedRoles(topics: any[]) {
    let filteredTopic = topics.filter((topic) =>
      topic.topicname.toLowerCase().includes(search.toLowerCase())
    );
    if (startDate || endDate) {
      filteredTopic = filteredTopic.filter((topic) => {
        const topicstartdate = parseDate(topic.topicstartdate);
        const topicenddate = parseDate(topic.topicenddate);

        if (startDate && topicstartdate < startDate) return false;
        if (endDate && topicenddate > endDate) return false;

        return true;
      });
    }
    if (statusfilteredtopic !== "All") {
      filteredTopic = filteredTopic.filter(
        (topic) => topic.topicstatus === statusfilteredtopic
      );
    }

    filteredTopic.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === "topicstartdate" || sortKey === "topicenddate") {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredTopic;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((topic: any) => {
        const shouldBeActive = getStatus(topic) === "Active";
        if (
          (shouldBeActive && topic.topicstatus !== "Active") ||
          (!shouldBeActive && topic.topicstatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: topic.id,
            topicstatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredtopic = getFilteredSortedRoles(data || []);
  const functionCount = filteredtopic.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Book className="w-6 h-6" />
          Topic - {functionCount} {functionCount !== 1 ? "" : ""}
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
          Add Topic
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
              <Book className="w-6 h-6" />
              Create New Topic
            </h2>
            <TopicForm onClose={() => setShowForm(false)} />
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
              <Book className="w-6 h-6" />
              Edit Product
            </h2>
            <TopicEditModal id={editId} onClose={() => setEditId(null)} />
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 pl-8 pr-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <StatusFilterDropdown
          statusFilter={statusfilteredtopic}
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
                    Topic ID
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
                    setSortKey("topicname");
                    setSortOrder(
                      sortKey === "topicname" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Topic Name{" "}
                  {sortKey === "topicname"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("topicstatus");
                    setSortOrder(
                      sortKey === "topicstatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "topicstatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Product Name
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("topicstartdate");
                    setSortOrder(
                      sortKey === "topicstartdate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Start Date{" "}
                  {sortKey === "topicstartdate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("topicenddate");
                    setSortOrder(
                      sortKey === "topicenddate" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  End Date{" "}
                  {sortKey === "topicenddate"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Engagement Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Description
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredtopic.map((topic: any) => (
                <tr key={topic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{topic.id}</td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.topicname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(topic)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(topic.topicproduct)
                      ? topic.topicproduct.join(", ")
                      : topic.topicproduct}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.topicstartdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.topicenddate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(topic.engagementTypes)
                      ? topic.engagementTypes
                          .map((c: any) => {
                            if (typeof c === "object" && c !== null) {
                              return c.label || c.value || String(c);
                            }
                            return String(c);
                          })
                          .filter(Boolean)
                          .join(", ")
                      : String(topic.engagementTypes || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.topicdescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === topic.id ? null : topic.id)
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === topic.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleViewDetails(topic.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(topic.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
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
          {filteredtopic.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <img
                src={searchBg}
                alt="No results"
                className="w-48 h-48 object-contain mb-4 opacity-80"
              />
              <p>
                {search
                  ? "No topic found matching your search."
                  : "No topic found."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
