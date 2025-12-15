"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

export type CompanyTypeValue =
    | "company"
    | "government"
    | "ngo"
    | "educational"
    | "healthcare"
    | "other";

export interface CompanyTypeOption {
    value: CompanyTypeValue;
    label: string;
}

/**
 * A custom hook that returns memoized company type options with translated labels.
 * Also provides a helper function to get a label by value.
 */
export function useCompanyTypes() {
    const t = useTranslations("Companies.Types");

    const options = useMemo((): CompanyTypeOption[] => {
        return [
            { value: "company", label: t("company") },
            { value: "government", label: t("government") },
            { value: "ngo", label: t("ngo") },
            { value: "educational", label: t("educational") },
            { value: "healthcare", label: t("healthcare") },
            { value: "other", label: t("other") },
        ];
    }, [t]);

    const getLabel = (value: string | null | undefined): string => {
        if (!value) return "";
        const option = options.find((opt) => opt.value === value);
        return option?.label ?? value;
    };

    return { options, getLabel };
}
