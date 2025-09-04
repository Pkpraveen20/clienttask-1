import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Clock,
  CalendarDays,
  BarChart,
} from "lucide-react";
import { DateTimeSlot } from "./engagementType";

export default function EngagementView() {
  const { id } = useParams({ from: "/engagements/$id" });
  const navigate = useNavigate();

  const {
    data: engagement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["engagement", id],
    queryFn: async () => {
      const byString = await axios
        .get(`http://localhost:3000/engagements`, {
          params: { id },
        })
        .then((res) => (Array.isArray(res.data) ? res.data[0] : undefined));

      if (byString) return byString;

      const numericId = Number(id);
      if (Number.isFinite(numericId)) {
        const byNumber = await axios
          .get(`http://localhost:3000/engagements`, {
            params: { id: numericId },
          })
          .then((res) => (Array.isArray(res.data) ? res.data[0] : undefined));
        if (byNumber) return byNumber;
      }

      try {
        const direct = await axios
          .get(`http://localhost:3000/engagements/${id}`)
          .then((res) => res.data);
        return direct;
      } catch {
        return undefined;
      }
    },
  });

  function formatDateTimeDisplay(slot: DateTimeSlot) {
    if (!slot.date || !slot.time) return "Not set";

    const date = new Date(slot.date);
    const [hours, minutes] = slot.time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${date.toLocaleDateString()} at ${displayHour}:${minutes} ${ampm} ${
      slot.timezone
    }`;
  }

  function formatCreatedDateTime(dateTimeString: string) {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US",{
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !engagement) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          Engagement not found or error loading data.
        </p>
        <button
          onClick={() => navigate({ to: "/engagements" })}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          Back to Engagements
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate({ to: "/engagements" })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Engagements
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Engagement #{engagement.id}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Engagement Owner
                  </h3>
                </div>
                <p className="text-blue-800 text-lg">
                  {engagement.engagementOwner}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Speaker
                  </h3>
                </div>
                <p className="text-green-800 text-lg">{engagement.speaker}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">
                    Caterer
                  </h3>
                </div>
                <p className="text-purple-800 text-lg">{engagement.caterer}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">
                    Status
                  </h3>
                </div>
                <p className="text-orange-800 text-lg">{engagement.status}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">
                    Cohost
                  </h3>
                </div>
                <p className="text-orange-800 text-lg">{engagement.cohost}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Primary Date & Time
                  </h3>
                </div>
                <p className="text-red-800 text-lg font-medium">
                  {formatDateTimeDisplay(engagement.primaryDateTime)}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">
                    Secondary Date & Time
                  </h3>
                </div>
                <p className="text-yellow-800 text-lg">
                  {engagement.secondaryDateTime
                    ? formatDateTimeDisplay(engagement.secondaryDateTime)
                    : "Not set"}
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-indigo-900">
                    Tertiary Date & Time
                  </h3>
                </div>
                <p className="text-indigo-800 text-lg">
                  {engagement.tertiaryDateTime
                    ? formatDateTimeDisplay(engagement.tertiaryDateTime)
                    : "Not set"}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">
                    Engagement Type 
                  </h3>
                </div>
                <p className="text-orange-800 text-lg">{engagement.engagementType}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Created Date & Time
                  </h3>
                </div>
                <p className="text-gray-800 text-lg">
                  {formatCreatedDateTime(engagement.createdDateTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Engagement ID: {engagement.id}
            </p>
            <button
              onClick={() => navigate({ to: "/engagements" })}
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
