import { Badge } from "@/components/ui/badge";
import { MedicalHistoryEventClientModel } from "@/types/client-models";
import { useLocale, useTranslations } from "next-intl";
import { useFormatDate } from "@/hooks/use-format-date";

interface EventListItemHeaderProps {
  event: MedicalHistoryEventClientModel;
}

export function EventListItemHeader({ event }: EventListItemHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("Patient.MedicalHistory");
  const formatDate = useFormatDate();

  return (
    <div className="flex flex-col md:flex-row justify-between w-full">
      <div className="font-semibold flex gap-2 flex-wrap">
        {event.title?.[locale] ?? t("untitled")}
        {event.diagnoses && event.diagnoses.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.diagnoses.map((diag) => (
              <div
                className="flex items-center gap-1"
                key={diag.diagnosis_code}
              >
                <Badge variant="outline">{diag.diagnosis_code}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="text-muted-foreground text-sm">
        {formatDate(event.event_date, "PPP")}
      </span>
    </div>
  );
}
