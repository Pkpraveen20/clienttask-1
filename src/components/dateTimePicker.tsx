import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { DateTime } from 'luxon';
import { DateTimeSlot, TIMEZONES, TIME_SLOTS } from '../modules/engagement/engagementType';
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  value: DateTimeSlot | null;
  onChange: (value: DateTimeSlot | null) => void;
  label: string;
  required?: boolean;
  disabledSlots?: DateTimeSlot[];
  onSlotChange?: (slot: DateTimeSlot | null) => void;
}

export default function DateTimePicker({
  value,
  onChange,
  label,
  required = false,
  disabledSlots = [],
  onSlotChange
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value?.date ? new Date(value.date) : null
  );
  const [selectedTime, setSelectedTime] = useState<string>(value?.time || '');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(value?.timezone || 'ET');

  const isTimeSlotDisabled = (time: string) => {
    if (!selectedDate) return false;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const isExactMatch = disabledSlots.some(slot => 
      slot.date === dateStr && slot.time === time && slot.timezone === selectedTimezone
    );
    
    if (isExactMatch) return true;
    
    const currentTime = DateTime.fromFormat(time, 'HH:mm');
    return disabledSlots.some(slot => {
      if (slot.date !== dateStr || slot.timezone !== selectedTimezone) return false;
      
      const slotTime = DateTime.fromFormat(slot.time, 'HH:mm');
      const diff = Math.abs(currentTime.diff(slotTime, 'minutes').minutes);
      return diff <= 30;
    });
  };

  useEffect(() => {
    if (selectedDate && selectedTime && selectedTimezone) {
      const newSlot: DateTimeSlot = {
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        timezone: selectedTimezone
      };
      onChange(newSlot);
      onSlotChange?.(newSlot);
    } else {
      onChange(null);
      onSlotChange?.(null);
    }
  }, [selectedDate, selectedTime, selectedTimezone, onChange, onSlotChange]);

  useEffect(() => {
    if (value) {
      setSelectedDate(value.date ? new Date(value.date) : null);
      setSelectedTime(value.time || '');
      setSelectedTimezone(value.timezone || 'ET');
    } else {
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedTimezone('ET');
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimezone(e.target.value);
  };

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minDate={new Date()}
          />
        </div>

        <div>
          <select
            value={selectedTime}
            onChange={handleTimeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedDate}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map((time) => (
              <option
                key={time}
                value={time}
                disabled={isTimeSlotDisabled(time)}
              >
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedTimezone}
            onChange={handleTimezoneChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Selected: {selectedDate?.toLocaleDateString()} at {formatTimeForDisplay(selectedTime)} {selectedTimezone}
          </p>
        </div>
      )}
    </div>
  );
}
