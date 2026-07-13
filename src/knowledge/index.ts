import { Knowledge, DataSource } from "@botpress/runtime";

const clinicDataPath = "./src/knowledge";

export const ClinicServices = new Knowledge({
  name: "clinic-services",
  description:
    "Medical services offered at City Health Clinic, including doctors and descriptions",
  sources: [
    DataSource.Directory.fromPath(clinicDataPath, {
      filter: (filePath) => filePath.endsWith("services.md"),
    }),
  ],
});

export const ClinicTreatments = new Knowledge({
  name: "clinic-treatments",
  description:
    "Treatment categories and medical procedures available at City Health Clinic",
  sources: [
    DataSource.Directory.fromPath(clinicDataPath, {
      filter: (filePath) => filePath.endsWith("treatments.md"),
    }),
  ],
});

export const ClinicFAQ = new Knowledge({
  name: "clinic-faq",
  description:
    "Frequently asked questions about clinic hours, insurance, parking, and policies",
  sources: [
    DataSource.Directory.fromPath(clinicDataPath, {
      filter: (filePath) => filePath.endsWith("faq.md"),
    }),
  ],
});
