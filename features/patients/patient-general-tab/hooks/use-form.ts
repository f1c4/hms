"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
    PatientGeneralFormInput,
    PatientGeneralFormSchema,
} from "../schemas/info-form-schema";
import { snakeToCamel } from "@/utils/utils";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

export function useGeneralInfoForm() {
    const tValidation = useTranslations("Patient.GeneralValidation");

    const { patientId, pristineData, sectionState, setSectionState } =
        useMainStore(
            useShallow((state) => ({
                patientId: state.patient.patientId,
                pristineData: state.patient.pristineData,
                sectionState: state.patient.uiState.general.info,
                setSectionState: state.patient.actions.setSectionState,
            })),
        );

    const isCreating = patientId === null;
    const { isDirty: isSectionDirty } = sectionState;

    const defaultValues = useMemo((): Partial<PatientGeneralFormInput> => {
        if (isCreating) return {};
        const generalData = pristineData?.general;
        if (!generalData) return {};
        return snakeToCamel(generalData) as Partial<PatientGeneralFormInput>;
    }, [pristineData, isCreating]);

    const form = useForm<PatientGeneralFormInput>({
        resolver: zodResolver(PatientGeneralFormSchema(tValidation)),
        defaultValues,
    });

    const {
        reset,
        formState: { isDirty: isFormDirty },
    } = form;

    // keep store dirty flag in sync
    useEffect(() => {
        if (isFormDirty !== isSectionDirty) {
            setSectionState("general", "info", { isDirty: isFormDirty });
        }
    }, [isFormDirty, isSectionDirty, setSectionState]);

    // reset when defaultValues change (e.g. new patient loaded)
    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    return {
        form,
        defaultValues,
        isCreating,
        sectionState,
        setSectionState,
        pristineData,
    };
}
