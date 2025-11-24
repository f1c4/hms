"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";

import { useMainStore } from "@/store/main-store";
import {
    PatientRiskFormInput,
    PatientRiskFormSchema,
} from "../schemas/schemas";
import { createNewPatientData } from "../../store/create-new-patient-data";
import { snakeToCamel } from "@/utils/utils";

export function useRiskInfoForm() {
    const tValidation = useTranslations("Patient.RisksValidation");

    const { pristineData, sectionState, setSectionState } = useMainStore(
        useShallow((state) => ({
            pristineData: state.patient.pristineData,
            sectionState: state.patient.uiState.risk.info,
            setSectionState: state.patient.actions.setSectionState,
        })),
    );

    const defaultValues = useMemo((): Partial<PatientRiskFormInput> => {
        const riskData = pristineData?.risk ?? createNewPatientData().risk;
        return snakeToCamel(riskData ?? {});
    }, [pristineData?.risk]);

    const form = useForm<PatientRiskFormInput>({
        resolver: zodResolver(PatientRiskFormSchema(tValidation)),
        defaultValues,
    });

    const {
        reset,
        formState: { isDirty },
    } = form;

    const { isDirty: isSectionDirty } = sectionState;

    useEffect(() => {
        if (isDirty !== isSectionDirty) {
            setSectionState("risk", "info", { isDirty });
        }
    }, [isDirty, isSectionDirty, setSectionState]);

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    return {
        form,
        defaultValues,
        pristineData,
        sectionState,
        setSectionState,
        tValidation,
    };
}
