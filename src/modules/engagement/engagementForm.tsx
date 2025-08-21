import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DateTime } from "luxon";
import { DateTimeSlot, EngagementFormData } from "./engagementType";
import DateTimePicker from "../../components/dateTimePicker";

const timezoneMap: Record<string, string> = {
  ET: "America/New_York",
  CT: "America/Chicago",
  PT: "America/Los_Angeles",
};

function formatSlot(slot: DateTimeSlot) {
  return `${slot.date}, ${slot.time} ${slot.timezone}`;
}

function isBlocked(newSlot: DateTimeSlot, slots: DateTimeSlot[]) {
  if (!newSlot.date || !newSlot.time || !newSlot.timezone) return false;
  const tz = timezoneMap[newSlot.timezone] || "UTC";
  const current = DateTime.fromFormat(
    `${newSlot.date} ${newSlot.time}`,
    "yyyy-MM-dd HH:mm", 
    { zone: tz }   
  );
  return slots.some((slot) => {
    const slotTz = timezoneMap[slot.timezone] || "UTC";
    const slotDate = DateTime.fromFormat(
      `${slot.date} ${slot.time}`,
      "yyyy-MM-dd HH:mm",
      { zone: slotTz }
    );
    if (!slotDate.isValid || !current.isValid) return false;
    const bufferStart = slotDate.minus({ minutes: 30 });
    const bufferEnd = slotDate.plus({ minutes: 30 });
    return current >= bufferStart && current <= bufferEnd;
  });
}

interface EngagementFormProps {
  onClose: () => void;
}

export default function EngagementForm({ onClose }: EngagementFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<
    Omit<
      EngagementFormData,
      "primaryDateTime" | "secondaryDateTime" | "tertiaryDateTime"
    > & { dateTime: DateTimeSlot[] }
  >({
    engagementOwner: "",
    speaker: "",
    caterer: "",
    cohost: "",
    dateTime: [],
  });

  const [slotPicker, setSlotPicker] = useState<DateTimeSlot>({
    id: "",
    date: "",
    time: "",
    timezone: "ET",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const [nextId, setNextId] = useState<number>(1);
  useEffect(() => {
    axios.get("http://localhost:3000/engagements").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createEngagement = useMutation({
    mutationFn: async (newEngagement: EngagementFormData) => {
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

  function validateStepOne(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.engagementOwner.trim())
      newErrors.engagementOwner = "Engagement Owner is required";
    if (!form.speaker.trim()) newErrors.speaker = "Speaker is required";
    if (!form.caterer.trim()) newErrors.caterer = "Caterer is required";
    if (!form.cohost.trim()) newErrors.cohost = "Cohost is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStepOne()) setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  function handleTextChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSlotFieldChange(field: keyof DateTimeSlot, value: string) {
    setSlotPicker((prev) => ({ ...prev, [field]: value }));
    if (errors["slotPicker"])
      setErrors((prev) => ({ ...prev, slotPicker: "" }));
  }

  function handleAddSlot() {
    const slotToAdd = { ...slotPicker, id: crypto.randomUUID() };
    if (!slotToAdd.date || !slotToAdd.time || !slotToAdd.timezone) {
      setErrors((prev) => ({
        ...prev,
        slotPicker: "Please fill date, time, and timezone",
      }));
      return;
    }
    if (form.dateTime.length >= 3) {
      setErrors((prev) => ({ ...prev, dateTime: "Maximum 3 slots allowed" }));
      return;
    }
    if (isBlocked(slotToAdd, form.dateTime)) {
      setErrors((prev) => ({
        ...prev,
        slotPicker: "This slot overlaps with an existing slot",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      dateTime: [...prev.dateTime, slotToAdd],
    }));
    setSlotPicker({ id:"", date: "", time: "", timezone: "ET" });
    setErrors((prev) => ({ ...prev, slotPicker: "" }));
  }

  function handleDeleteSlot(slotId: string) {
    setForm((prev) => ({
      ...prev,
      dateTime: prev.dateTime.filter((slot) => slot.id !== slotId),
    }));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.engagementOwner.trim())
      newErrors.engagementOwner = "Engagement Owner is required";
    if (!form.speaker.trim()) newErrors.speaker = "Speaker is required";
    if (!form.caterer.trim()) newErrors.caterer = "Caterer is required";
    if (!form.cohost.trim()) newErrors.cohost = "Cohost is required";
    if (!form.dateTime[0])
      newErrors.dateTime = "At least one date & time slot is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    createEngagement.mutate({
      engagementOwner: form.engagementOwner,
      speaker: form.speaker,
      caterer: form.caterer,
      cohost: form.cohost,
      primaryDateTime: form.dateTime[0],
      secondaryDateTime: form.dateTime[1] ?? "-",
      tertiaryDateTime: form.dateTime[2] ?? "-",
    });
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
            step === 1 ? "bg-blue-600" : "bg-blue-300"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm ${
            step === 1 ? "text-blue-700 font-medium" : "text-gray-600"
          }`}
        >
          Details
        </span>
        <span className="text-gray-400">→</span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
            step === 2 ? "bg-blue-600" : "bg-blue-300"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            step === 2 ? "text-blue-700 font-medium" : "text-gray-600"
          }`}
        >
          Date & Time
        </span>
      </div>

      {step === 1 && (
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
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Date and Time Selection
          </h3>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3 border border-gray-200 rounded-lg p-4 bg-blue-50">
              <DateTimePicker
                value={slotPicker.date && slotPicker.time ? slotPicker : null}
                onChange={(slot) => {
                  if (slot) setSlotPicker(slot);
                }}
                label="Pick Date & Time"
                required={true}
                disabledSlots={form.dateTime}
              />
            
              <button
                type="button"
                onClick={handleAddSlot}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={
                  !slotPicker.date ||
                  !slotPicker.time ||
                  !slotPicker.timezone ||
                  form.dateTime.length >= 3
                }
              >
                Add Slot
              </button>
              {errors.slotPicker && (
                <p className="text-red-500 text-sm mt-1">{errors.slotPicker}</p>
              )}
            </div>
            <div className="md:w-1/3 border border-gray-300 rounded-lg p-4 h-auto bg-white">
              <div className="font-semibold mb-2">Selected Slots:</div>
              {form.dateTime.length === 0 && (
                <p className="text-sm text-gray-500">No slots selected yet.</p>
              )}
              {form.dateTime.map((slot, id) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between border rounded py-2 px-3 mb-2 bg-blue-50"
                >
                  <div>
                    <div className="font-bold text-xs">
                      {["Primary", "Secondary", "Tertiary"][id]} Date & Time
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatSlot(slot)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-red-500 text-xs ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {form.dateTime.length < 3 && (
                <button
                  type="button"
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded font-semibold"
                  onClick={() => {}}
                  disabled={form.dateTime.length >= 3}
                >
                  + Select Alternate Date & Time
                </button>
              )}
              {errors.dateTime && (
                <p className="text-red-500 text-xs mt-1">{errors.dateTime}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        {step === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={createEngagement.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createEngagement.isPending ? "Creating..." : "Create Engagement"}
          </button>
        )}
      </div>
    </form>
  );
}
