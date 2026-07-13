//Purpose: Checks which time slots are available for a given date (and optionally a specific doctor). Clinic hours: Mon-Fri 8AM-8PM, Sat 9AM-5PM, Sun 10AM-2PM.
import { Autonomous, z } from "@botpress/runtime";
import { AppointmentsTable } from "../tables";

const CLINIC_HOURS: Record<string, { open: number; close: number }> = {
  1: { open: 8, close: 20 }, // Mon
  2: { open: 8, close: 20 }, // Tue
  3: { open: 8, close: 20 }, // Wed
  4: { open: 8, close: 20 }, // Thu
  5: { open: 8, close: 20 }, // Fri
  6: { open: 9, close: 17 }, // Sat
  0: { open: 10, close: 14 }, // Sun
};

function generateTimeSlots(openHour: number, closeHour: number): string[] {
  const slots: string[] = [];
  for (let h = openHour; h < closeHour; h++) {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${hour12.toString().padStart(2, "0")}:00 ${ampm}`);
    if (h + 0.5 < closeHour) {
      slots.push(`${hour12.toString().padStart(2, "0")}:30 ${ampm}`);
    }
  }
  return slots;
}

export const checkAvailability = new Autonomous.Tool({
  name: "checkAvailability",
  description:
    "Check available appointment slots for a given date at City Health Clinic. Optionally filter by a specific doctor.",
  input: z.object({
    date: z.string().describe("Date to check in YYYY-MM-DD format"),
    doctorName: z
      .string()
      .optional()
      .describe("Filter by specific doctor name"),
  }),
  output: z.object({
    date: z.string(),
    doctorFilter: z.string().optional(),
    availableSlots: z.array(z.string()),
    bookedSlots: z.array(z.string()),
    message: z.string(),
  }),
  handler: async ({ date, doctorName }) => {
    // 1. Determine clinic hours for this date
    const dateObj = new Date(date + "T12:00:00");
    const dayOfWeek = dateObj.getDay();
    const hours = CLINIC_HOURS[dayOfWeek];

    if (!hours) {
      return {
        date,
        doctorFilter: doctorName,
        availableSlots: [],
        bookedSlots: [],
        message: "Clinic is closed on this date.",
      };
    }

    // 2. Generate all possible time slots
    const allSlots = generateTimeSlots(hours.open, hours.close);

    // 3. Query booked slots from table
    const filter: Record<string, string> = {
      appointmentDate: date,
      status: "booked",
    };
    if (doctorName) filter.doctorName = doctorName;

    const { rows: booked } = await AppointmentsTable.findRows({
      filter,
      limit: 100,
    });

    const bookedTimes = new Set(booked.map((r) => r.appointmentTime));
    const available = allSlots.filter((s) => !bookedTimes.has(s));

    return {
      date,
      doctorFilter: doctorName,
      availableSlots: available,
      bookedSlots: [...bookedTimes],
      message: doctorName
        ? `${available.length} slots available on ${date} with ${doctorName}.`
        : `${available.length} slots available on ${date}.`,
    };
  },
});
// Key behaviors:
// Generates 30-minute time slots based on clinic hours for the day of week
// Queries existing bookings from AppointmentsTable
// Filters out already-booked slots
// Optionally filters by specific doctor
// Returns both available and booked slots so the AI can present options
