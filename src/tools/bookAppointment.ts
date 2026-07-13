import { Autonomous, z } from "@botpress/runtime";
import { AppointmentsTable } from "../tables";

const VALID_SERVICES: Record<string, string> = {
  "General Checkup": "Dr. Sarah Mitchell",
  "Blood Testing": "Dr. James Wilson",
  "X-Ray Imaging": "Dr. Priya Sharma",
  "Vaccination": "Dr. Michael Chen",
  "Dental Care": "Dr. Emily Rodriguez",
  "Eye Examination": "Dr. David Kim",
  "Dermatology": "Dr. Lisa Patel",
  "Cardiology": "Dr. Robert Thompson",
  "Pediatric Care": "Dr. Anna Kowalski",
  "Physiotherapy": "Dr. Mark Johnson",
  "ENT": "Dr. Nina Gupta",
  "Nutrition Counseling": "Dr. Carlos Mendez",
};

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
      .describe(
        "Medical service — must be one of: General Checkup, Blood Testing, X-Ray Imaging, Vaccination, Dental Care, Eye Examination, Dermatology, Cardiology, Pediatric Care, Physiotherapy, ENT, Nutrition Counseling",
      ),
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
    const expectedDoctor = VALID_SERVICES[service];
    if (!expectedDoctor) {
      return {
        success: false,
        confirmation: `Sorry, "${service}" is not a valid service at City Health Clinic. Available services: ${Object.keys(VALID_SERVICES).join(", ")}.`,
        appointmentId: undefined,
      };
    }

    if (doctorName !== expectedDoctor) {
      return {
        success: false,
        confirmation: `The correct doctor for ${service} is ${expectedDoctor}, not ${doctorName}. Would you like to book with ${expectedDoctor} instead?`,
        appointmentId: undefined,
      };
    }

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
