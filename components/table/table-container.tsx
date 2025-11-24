import { ScrollArea } from "../ui/scroll-area";

interface TableContainerProps {
  children: React.ReactNode;
}

export default function TableContainer({ children }: TableContainerProps) {
  return (
    <div className="relative flex flex-1">
      <div className="absolute bottom-0 left-0 right-0 top-0 flex overflow-hidden rounded-md border md:overflow-auto">
        <ScrollArea className="flex-1">{children}</ScrollArea>
      </div>
    </div>
  );
}
