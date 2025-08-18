import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import EngagementForm from "./engagementForm";
import { Calendar, Search, Plus } from "lucide-react";
import { Engagement, DateTimeSlot } from "./engagementType";

export default function EngagementTable() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["engagements"],
    queryFn: () =>
      axios.get("http://localhost:3000/engagements").then((res) => res.data),
  });

  // const deleteMutation = useMutation({
  //   mutationFn: (id: number) =>
  //     axios.delete(`http://localhost:3000/engagements/${id}`),
  //   onSuccess: () =>
  //     queryClient.invalidateQueries({ queryKey: ["engagements"] }),
  // });

  // function handleDelete(id: number) {
  //   if (confirm("Are you sure you want to delete this engagement?")) {
  //     deleteMutation.mutate(id);
  //   }
  // }

  function handleViewDetails(id: number) {
    navigate({ to: `/engagements/${id}` });
  }

  function formatDateTimeDisplay(slot: DateTimeSlot) {
    if (!slot.date || !slot.time) return "Not set";

    const date = new Date(slot.date);
    const [hours, minutes] = slot.time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${date.toLocaleDateString()} ${displayHour}:${minutes} ${ampm} ${
      slot.timezone
    }`;
  }

  function formatCreatedDateTime(dateTimeString: string) {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  }

  function getFilteredSortedEngagements(engagements: Engagement[]) {
    let filtered = engagements.filter(
      (engagement) =>
        engagement.engagementOwner
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        engagement.speaker.toLowerCase().includes(search.toLowerCase()) ||
        engagement.caterer.toLowerCase().includes(search.toLowerCase()) ||
        engagement.cohost.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortKey as keyof Engagement];
      let bValue: any = b[sortKey as keyof Engagement];

      // Handle date-time sorting
      if (sortKey === "primaryDateTime") {
        aValue = a.primaryDateTime.date + a.primaryDateTime.time;
        bValue = b.primaryDateTime.date + b.primaryDateTime.time;
      } else if (sortKey === "createdDateTime") {
        aValue = new Date(a.createdDateTime);
        bValue = new Date(b.createdDateTime);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  const filteredEngagements = getFilteredSortedEngagements(data || []);
  const engagementsCount = filteredEngagements.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Calendar className="w-6 h-6" />
          Engagements - {engagementsCount}{" "}
          {engagementsCount !== 1 ? "items" : "item"}
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Plus className="w-5 h-5" />
          Create Engagement
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search engagements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Create New Engagement
            </h2>
            <EngagementForm onClose={() => setShowForm(false)} />
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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
                    Engagement ID
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
                    setSortKey("engagementOwner");
                    setSortOrder(
                      sortKey === "engagementOwner" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  <div className="flex items-center gap-1">
                    Engagement Owner
                    {sortKey === "engagementOwner" && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caterer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cohost
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("primaryDateTime");
                    setSortOrder(
                      sortKey === "primaryDateTime" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  <div className="flex items-center gap-1">
                    Primary Date & Time
                    {sortKey === "primaryDateTime" && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secondary Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tertiary Date & Time
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("createdDateTime");
                    setSortOrder(
                      sortKey === "createdDateTime" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  <div className="flex items-center gap-1">
                    Created Date & Time
                    {sortKey === "createdDateTime" && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEngagements.map((engagement: Engagement) => (
                <tr key={engagement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(engagement.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      {engagement.id}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {engagement.engagementOwner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {engagement.speaker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {engagement.caterer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {engagement.cohost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTimeDisplay(engagement.primaryDateTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {engagement.secondaryDateTime
                      ? formatDateTimeDisplay(engagement.secondaryDateTime)
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {engagement.tertiaryDateTime
                      ? formatDateTimeDisplay(engagement.tertiaryDateTime)
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCreatedDateTime(engagement.createdDateTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === engagement.id ? null : engagement.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === engagement.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleViewDetails(engagement.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View Details
                        </button>
                        
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEngagements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search
                ? "No engagements found matching your search."
                : "No engagements found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
