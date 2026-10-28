/*
  Calendar entries for an accepted booking, for Tshedza's own calendar:
    googleCalendarUrl(b)  an "Add to Google Calendar" link with the shoot filled in
    icsFor(b, id)         a calendar file (.ics) with alerts 1 week and 2 days before the shoot
  Google's link cannot carry alerts (Google does not allow it), so the alerts live in the .ics file.
  Times are Johannesburg time (UTC+2, no daylight saving). Without a start time the shoot is an all-day entry.
*/

import { serviceName, niceDate } from "./booking.js";

const ALERTS = ["P7D", "P2D"]; // 1 week and 2 days before the start
const TZ_OFFSET_HOURS = 2;

/* Hours of coverage from the booking form ("3 hours", "1 to 2 hours", "Under 1 hour", "Not sure yet") */
function hoursOf(text) {
  const nums = String(text || "").match(/\d+/g);
  if (/under/i.test(text)) return 1;
  if (/more than/i.test(text) && nums) return Number(nums[0]) + 1;
  return nums ? Number(nums[nums.length - 1]) : 2;
}

const pad = n => String(n).padStart(2, "0");
const utcStamp = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
const dayStamp = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());

/* {allDay, start, end} as Dates (UTC) */
function times(b) {
  const [y, m, d] = b.date.split("-").map(Number);
  if (/^\d{2}:\d{2}$/.test(b.time || "")) {
    const [h, min] = b.time.split(":").map(Number);
    const start = new Date(Date.UTC(y, m - 1, d, h - TZ_OFFSET_HOURS, min));
    return { allDay: false, start, end: new Date(start.getTime() + hoursOf(b.hours) * 3600e3) };
  }
  const start = new Date(Date.UTC(y, m - 1, d));
  return { allDay: true, start, end: new Date(start.getTime() + 86400e3) };
}

const title = b => "Infint shoot: " + serviceName(b.service) + ", " + b.name;

function details(b) {
  const info = [
    "Client: " + b.name,
    "Phone: " + b.phone,
    "Email: " + b.email,
    b.pkg && "Package: " + b.pkg,
    b.hours && "Coverage: " + b.hours,
    b.handle && "Handle: " + b.handle,
    b.notes && "Notes: " + b.notes
  ].filter(Boolean);
  return [...info, "", "Booked through infint.co.za for " + niceDate(b) + "."].join("\n");
}

export function googleCalendarUrl(b) {
  const t = times(b);
  const dates = t.allDay ? dayStamp(t.start) + "/" + dayStamp(t.end) : utcStamp(t.start) + "/" + utcStamp(t.end);
  const q = new URLSearchParams({ action: "TEMPLATE", text: title(b), dates, details: details(b), location: b.location || "", ctz: "Africa/Johannesburg" });
  return "https://calendar.google.com/calendar/render?" + q.toString();
}

/* Text values in .ics escape backslashes, semicolons, commas and line breaks */
const icsText = s => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/* Lines longer than 75 bytes are folded: the rest continues on the next line after a space */
function fold(line) {
  const enc = new TextEncoder(), out = [];
  let cur = "", bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function icsFor(b, id) {
  const t = times(b);
  const when = t.allDay
    ? ["DTSTART;VALUE=DATE:" + dayStamp(t.start), "DTEND;VALUE=DATE:" + dayStamp(t.end)]
    : ["DTSTART:" + utcStamp(t.start), "DTEND:" + utcStamp(t.end)];
  const alarms = ALERTS.flatMap(p => [
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText(title(b)), "TRIGGER:-" + p, "END:VALARM"
  ]);
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Infint//Bookings//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:booking-" + id + "@infint.co.za",
    "DTSTAMP:" + utcStamp(new Date()),
    ...when,
    "SUMMARY:" + icsText(title(b)),
    "LOCATION:" + icsText(b.location),
    "DESCRIPTION:" + icsText(details(b)),
    ...alarms,
    "END:VEVENT", "END:VCALENDAR"
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export const icsFileName = b => "infint-shoot-" + b.date + ".ics";
