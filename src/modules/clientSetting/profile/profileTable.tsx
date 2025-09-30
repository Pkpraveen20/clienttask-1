import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User2Icon, UserCheck2Icon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import StatusFilterDropdown from "../../../components/StatusWithFilter";
import FilterDate from "../../../components/filterDate";
import searchBg from "../../../assets/search-bg.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExportMenu from "../../../components/export";
import ProfileEditModal from "./profileEditModule";

export default function ProfileTable() {
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
  const [statusfilteredProfile, setStatusFilter] = useState<string>("All");

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      axios.get("http://localhost:3000/profile").then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:3000/profile/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      profilestatus,
    }: {
      id: number;
      profilestatus: string;
    }) =>
      axios.patch(`http://localhost:3000/profile/${id}`, {
        profilestatus,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteMutation.mutate(id);
    }
  }
  function handleViewDetails(id: number) {
    navigate({ to: `/profile/${id}` });
  }
  function handleCreate() {
    navigate({ to: `/profilecreate` });
  }
  function handleEdit(id: number) {
    setEditId(id);
  }

  function parseDate(ddmmyyyy: string): Date {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getStatus(profile: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const profileenddate = parseDate(profile.profileenddate);
    profileenddate.setHours(0, 0, 0, 0);

    return profileenddate >= today ? "Active" : "Inactive";
  }

  function getFilteredSortedProfile(profile: any[]) {
    let filteredProfile = profile.filter((profile) =>
      profile.username.toLowerCase().includes(search.toLowerCase())
    );
    if (startDate || endDate) {
      filteredProfile = filteredProfile.filter((profile) => {
        const profilestartdate = parseDate(profile.profilestartdate);
        const profileenddate = parseDate(profile.profileenddate);

        if (startDate && profilestartdate < startDate) return false;
        if (endDate && profileenddate > endDate) return false;

        return true;
      });
    }
    if (statusfilteredProfile !== "All") {
      filteredProfile = filteredProfile.filter(
        (profile) => profile.profilestatus === statusfilteredProfile
      );
    }

    filteredProfile.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === "profilestartdate" || sortKey === "profileenddate") {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredProfile;
  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((profile: any) => {
        const shouldBeActive = getStatus(profile) === "Active";
        if (
          (shouldBeActive && profile.profilestatus !== "Active") ||
          (!shouldBeActive && profile.profilestatus !== "Inactive")
        ) {
          updateStatusMutation.mutate({
            id: profile.id,
            profilestatus: shouldBeActive ? "Active" : "Inactive",
          });
        }
      });
    }
  }, [data]);

  const filteredProfile = getFilteredSortedProfile(data || []);
  const functionCount = filteredProfile.length;

  const exportToExcel = () => {
    const exportData = filteredProfile.map((t: any) => ({
      ID: t.id,
      Name: t.username,
      Status: getStatus(t),
      "Functional Area Name": Array.isArray(t.profilefunctional)
        ? t.profilefunctional
            .map((p: any) =>
              typeof p === "object" ? p.label || p.value : String(p)
            )
            .join(", ")
        : String(t.profilefunctional || ""),
      Roles: Array.isArray(t.profilerole)
        ? t.profilerole
            .map((p: any) =>
              typeof p === "object" ? p.label || p.value : String(p)
            )
            .join(", ")
        : String(t.profilerole || ""),
      "Premission Group": Array.isArray(t.profilepermissiongroup)
        ? t.profilepermissiongroup
            .map((p: any) =>
              typeof p === "object" ? p.label || p.value : String(p)
            )
            .join(", ")
        : String(t.profilepermissiongroup || ""),
      Email: t.email,
      "Start Date": t.profilestartdate,
      "End Date": t.profileenddate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "profile");
    XLSX.writeFile(workbook, "profile.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("profile List", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "ID",
          "Username",
          "Status",
          "Functional Area Name",
          "Roles",
          "Premission Group",
          "email",
          "Start Date",
          "End Date",
        ],
      ],
      body: filteredProfile.map((t: any) => [
        t.id,
        t.username,
        getStatus(t),
        t.profilefunctional,
        t.profilerole,
        t.profilepermissiongroup,
        t.email,
        t.profilestartdate,
        t.profileenddate,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save("profile.pdf");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <UserCheck2Icon className="w-6 h-6" />
          Profile - {functionCount} {functionCount !== 1 ? "" : ""}
        </h2>

        <button
          onClick={handleCreate}
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
          Add Profile
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

            {/* <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Book className="w-6 h-6" />
              Create New Topic
            </h2> */}
            {/* <ProfileForm onClose={() => setShowForm(false)} /> */}
          </div>
          {/* <style>
            {`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97);}
          to { opacity: 1; transform: scale(1);}
        }
      `}
          </style> */}
        </div>
      )}

      {editId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setEditId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <User2Icon className="w-6 h-6" />
              Edit Product
            </h2>
            <ProfileEditModal id={editId} onClose={() => setEditId(null)} />
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
          statusFilter={statusfilteredProfile}
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
                    Profile ID
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
                    setSortKey("username");
                    setSortOrder(
                      sortKey === "username" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  User Name{" "}
                  {sortKey === "username"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortKey("profilestatus");
                    setSortOrder(
                      sortKey === "profilestatus" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Status{" "}
                  {sortKey === "profilestatus"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Functional Area Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  PermissionGroup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Email Address
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

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfile.map((profile: any) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{profile.id}</td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStatus(profile)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(profile.profilefunctional)
                      ? profile.profilefunctional.join(", ")
                      : profile.profilefunctional}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(profile.profilerole)
                      ? profile.profilerole.join(", ")
                      : profile.profilerole}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(profile.profilepermissiongroup)
                      ? profile.profilepermissiongroup.join(", ")
                      : profile.profilepermissiongroup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.profilestartdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.profileenddate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === profile.id ? null : profile.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === profile.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={() => handleViewDetails(profile.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(profile.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id)}
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
          {filteredProfile.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <img
                src={searchBg}
                alt="No results"
                className="w-48 h-48 object-contain mb-4 opacity-80"
              />
              <p>
                {search
                  ? "No profile found matching your search."
                  : "No profile found."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
