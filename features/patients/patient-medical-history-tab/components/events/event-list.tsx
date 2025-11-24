import { Accordion } from "@/components/ui/accordion";

import {
  MedicalHistoryDocumentClientModel,
  MedicalHistoryEventClientModel,
} from "@/types/client-models";
import { EventListItem } from "./event-list-item";

interface PatientMedicalEventsListProps {
  data: MedicalHistoryEventClientModel[];
  isFormOpen: boolean;
  onEdit: (eventId: number) => void;
  onAddDocument: (eventId: number) => void;
  onEditDocument: (document: MedicalHistoryDocumentClientModel) => void;
  expandedValues: string[];
  onExpandedChange: (values: string[]) => void;
}

export function PatientMedicalEventsList({
  data,
  isFormOpen,
  onEdit,
  onAddDocument,
  onEditDocument,
  expandedValues,
  onExpandedChange,
}: PatientMedicalEventsListProps) {
  return (
    <Accordion
      type="multiple"
      value={expandedValues}
      onValueChange={onExpandedChange}
    >
      {data.map((event) => (
        <EventListItem
          key={event.id}
          event={event}
          isFormOpen={isFormOpen}
          onEdit={onEdit}
          onAddDocument={onAddDocument}
          onEditDocument={onEditDocument}
        />
      ))}
    </Accordion>
  );
}
