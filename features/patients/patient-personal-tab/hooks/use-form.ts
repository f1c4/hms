"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";

import { useMainStore } from "@/store/main-store";
import {
    PatientPersonalFormSchema,
    PatientPersonalFormType,
} from "../schemas/schemas";
import { snakeToCamel } from "@/utils/utils";
import { createNewPatientData } from "../../store/create-new-patient-data";

export function usePersonalInfoForm() {
    const tValidation = useTranslations("Patient.PersonalValidation");

    const { pristineData, sectionState, setSectionState } = useMainStore(
        useShallow((state) => ({
            pristineData: state.patient.pristineData,
            sectionState: state.patient.uiState.personal.info,
            setSectionState: state.patient.actions.setSectionState,
        })),
    );

    const defaultValues = useMemo((): Partial<PatientPersonalFormType> => {
        const personalData = pristineData?.personal ??
            createNewPatientData().personal;
        return snakeToCamel(personalData ?? {});
    }, [pristineData?.personal]);

    const form = useForm<PatientPersonalFormType>({
        resolver: zodResolver(PatientPersonalFormSchema(tValidation)),
        defaultValues,
    });

    const {
        reset,
        formState: { isDirty },
    } = form;

    const { isDirty: isSectionDirty } = sectionState;

    // keep global dirty flag in sync
    useEffect(() => {
        if (isDirty !== isSectionDirty) {
            setSectionState("personal", "info", { isDirty });
        }
    }, [isDirty, isSectionDirty, setSectionState]);

    // reset when pristine/default values change
    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    return {
        form,
        defaultValues,
        pristineData,
        sectionState,
        setSectionState,
    };
}
