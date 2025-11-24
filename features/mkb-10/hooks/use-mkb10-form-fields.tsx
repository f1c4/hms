import { useMemo } from "react";
import { useTranslations } from "next-intl";

export function useMKB10FormFields() {
  const t = useTranslations("Components.MKB10");

  return useMemo(() => {
    return [
      {
        name: "groupName",
        label: t("groupName"),
        placeholder: t("enterGroupName"),
        type: "text",
      },
      {
        name: "code",
        label: t("code"),
        placeholder: t("enterCode"),
        type: "text",
      },
      {
        name: "diagnosisSr",
        label: t("diagnosisSr"),
        placeholder: t("enterDiagnosisSr"),
        type: "text",
      },
      {
        name: "diagnosisLat",
        label: t("diagnosisLat"),
        placeholder: t("enterDiagnosisLat"),
        type: "text",
      },
    ];
  }, [t]);
}
