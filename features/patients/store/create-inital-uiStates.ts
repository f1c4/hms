import { SectionMode, SectionState } from "./patient-slice";

export const createDefaultSectionState = (
  mode: SectionMode = "view",
): SectionState => ({
  mode,
  isDirty: false,
});

export const initialUIState = {
  general: {
    info: createDefaultSectionState("view"),
  },
  documents: {
    idDocs: createDefaultSectionState("view"),
    insurance: createDefaultSectionState("view"),
  },
  personal: {
    info: createDefaultSectionState("view"),
  },
  risk: {
    info: createDefaultSectionState("view"),
  },
  medical: {
    info: createDefaultSectionState("view"),
  },
  notes: {
    info: createDefaultSectionState("view"),
  },
};

/**
 * For a new patient: only General tab is in create mode.
 * Other tabs remain in view mode (and are disabled until redirect occurs).
 */
export const createUiStateForNewPatient = (): typeof initialUIState => {
  return {
    ...initialUIState,
    general: {
      info: createDefaultSectionState("create"),
    },
  };
};
