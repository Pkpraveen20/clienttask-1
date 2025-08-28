import { DateTime } from "luxon";
import { DateTimeSlot } from "../modules/enagementSetting/engagement/engagementType";

const timezoneMap: Record<string, string> = {
  ET: "America/New_York",
  CT: "America/Chicago",
  PT: "America/Los_Angeles",
  UTC: "UTC",
};

export default function IsBlocked(
  newSlot: DateTimeSlot,
  slots: DateTimeSlot[]
): boolean {
  if (!newSlot.date || !newSlot.time || !newSlot.timezone) return false;

  const tz = timezoneMap[newSlot.timezone] || "UTC";
  const current = DateTime.fromFormat(
    `${newSlot.date} ${newSlot.time}`,
    "yyyy-MM-dd HH:mm",
    { zone: tz }
  );

  return slots.some((slot) => {
    if (!slot.date || !slot.time || !slot.timezone) return false;

    const slotTz = timezoneMap[slot.timezone] || "UTC";
    const slotDate = DateTime.fromFormat(
      `${slot.date} ${slot.time}`,
      "yyyy-MM-dd HH:mm",
      { zone: slotTz }
    );

    if (!slotDate.isValid || !current.isValid) return false;

    const bufferStart = slotDate.minus({ minutes: 15 });
    const bufferEnd = slotDate.plus({ minutes: 15 });

    return current >= bufferStart && current <= bufferEnd;
  });
}
