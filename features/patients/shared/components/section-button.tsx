import { Button } from "@/components/ui/button";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface SectionButtonProps {
  isEditing: boolean;
  isCreating: boolean;
  hasData: boolean;
  onEdit: () => void;
  onCreate: () => void;
}
export function SectionButton({
  isEditing,
  isCreating,
  hasData,
  onEdit,
  onCreate,
}: SectionButtonProps) {
  const tCommon = useTranslations("Common.Buttons");
  if (isEditing || isCreating) {
    return null;
  }

  return hasData ? (
    <Button variant="outline" size="sm" onClick={onEdit}>
      <PencilIcon className="h-4 w-4" />
      {tCommon("editButton")}
    </Button>
  ) : (
    <Button variant="outline" size="sm" onClick={onCreate}>
      <PlusIcon className="h-4 w-4" />
      {tCommon("addButton")}
    </Button>
  );
}
