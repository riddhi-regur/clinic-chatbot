//Purpose: Finds and cancels an appointment by patient name and date.
import { Autonomous, z } from "@botpress/runtime";
import { AppointmentsTable } from "../tables";

export const cancelAppointment = new Autonomous.Tool({
  name: "cancelAppointment",
  description:
    "Cancel an existing patient appointment at City Health Clinic. Requires patient name and appointment date to find the booking.",
  input: z.object({
    patientName: z.string().describe("Full name of the patient"),
    appointmentDate: z
      .string()
      .describe("Appointment date in YYYY-MM-DD format"),
  }),
  output: z.object({
    success: z.boolean(),
    message: z.string(),
    cancelledAppointment: z
      .object({
        doctorName: z.string(),
        time: z.string(),
        service: z.string(),
      })
      .optional(),
  }),
  handler: async ({ patientName, appointmentDate }) => {
    const { rows } = await AppointmentsTable.findRows({
      filter: { patientName, appointmentDate, status: "booked" },
      limit: 5,
    });

    if (rows.length === 0) {
      return {
        success: false,
        message: `No active appointment found for ${patientName} on ${appointmentDate}.`,
      };
    }

    const appointment = rows[0];

    await AppointmentsTable.updateRows({
      rows: [{ id: appointment.id, status: "cancelled" }],
    });

    return {
      success: true,
      message: `Appointment for ${patientName} with ${appointment.doctorName} on ${appointmentDate} at ${appointment.appointmentTime} has been cancelled.`,
      cancelledAppointment: {
        doctorName: appointment.doctorName,
        time: appointment.appointmentTime,
        service: appointment.service,
      },
    };
  },
});
// Key behaviors:
// Requires patient name + date to locate the booking
// Looks for active bookings with status: "booked"
// Updates status to "cancelled" (soft delete — preserves history)
// Returns confirmation or clear "not found" message
