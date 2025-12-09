// ============================================================================
// Localized Name (JSONB structure for translated fields)
// ============================================================================

export type LocalizedName = Record<string, string> | null;

// ============================================================================
// Patient Basic Data (returned by get_patient_list_basic RPC)
// ============================================================================

export interface PatientBasicData {
    id: number;
    firstName: string;
    lastName: string;
    nationalIdNumber: string | null;
    dateOfBirth: string;
    phone: string | null;
    email: string | null;
    // Address fields
    residenceAddress: string | null;
    residenceCountryIso2: string | null;
    residenceCityName: LocalizedName; // Full JSONB with all translations
    residenceCityPostalCode: string | null;
    // Emergency contact
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelation: string | null;
    // Timestamps
    createdAt: string;
    updatedAt: string | null;
}

// ============================================================================
// Pagination Info
// ============================================================================

export interface PaginationInfo {
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================================================
// Patient List Response (full RPC response structure)
// ============================================================================

export interface PatientListBasicResponse {
    data: PatientBasicData[];
    filteredCount: number;
    totalCount: number;
    pagination: PaginationInfo;
}

// ============================================================================
// Search Parameters (no locale needed anymore)
// ============================================================================

export interface PatientBasicSearchParams {
    page?: number;
    limit?: number;
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    phone?: string;
    sort?: PatientSortField;
    order?: SortOrder;
}

// ============================================================================
// Sort Options
// ============================================================================

export type PatientSortField =
    | "created_at"
    | "first_name"
    | "last_name"
    | "date_of_birth";

export type SortOrder = "asc" | "desc";

// ============================================================================
// Action Response
// ============================================================================

export interface ActionResponse<T> {
    success: boolean;
    errorMessage: string | null;
    data: T | null;
}

export type PatientListActionResponse = ActionResponse<
    PatientListBasicResponse
>;
