import { Table, z } from "@botpress/runtime";

export const AppointmentsTable = new Table({
  name: "appointmentsTable",
  description: "Stores patient appointment bookings at City Health Clinic",
  columns: {
    patientName: {
      schema: z.string().describe("Full name of the patient"),
      searchable: true,
    },
    phone: {
      schema: z.string().describe("Patient phone number"),
    },
    email: {
      schema: z.string().describe("Patient email address"),
    },
    service: {
      schema: z.string().describe("Medical service being booked"),
      searchable: true,
    },
    doctorName: {
      schema: z.string().describe("Name of the doctor for the appointment"),
      searchable: true,
    },
    appointmentDate: {
      schema: z.string().describe("Date of appointment in YYYY-MM-DD format"),
      searchable: true,
    },
    appointmentTime: {
      schema: z.string().describe("Time slot of appointment (e.g. 09:00 AM)"),
    },
    reason: {
      schema: z
        .string()
        .describe(
          "Reason for the visit (e.g. annual checkup, toothache, skin rash)",
        ),
    },
    status: {
      schema: z
        .string()
        .describe("Booking status: booked, cancelled, or completed"),
    },
    notes: {
      schema: z
        .string()
        .describe("Additional notes from the patient")
        .optional(),
    },
  },
});
