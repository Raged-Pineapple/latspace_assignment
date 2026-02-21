import { Parameter, FormulaValidationResponse, OnboardingResponse } from "@/app/types/onboarding";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchParameters(assetTypes: string[]): Promise<Parameter[]> {
    const query = assetTypes.length > 0 ? `?asset_types=${assetTypes.join(",")}` : "";
    const res = await fetch(`${API_BASE}/api/parameters${query}`);
    if (!res.ok) throw new Error("Failed to fetch parameters");
    const data = await res.json();
    // Add enabled: false by default
    return data.map((p: Omit<Parameter, "enabled">) => ({ ...p, enabled: false }));
}

export async function validateFormula(
    expression: string,
    enabledParameters: string[]
): Promise<FormulaValidationResponse> {
    const res = await fetch(`${API_BASE}/api/validate-formula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression, enabled_parameters: enabledParameters }),
    });
    if (!res.ok) throw new Error("Failed to validate formula");
    return res.json();
}

export async function submitOnboarding(payload: unknown): Promise<OnboardingResponse> {
    const res = await fetch(`${API_BASE}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to submit onboarding");
    return res.json();
}

// --- AI Suggestion ---
export async function suggestParameters(
    description: string,
    assetTypes: string[]
): Promise<{ suggestions: Parameter[]; count: number }> {
    const res = await fetch(`${API_BASE}/api/suggest-parameters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, asset_types: assetTypes }),
    });
    if (!res.ok) throw new Error("Failed to get suggestions");
    return res.json();
}

// --- CSV Import ---
export async function importParameters(
    file: File
): Promise<{ parameters: Parameter[]; count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/import-parameters`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to import parameters");
    return res.json();
}

// --- Templates ---
export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

export async function listTemplates(): Promise<{ templates: TemplateInfo[] }> {
    const res = await fetch(`${API_BASE}/api/templates`);
    if (!res.ok) throw new Error("Failed to list templates");
    return res.json();
}

export async function loadTemplate(
    id: string
): Promise<{ name: string; description: string; config: Record<string, unknown> }> {
    const res = await fetch(`${API_BASE}/api/templates/${id}`);
    if (!res.ok) throw new Error("Failed to load template");
    return res.json();
}

export async function saveTemplate(
    name: string,
    description: string,
    config: Record<string, unknown>
): Promise<{ status: string; id: string }> {
    const res = await fetch(`${API_BASE}/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, config }),
    });
    if (!res.ok) throw new Error("Failed to save template");
    return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/templates/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete template");
}
