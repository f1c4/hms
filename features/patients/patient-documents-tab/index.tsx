import { IdentityDocumentsSection } from "./components/identity-documents/section";
import { InsurancesSection } from "./components/isurance/section";

export default function PatientDocumentsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <IdentityDocumentsSection />
      <InsurancesSection />
    </div>
  );
}
