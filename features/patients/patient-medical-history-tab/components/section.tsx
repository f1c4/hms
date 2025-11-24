"use client";

import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Spinner } from "@/components/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventForm } from "./events/event-form";
import { PatientMedicalEventsList } from "./events/event-list";
import { useTranslations } from "next-intl";
import { DocumentForm } from "./documents/document-form";

export default function MedicalHistoryTab() {
  const t = useTranslations("Patient.MedicalHistory");
  const tDocs = useTranslations("Patient.MedicalHistory.Documents");
  const tCommon = useTranslations("Common.Buttons");

  const { medicalHistory, medicalHistoryActions } = useMainStore(
    useShallow((state) => ({
      medicalHistory: state.patient.medicalHistory,
      medicalHistoryActions: state.patient.medicalHistoryActions,
    }))
  );

  const {
    data,
    isLoading,
    isInitialized,
    mode,
    editingEventId,
    docForm,
    expandedEventIds,
  } = medicalHistory;

  const isEventFormOpen = mode === "create" || mode === "edit";
  const editingEvent =
    mode === "edit" ? data?.find((e) => e.id === editingEventId) ?? null : null;

  const editingDocument =
    docForm.mode === "edit" && docForm.parentEventId
      ? data
          ?.find((e) => e.id === docForm.parentEventId)
          ?.documents.find((d) => d.id === docForm.editingDocumentId) ?? null
      : null;

  const expandedValues = expandedEventIds.map((id) => `event-${id}`);

  const handleAccordionChange = (values: string[]) => {
    // values are like ["event-12", "event-15"]
    const ids = values
      .map((v) => parseInt(v.replace("event-", ""), 10))
      .filter(Number.isFinite);
    medicalHistoryActions.setExpandedEvents(ids);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={() => medicalHistoryActions.setMode("create")}
            disabled={isEventFormOpen || docForm.isOpen}
          >
            <PlusIcon className="h-4 w-4" />
            {tCommon("addButton")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && <Spinner />}
        {isInitialized && !data?.length && mode === "view" && (
          <Alert variant="default">
            <AlertDescription className="px-3 py-2 text-sm">
              {t("noEventsFound")}
            </AlertDescription>
          </Alert>
        )}
        {data && data.length > 0 && (
          <PatientMedicalEventsList
            data={data}
            isFormOpen={isEventFormOpen || docForm.isOpen}
            onEdit={(eventId: number) =>
              medicalHistoryActions.setMode("edit", eventId)
            }
            onAddDocument={(eventId: number) =>
              medicalHistoryActions.openDocumentForm("create", eventId)
            }
            onEditDocument={(doc) =>
              medicalHistoryActions.openDocumentForm(
                "edit",
                doc.event_id,
                doc.id
              )
            }
            expandedValues={expandedValues}
            onExpandedChange={handleAccordionChange}
          />
        )}
      </CardContent>

      {/* --- DIALOG FOR EVENT FORM --- */}
      <Dialog
        open={isEventFormOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            medicalHistoryActions.closeForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? t("editEventTitle") : t("addEventTitle")}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <EventForm
            onClose={medicalHistoryActions.closeForm}
            initialData={editingEvent}
          />
        </DialogContent>
      </Dialog>

      {/* --- DIALOG FOR DOCUMENT FORM --- */}
      <Dialog
        open={docForm.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            medicalHistoryActions.closeDocumentForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {docForm.mode === "edit"
                ? tDocs("editDocumentTitle")
                : tDocs("addDocumentTitle")}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {docForm.parentEventId && (
            <DocumentForm
              onClose={medicalHistoryActions.closeDocumentForm}
              initialData={editingDocument}
              parentEventId={docForm.parentEventId}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
