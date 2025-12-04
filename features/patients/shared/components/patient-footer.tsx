import { useFormatDate } from "@/hooks/use-format-date";
import { useTranslations } from "next-intl";

export function PatientFooter({
  createdAt,
  updatedAt,
}: {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}) {
  const formatDate = useFormatDate();
  const tCommon = useTranslations("Common");
  if (!createdAt && !updatedAt) {
    return null;
  }
  return (
    <div className="flex flex-col w-full gap-1">
      {createdAt && (
        <span>
          {tCommon("createdAt")} : {formatDate(createdAt, "PPPp")}
        </span>
      )}
      {updatedAt && (
        <span>
          {tCommon("updatedAt")} : {formatDate(updatedAt, "PPPp")}
        </span>
      )}
    </div>
  );
}
