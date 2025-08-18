import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DateTimeSlot, EngagementFormData } from "./engagementType";
import DateTimePicker from "../../components/dateTimePicker";
import { X } from "lucide-react";

interface EngagementFormProps {
  onClose: () => void;
}

export default function EngagementForm({ onClose }: EngagementFormProps) {
  const [form, setForm] = useState<EngagementFormData>({
    engagementOwner: "",
    speaker: "",
    caterer: "",
    cohost: "",
    primaryDateTime: { date: "", time: "", timezone: "ET" },
  });

  const [selectedSlots, setSelectedSlots] = useState<DateTimeSlot[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const createEngagement = useMutation({
    mutationFn: async (newEngagement: EngagementFormData) => {
      const all = await axios
        .get("http://localhost:3000/engagements")
        .then((res) => res.data as any[]);
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      const nextId = (numericIds.length ? Math.max(...numericIds) : 0) + 1;

      return axios.post("http://localhost:3000/engagements", {
        id: nextId,
        ...newEngagement,
        createdDateTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
      onClose();
    },
  });

  useEffect(() => {
    const slots: DateTimeSlot[] = [];
    if (form.primaryDateTime.date && form.primaryDateTime.time) {
      slots.push(form.primaryDateTime);
    }
    if (form.secondaryDateTime?.date && form.secondaryDateTime?.time) {
      slots.push(form.secondaryDateTime);
    }
    if (form.tertiaryDateTime?.date && form.tertiaryDateTime?.time) {
      slots.push(form.tertiaryDateTime);
    }
    setSelectedSlots(slots);
  }, [form.primaryDateTime, form.secondaryDateTime, form.tertiaryDateTime]);

  function handleTextChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleDateTimeChange(
    field: "primaryDateTime" | "secondaryDateTime" | "tertiaryDateTime",
    value: DateTimeSlot | null
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value || { date: "", time: "", timezone: "ET" },
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function removeDateTimeSlot(field: "secondaryDateTime" | "tertiaryDateTime") {
    setForm((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.engagementOwner.trim()) {
      newErrors.engagementOwner = "Engagement Owner is required";
    }
    if (!form.speaker.trim()) {
      newErrors.speaker = "Speaker is required";
    }
    if (!form.caterer.trim()) {
      newErrors.caterer = "Caterer is required";
    }
    if (!form.cohost.trim()) {
      newErrors.cohost = "Cohost is required";
    }

    if (!form.primaryDateTime.date || !form.primaryDateTime.time) {
      newErrors.primaryDateTime = "Primary Date and Time is required";
    }

    const allSlots = [
      form.primaryDateTime,
      form.secondaryDateTime,
      form.tertiaryDateTime,
    ].filter((slot) => slot?.date && slot?.time);

    const slotStrings = allSlots.map(
      (slot) => `${slot!.date}-${slot!.time}-${slot!.timezone}`
    );
    const uniqueSlots = new Set(slotStrings);

    if (slotStrings.length !== uniqueSlots.size) {
      newErrors.duplicateSlots = "All selected time slots must be unique";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...form,
      secondaryDateTime:
        form.secondaryDateTime?.date && form.secondaryDateTime?.time
          ? form.secondaryDateTime
          : undefined,
      tertiaryDateTime:
        form.tertiaryDateTime?.date && form.tertiaryDateTime?.time
          ? form.tertiaryDateTime
          : undefined,
    };

    createEngagement.mutate(submissionData);
  }

  function formatDateTimeDisplay(slot: DateTimeSlot) {
    const date = new Date(slot.date);
    const [hours, minutes] = slot.time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${date.toLocaleDateString()} at ${displayHour}:${minutes} ${ampm} ${
      slot.timezone
    }`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engagement Owner <span className="text-red-500">*</span>
          </label>
          <input
            name="engagementOwner"
            value={form.engagementOwner}
            onChange={handleTextChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.engagementOwner ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter engagement owner"
          />
          {errors.engagementOwner && (
            <p className="text-red-500 text-sm mt-1">
              {errors.engagementOwner}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker <span className="text-red-500">*</span>
          </label>
          <input
            name="speaker"
            value={form.speaker}
            onChange={handleTextChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.speaker ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter speaker name"
          />
          {errors.speaker && (
            <p className="text-red-500 text-sm mt-1">{errors.speaker}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caterer <span className="text-red-500">*</span>
          </label>
          <input
            name="caterer"
            value={form.caterer}
            onChange={handleTextChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.caterer ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter caterer name"
          />
          {errors.caterer && (
            <p className="text-red-500 text-sm mt-1">{errors.caterer}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cohost <span className="text-red-500">*</span>
          </label>
          <input
            name="cohost"
            value={form.cohost}
            onChange={handleTextChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cohost ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter cohost name"
          />
          {errors.cohost && (
            <p className="text-red-500 text-sm mt-1">{errors.cohost}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Date and Time Selection
        </h3>

        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <DateTimePicker
            value={
              form.primaryDateTime.date && form.primaryDateTime.time
                ? form.primaryDateTime
                : null
            }
            onChange={(value) => handleDateTimeChange("primaryDateTime", value)}
            label="Primary Date and Time"
            required={true}
            disabledSlots={selectedSlots.filter(
              (slot) => slot !== form.primaryDateTime && slot.date && slot.time
            )}
          />
          {errors.primaryDateTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.primaryDateTime}
            </p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-700">
              Secondary Date and Time (Optional)
            </h4>
            {form.secondaryDateTime?.date && form.secondaryDateTime?.time && (
              <button
                type="button"
                onClick={() => removeDateTimeSlot("secondaryDateTime")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {form.secondaryDateTime?.date && form.secondaryDateTime?.time ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Selected: {formatDateTimeDisplay(form.secondaryDateTime)}
              </p>
            </div>
          ) : (
            <DateTimePicker
              value={null}
              onChange={(value) =>
                handleDateTimeChange("secondaryDateTime", value)
              }
              label="Secondary Date and Time"
              disabledSlots={selectedSlots}
            />
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-700">
              Tertiary Date and Time (Optional)
            </h4>
            {form.tertiaryDateTime?.date && form.tertiaryDateTime?.time && (
              <button
                type="button"
                onClick={() => removeDateTimeSlot("tertiaryDateTime")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {form.tertiaryDateTime?.date && form.tertiaryDateTime?.time ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Selected: {formatDateTimeDisplay(form.tertiaryDateTime)}
              </p>
            </div>
          ) : (
            <DateTimePicker
              value={null}
              onChange={(value) =>
                handleDateTimeChange("tertiaryDateTime", value)
              }
              label="Tertiary Date and Time"
              disabledSlots={selectedSlots}
            />
          )}
        </div>
      </div>

      {errors.duplicateSlots && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-500 text-sm">{errors.duplicateSlots}</p>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createEngagement.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createEngagement.isPending ? "Creating..." : "Create Engagement"}
        </button>
      </div>
    </form>
  );
}
