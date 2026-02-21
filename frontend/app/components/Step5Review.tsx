"use client";

import React, { useState } from "react";
import { WizardState } from "@/app/types/onboarding";

interface Step5Props {
    state: WizardState;
    onStepClick: (step: number) => void;
}

export default function Step5Review({ state, onStepClick }: Step5Props) {
    const [openSections, setOpenSections] = useState<Set<string>>(
        new Set(["plant", "assets", "parameters", "formulas"])
    );
    const [showJson, setShowJson] = useState(false);

    const toggleSection = (section: string) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    const enabledParams = state.parameters.filter((p) => p.enabled);

    const payload = {
        plant: state.plant,
        assets: state.assets,
        parameters: enabledParams.map(({ enabled, applicable_asset_types, ...rest }) => rest),
        formulas: state.formulas
            .filter((f) => f.expression.trim())
            .map(({ valid, error, ...rest }) => rest),
    };

    const jsonString = JSON.stringify(payload, null, 2);

    const downloadJson = () => {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.plant.name.replace(/\s+/g, "_").toLowerCase() || "plant"}_onboarding.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="step-content">
            <h2 className="step-title">
                <span className="step-icon">📋</span>
                Review & Submit
            </h2>
            <p className="step-description">
                Review your configuration before submitting.
            </p>

            {/* Plant Info */}
            <div className="review-section">
                <button className="accordion-header" onClick={() => toggleSection("plant")}>
                    <span>{openSections.has("plant") ? "▼" : "▶"} Plant Information</span>
                    <button className="btn btn-link" onClick={(e) => { e.stopPropagation(); onStepClick(0); }}>
                        Edit
                    </button>
                </button>
                {openSections.has("plant") && (
                    <div className="accordion-body">
                        <div className="review-grid">
                            <div className="review-item">
                                <span className="review-label">Name</span>
                                <span className="review-value">{state.plant.name}</span>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Address</span>
                                <span className="review-value">{state.plant.address}</span>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Manager Email</span>
                                <span className="review-value">{state.plant.manager_email}</span>
                            </div>
                            {state.plant.description && (
                                <div className="review-item full-width">
                                    <span className="review-label">Description</span>
                                    <span className="review-value">{state.plant.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Assets */}
            <div className="review-section">
                <button className="accordion-header" onClick={() => toggleSection("assets")}>
                    <span>{openSections.has("assets") ? "▼" : "▶"} Assets ({state.assets.length})</span>
                    <button className="btn btn-link" onClick={(e) => { e.stopPropagation(); onStepClick(1); }}>
                        Edit
                    </button>
                </button>
                {openSections.has("assets") && (
                    <div className="accordion-body">
                        <table className="review-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Display Name</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.assets.map((a, i) => (
                                    <tr key={i}>
                                        <td><code>{a.name}</code></td>
                                        <td>{a.display_name}</td>
                                        <td><span className="type-badge">{a.asset_type}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Parameters */}
            <div className="review-section">
                <button className="accordion-header" onClick={() => toggleSection("parameters")}>
                    <span>{openSections.has("parameters") ? "▼" : "▶"} Parameters ({enabledParams.length})</span>
                    <button className="btn btn-link" onClick={(e) => { e.stopPropagation(); onStepClick(2); }}>
                        Edit
                    </button>
                </button>
                {openSections.has("parameters") && (
                    <div className="accordion-body">
                        <table className="review-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Unit</th>
                                    <th>Category</th>
                                    <th>Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enabledParams.map((p) => (
                                    <tr key={p.name}>
                                        <td>{p.display_name}</td>
                                        <td>{p.unit}</td>
                                        <td><span className={`category-badge ${p.category}`}>{p.category}</span></td>
                                        <td>{p.section}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Formulas */}
            {state.formulas.length > 0 && (
                <div className="review-section">
                    <button className="accordion-header" onClick={() => toggleSection("formulas")}>
                        <span>{openSections.has("formulas") ? "▼" : "▶"} Formulas ({state.formulas.length})</span>
                        <button className="btn btn-link" onClick={(e) => { e.stopPropagation(); onStepClick(3); }}>
                            Edit
                        </button>
                    </button>
                    {openSections.has("formulas") && (
                        <div className="accordion-body">
                            {state.formulas.filter(f => f.expression.trim()).map((f) => (
                                <div key={f.parameter_name} className="formula-review">
                                    <code className="formula-name">{f.parameter_name}</code>
                                    <span className="formula-eq">=</span>
                                    <code className="formula-expr">{f.expression}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* JSON Preview & Download */}
            <div className="json-actions">
                <button className="btn btn-outline" onClick={() => setShowJson(!showJson)}>
                    {showJson ? "Hide" : "Show"} JSON Preview
                </button>
                <button className="btn btn-outline" onClick={downloadJson}>
                    📥 Download JSON
                </button>
            </div>

            {showJson && (
                <div className="json-preview">
                    <pre>{jsonString}</pre>
                </div>
            )}
        </div>
    );
}
