"use client";

import React, { useEffect, useState } from "react";
import { Parameter, Asset } from "@/app/types/onboarding";
import { fetchParameters } from "@/app/services/api";
import AISuggester from "./AISuggester";
import ExcelImport from "./ExcelImport";

interface Step3Props {
    assets: Asset[];
    parameters: Parameter[];
    onChange: (parameters: Parameter[]) => void;
    plantDescription: string;
}

export function isStep3Valid(parameters: Parameter[]): boolean {
    return parameters.some((p) => p.enabled);
}

export default function Step3Parameters({ assets, parameters, onChange, plantDescription }: Step3Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const assetTypes = [...new Set(assets.map((a) => a.asset_type).filter(Boolean))];
        if (assetTypes.length === 0) return;

        setLoading(true);
        setError(null);
        fetchParameters(assetTypes)
            .then((fetched) => {
                // Merge with existing state — preserve enabled/overrides
                const existing = new Map(parameters.map((p) => [p.name, p]));
                const merged = fetched.map((p: Parameter) => {
                    const prev = existing.get(p.name);
                    return prev ? { ...p, enabled: prev.enabled, unit: prev.unit, category: prev.category, section: prev.section } : p;
                });
                onChange(merged);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assets]);

    const toggleParam = (name: string) => {
        onChange(
            parameters.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p))
        );
    };

    const updateParam = (name: string, field: keyof Parameter, value: string) => {
        onChange(
            parameters.map((p) => (p.name === name ? { ...p, [field]: value } : p))
        );
    };

    // Group by section
    const sections = parameters.reduce<Record<string, Parameter[]>>((acc, p) => {
        if (!acc[p.section]) acc[p.section] = [];
        acc[p.section].push(p);
        return acc;
    }, {});

    const enabledCount = parameters.filter((p) => p.enabled).length;

    if (loading) {
        return (
            <div className="step-content">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading parameters from registry…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="step-content">
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <p className="hint">Make sure the backend is running on port 8000.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="step-content">
            <h2 className="step-title">
                <span className="step-icon">📊</span>
                Parameters
            </h2>
            <p className="step-description">
                Select and customize parameters for your plant.{" "}
                <span className="badge">{enabledCount} enabled</span>
            </p>

            <div className="stretch-tools">
                <AISuggester
                    description={plantDescription}
                    assetTypes={[...new Set(assets.map((a) => a.asset_type).filter(Boolean))]}
                    existingParams={parameters}
                    onAccept={(suggested) => {
                        const existingNames = new Set(parameters.map((p) => p.name));
                        const newParams = suggested.filter((s) => !existingNames.has(s.name));
                        onChange([...parameters, ...newParams]);
                    }}
                />
                <ExcelImport
                    onImport={(imported) => {
                        const existingNames = new Set(parameters.map((p) => p.name));
                        const newParams = imported.filter((p) => !existingNames.has(p.name));
                        onChange([...parameters, ...newParams]);
                    }}
                />
            </div>

            {Object.entries(sections).map(([section, params]) => (
                <div key={section} className="param-section">
                    <h3 className="section-header">{section}</h3>
                    <div className="param-list">
                        {params.map((p) => (
                            <div key={p.name} className={`param-card ${p.enabled ? "enabled" : ""}`}>
                                <div className="param-header">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={p.enabled}
                                            onChange={() => toggleParam(p.name)}
                                        />
                                        <span className="toggle-switch" />
                                        <span className="param-name">{p.display_name}</span>
                                    </label>
                                    <span className={`category-badge ${p.category}`}>{p.category}</span>
                                </div>

                                {p.enabled && (
                                    <div className="param-overrides">
                                        <div className="form-group compact">
                                            <label>Unit</label>
                                            <input
                                                type="text"
                                                value={p.unit}
                                                onChange={(e) => updateParam(p.name, "unit", e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group compact">
                                            <label>Category</label>
                                            <select
                                                value={p.category}
                                                onChange={(e) => updateParam(p.name, "category", e.target.value)}
                                            >
                                                <option value="input">Input</option>
                                                <option value="output">Output</option>
                                                <option value="calculated">Calculated</option>
                                            </select>
                                        </div>
                                        <div className="form-group compact">
                                            <label>Section</label>
                                            <input
                                                type="text"
                                                value={p.section}
                                                onChange={(e) => updateParam(p.name, "section", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {parameters.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <p>No parameters available. Make sure you have added assets with valid types in Step 2.</p>
                </div>
            )}
        </div>
    );
}
