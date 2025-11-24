"use client";

import PatientSearchBar from "./patient-search-bar";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";

export default function PatientTableActionBar() {
  const t = useTranslations("Patient");
  return (
    <div className="flex gap-4 md:items-center justify-between w-full">
      <div className="hidden xl:flex flex-col xl:flex-row gap-2 xl:gap-4 items-center w-full">
        <span>
          <Search className="w-6 h-6" />
        </span>
        <PatientSearchBar />
      </div>
      <div className="xl:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span>
                <Search className="w-8 h-8 mr-1" />
              </span>
              {t("searchPatients")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[80vw] p-4">
            <div className="flex flex-col gap-4">
              <PatientSearchBar />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Link href="/dashboard/patients/new">
        <Button className="md:h-9" variant={"default"}>
          <span className="hidden lg:inline">{t("newPatient")}</span>
          <Plus />
        </Button>
      </Link>
    </div>
  );
}
