import { MedicalHistoryEventClientModel } from "@/types/client-models";
import { useTranslations } from "next-intl";
import { useFormatDate } from "@/hooks/use-format-date";

interface EventListItemFooterProps {
  event: MedicalHistoryEventClientModel;
}

export function EventListItemFooter({ event }: EventListItemFooterProps) {
  const tCommon = useTranslations("Common");
  const formatTimestamp = useFormatDate();

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {event.created_at && (
          <p>
            {tCommon("createdAt")}: {formatTimestamp(event.created_at, "PPPp")}
          </p>
        )}
        {event.updated_at && (
          <p>
            {tCommon("updatedAt")}: {formatTimestamp(event.updated_at, "PPPp")}
          </p>
        )}
      </div>
    </div>
  );
}
