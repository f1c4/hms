DROP TRIGGER IF EXISTS on_patient_general_update ON public.patient_general;
CREATE TRIGGER on_patient_general_update
  BEFORE UPDATE ON public.patient_general
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_med_data_update ON public.patient_med_data;
CREATE TRIGGER on_patient_med_data_update
  BEFORE UPDATE ON public.patient_med_data
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_id_documents_update ON public.patient_id_documents;
CREATE TRIGGER on_patient_id_documents_update
  BEFORE UPDATE ON public.patient_id_documents
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_notes_update ON public.patient_notes;
CREATE TRIGGER on_patient_notes_update
  BEFORE UPDATE ON public.patient_notes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_personal_update ON public.patient_personal;
CREATE TRIGGER on_patient_personal_update
  BEFORE UPDATE ON public.patient_personal
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_risk_update ON public.patient_risk;
CREATE TRIGGER on_patient_risk_update
  BEFORE UPDATE ON public.patient_risk
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_document_types_update ON public.document_types;
CREATE TRIGGER on_document_types_update
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_insurance_providers_updated_at
BEFORE UPDATE ON public.insurance_providers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_insurance_plans_updated_at
BEFORE UPDATE ON public.insurance_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_patient_insurances_updated_at
BEFORE UPDATE ON public.patient_insurances
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();