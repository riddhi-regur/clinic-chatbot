//Purpose: AI-callable tool that books an appointment after collecting all required details.
import { Autonomous, z } from "@botpress/runtime";
import { AppointmentsTable } from "../tables";

export const bookAppointment = new Autonomous.Tool({
  name: "bookAppointment",
  description:
    "Book a patient appointment at City Health Clinic. Call this after collecting all required fields from the patient.",
  input: z.object({
    patientName: z.string().describe("Full name of the patient"),
    phone: z.string().describe("Patient phone number"),
    email: z.string().describe("Patient email address"),
    service: z
      .string()
      .describe("Medical service (e.g. Dental Care, Cardiology)"),
    doctorName: z
      .string()
      .describe("Doctor's full name (e.g. Dr. Emily Rodriguez)"),
    appointmentDate: z.string().describe("Date in YYYY-MM-DD format"),
    appointmentTime: z.string().describe("Time slot (e.g. 09:00 AM)"),
    reason: z.string().describe("Reason for the visit"),
    notes: z.string().optional().describe("Any additional notes"),
  }),
  output: z.object({
    success: z.boolean(),
    confirmation: z.string(),
    appointmentId: z.number().optional(),
  }),
  handler: async ({
    patientName,
    phone,
    email,
    service,
    doctorName,
    appointmentDate,
    appointmentTime,
    reason,
    notes,
  }) => {
    const { rows } = await AppointmentsTable.createRows({
      rows: [
        {
          patientName,
          phone,
          email,
          service,
          doctorName,
          appointmentDate,
          appointmentTime,
          reason,
          status: "booked",
          notes: notes ?? "",
        },
      ],
    });

    return {
      success: true,
      confirmation: `Appointment confirmed for ${patientName} with ${doctorName} on ${appointmentDate} at ${appointmentTime}. Service: ${service}. Reason: ${reason}.`,
      appointmentId: rows[0]?.id,
    };
  },
});
// Key behaviors:
// All fields except notes are required — AI must collect them before calling
// Returns a human-readable confirmation string the AI can relay to the patient
// Sets status: "booked" on creation
