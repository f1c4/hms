import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Copy cell component with hover functionality
export default function CopyCell({
  children,
  value,
  className = "",
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Common");
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(t("copyError"), err);
    }
  };

  return (
    <div className="group relative flex items-center">
      {children}
      <button
        onClick={handleCopy}
        className={cn(
          "absolute -right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800",
          className
        )}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500" />
        )}
      </button>
    </div>
  );
}
