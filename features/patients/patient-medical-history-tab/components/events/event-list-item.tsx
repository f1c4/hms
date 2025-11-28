import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  MedicalHistoryDocumentClientModel,
  MedicalHistoryEventClientModel,
} from "@/types/client-models";
import { EventListItemFooter } from "./event-list-item-footer";
import { EventListItemHeader } from "./event-list-item-header";
import { DocumentList } from "../documents/document-list";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";

interface EventListItemProps {
  event: MedicalHistoryEventClientModel;
  isFormOpen: boolean;
  onEdit: (eventId: number) => void;
  onAddDocument: (eventId: number) => void;
  onEditDocument: (document: MedicalHistoryDocumentClientModel) => void;
}

export function EventListItem({
  event,
  isFormOpen,
  onEdit,
  onAddDocument,
  onEditDocument,
}: EventListItemProps) {
  const locale = useLocale();
  const isSourceLocale = event ? event.ai_source_locale === locale : true;
  const tHints = useTranslations("Patient.MedicalHistory.Hints");
  const isEditable = isSourceLocale && !isFormOpen;

  const noteText =
    event?.notes?.[locale] ??
    event?.notes?.["en"] ?? // pick your project fallback
    null;
  return (
    <TooltipProvider>
      <AccordionItem value={`event-${event.id}`} key={event.id}>
        <AccordionTrigger>
          <EventListItemHeader event={event} />
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">
              {noteText && noteText}
            </div>
            <div className="flex justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!isEditable}
                      onClick={() => onEdit(event.id)}
                    >
                      <PencilIcon />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isSourceLocale && (
                  <TooltipContent>{tHints("editSourceOnly")}</TooltipContent>
                )}
              </Tooltip>
              <Button
                variant="destructive"
                size="icon"
                disabled={isFormOpen}
                onClick={() => {
                  // TODO: Implement delete confirmation
                  console.log("Delete event:", event.id);
                }}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
          <Separator orientation="horizontal" />
          <DocumentList
            documents={event.documents}
            eventId={event.id}
            onAdd={onAddDocument}
            onEdit={onEditDocument}
          />
          <Separator orientation="horizontal" />
          <EventListItemFooter event={event} />
        </AccordionContent>
      </AccordionItem>
    </TooltipProvider>
  );
}
