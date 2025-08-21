import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { enGB } from "date-fns/locale";
import { DateTime } from "luxon";
import {
  DateTimeSlot,
  TIMEZONES,
  TIME_SLOTS,
} from "../modules/engagement/engagementType";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  value: DateTimeSlot | null;
  onChange: (value: DateTimeSlot | null) => void;
  label: string;
  required?: boolean;
  disabledSlots?: DateTimeSlot[];
}

export default function DateTimePicker({
  value,
  onChange,
  label,
  required = false,
  disabledSlots = [],
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");

  useEffect(() => {
    if (value) {
      const newDate = value.date
        ? DateTime.fromISO(value.date, { zone: "local" }).toJSDate()
        : null;

      if (
        newDate?.getTime() !== selectedDate?.getTime() ||
        value.time !== selectedTime ||
        value.timezone !== selectedTimezone
      ) {
        setSelectedDate(newDate);
        setSelectedTime(value.time || "");
        setSelectedTimezone(value.timezone || "");
      }
    } else {
      if (selectedDate || selectedTime || selectedTimezone) {
        setSelectedDate(null);
        setSelectedTime(""); 
        setSelectedTimezone("");
      }
    }
  }, [value]);

  useEffect(() => {
    if (selectedDate && selectedTime && selectedTimezone) {
      const newSlot: DateTimeSlot = {
        date: DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd"),
        time: selectedTime,
        timezone: selectedTimezone,
        id: undefined
      };

      if (
        !value ||
        value.date !== newSlot.date ||
        value.time !== newSlot.time ||
        value.timezone !== newSlot.timezone
      ) {
        onChange(newSlot);
      }
    } else if (value !== null) {
      onChange(null);
    }
  }, [selectedDate, selectedTime, selectedTimezone]);

  const isTimeSlotDisabled = (time: string) => {
    if (!selectedDate || !selectedTimezone) return false;
    const dateStr = DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd");

    return disabledSlots.some(
      (slot) =>
        slot.date === dateStr &&
        slot.time === time &&
        slot.timezone === selectedTimezone
    );
  };

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };


    
  return (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          inline
          calendarClassName="border border-gray-200 rounded-md p-1"
          locale={enGB}
          minDate={new Date()}
        />
      </div>

      <div className="">
        <div className="  mb-3">
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full  px-3 py-2 border rounded-md"
          >
            <option value="">Select Timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {TIME_SLOTS.map((time) => {
            const disabled = isTimeSlotDisabled(time);
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => !disabled && setSelectedTime(time)}
                disabled={disabled}
                className={`px-3 py-2 rounded-md text-sm border ${
                  disabled
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
              >
                {formatTimeForDisplay(time)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

}

