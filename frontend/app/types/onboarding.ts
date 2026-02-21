// --- Plant Info ---
export interface PlantInfo {
  name: string;
  address: string;
  manager_email: string;
  description: string;
}

// --- Asset ---
export interface Asset {
  name: string;
  display_name: string;
  asset_type: string;
}

// --- Parameter ---
export interface Parameter {
  name: string;
  display_name: string;
  unit: string;
  category: string; // input | output | calculated
  section: string;
  applicable_asset_types: string[];
  enabled: boolean;
}

// --- Formula ---
export interface Formula {
  parameter_name: string;
  expression: string;
  depends_on: string[];
  valid?: boolean;
  error?: string | null;
}

// --- Wizard State ---
export interface WizardState {
  plant: PlantInfo;
  assets: Asset[];
  parameters: Parameter[];
  formulas: Formula[];
  currentStep: number;
}

// --- API Response Types ---
export interface FormulaValidationResponse {
  valid: boolean;
  depends_on: string[];
  error: string | null;
}

export interface OnboardingResponse {
  status: string;
  message: string;
  summary: {
    plant_name: string;
    num_assets: number;
    num_parameters: number;
    num_formulas: number;
    submitted_at: string;
  };
}

// --- Constants ---
export const ASSET_TYPES = [
  { value: "boiler", label: "Boiler" },
  { value: "turbine", label: "Turbine" },
  { value: "cooling_tower", label: "Cooling Tower" },
];

export const DEFAULT_PLANT: PlantInfo = {
  name: "",
  address: "",
  manager_email: "",
  description: "",
};
