import { MedicalHistoryEventClientModel } from "@/types/client-models";
import { useLocale, useTranslations } from "next-intl";

interface EventListItemFooterProps {
  event: MedicalHistoryEventClientModel;
}

export function EventListItemFooter({ event }: EventListItemFooterProps) {
  const locale = useLocale();
  const tCommon = useTranslations("Common");

  const formatTimestamp = (date: string) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
  };
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {event.created_at && (
          <p>
            {tCommon("createdAt")}: {formatTimestamp(event.created_at)}
          </p>
        )}
        {event.updated_at && (
          <p>
            {tCommon("updatedAt")}: {formatTimestamp(event.updated_at)}
          </p>
        )}
      </div>
    </div>
  );
}
