import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { ArrowLeft, Box } from "lucide-react";

export default function ProfileView() {
  const { id } = useParams({ from: "/profile/$id" });
  const navigate = useNavigate();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/profile/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">profile not found or error loading data.</p>
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          Back to profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to profile
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Box className="w-8 h-8 text-blue-600" />
          profile #{profile.id}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                User Name
              </h3>
              <p className="text-blue-800 text-lg">{profile.username}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Start Date
              </h3>
              <p className="text-yellow-800 text-lg">
                {profile.profilestartdate}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Status
              </h3>
              <p className="text-gray-800 text-lg">{profile.profilestatus}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Functional Area Name
              </h3>
              <p className="text-orange-800 text-lg">
                {profile.profilefunctional}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Email
              </h3>
              <p className="text-orange-800 text-lg">{profile.email}</p>
            </div>

            {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Engagement Type
              </h3>
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
                : String(topic.engagementTypes || "")}{" "}
            </div> */}
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Roles
              </h3>
              <p className="text-green-800 text-lg">{profile.profilerole}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                End Date
              </h3>
              <p className="text-orange-800 text-lg">
                {profile.profileenddate}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Permisssion Group Name
              </h3>
              <p className="text-orange-800 text-lg">
                {profile.profilepermissiongroup}
              </p>
            </div>

            <div className="bg-orange-50flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Profile Image
              </h3>
              {profile.profileimage ? (
                <img
                  src={profile.profileimage}
                  alt={profile.username}
                  className="rounded-lg shadow max-h-64 object-contain border"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  No image available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">profile ID: {profile.id}</p>
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
