import { Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DisabledSectionPlaceholderProps {
  message: string;
  title?: string;
}

export function DisabledSectionPlaceholder({
  message,
  title,
}: DisabledSectionPlaceholderProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
      <Alert variant="default" className="max-w-md">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">
          {title || "Section Disabled"}
        </AlertTitle>
        <AlertDescription className="text-sm">{message}</AlertDescription>
      </Alert>
    </div>
  );
}
