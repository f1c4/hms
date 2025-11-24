import PatientClient from "@/features/patients/shared/components/patient-client";
import { getPatientData } from "@/features/patients/shared/actions/patient-actions";
import {
  FullPatientDataModel,
  MedicalHistoryEventModel,
} from "@/types/data-models";
import { getPatientMedicalHistory } from "@/features/patients/patient-medical-history-tab/actions/event-actions";

export const metadata = {
  title: "Vranes HMS",
  description: "Hospital Management System for Vranes Hospital",
};

export default async function Page({
  params,
}: {
  params: Promise<{ patient: string }>;
}) {
  const slug = (await params).patient;
  const isNew = slug === "new";

  let patientId: number | null = null;
  if (!isNew) {
    const parsed = Number(slug);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return <div>Invalid patient ID</div>;
    }
    patientId = parsed;
  }

  let initialData: FullPatientDataModel | null = null;
  let medicalHistoryData: MedicalHistoryEventModel[] = [];

  if (patientId !== null) {
    const [core, history] = await Promise.all([
      getPatientData(patientId),
      getPatientMedicalHistory(patientId),
    ]);
    initialData = core;
    medicalHistoryData = history ?? [];
  }

  return (
    <PatientClient
      patientId={patientId} // null for new patient
      initialData={initialData} // null for new patient
      medicalHistoryData={medicalHistoryData} // [] for new patient
    />
  );
}
