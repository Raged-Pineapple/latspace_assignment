"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Parameter, Formula } from "@/app/types/onboarding";
import { validateFormula } from "@/app/services/api";

interface Step4Props {
    parameters: Parameter[];
    formulas: Formula[];
    onChange: (formulas: Formula[]) => void;
}

export function isStep4Valid(formulas: Formula[]): boolean {
    return formulas.every((f) => f.valid === true);
}

export function hasCalculatedParams(parameters: Parameter[]): boolean {
    return parameters.some((p) => p.enabled && p.category === "calculated");
}

export default function Step4Formulas({ parameters, formulas, onChange }: Step4Props) {
    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const formulasRef = useRef(formulas);
    formulasRef.current = formulas;

    const calculatedParams = parameters.filter(
        (p) => p.enabled && p.category === "calculated"
    );
    const enabledParamNames = parameters.filter((p) => p.enabled).map((p) => p.name);
    const enabledParamNamesRef = useRef(enabledParamNames);
    enabledParamNamesRef.current = enabledParamNames;

    // Auto-sync formulas with calculated parameters
    useEffect(() => {
        const existing = new Map(formulas.map((f) => [f.parameter_name, f]));
        const synced = calculatedParams.map((p) => {
            const prev = existing.get(p.name);
            return prev || { parameter_name: p.name, expression: "", depends_on: [], valid: undefined as boolean | undefined, error: null as string | null };
        });
        if (
            synced.length !== formulas.length ||
            synced.some((s, i) => s.parameter_name !== formulas[i]?.parameter_name)
        ) {
            onChange(synced);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculatedParams.length]);

    const handleExpressionChange = useCallback(
        (paramName: string, expression: string) => {
            const updated = formulasRef.current.map((f) =>
                f.parameter_name === paramName
                    ? { ...f, expression, valid: undefined as boolean | undefined, error: null as string | null }
                    : f
            );
            onChange(updated);

            if (debounceTimers.current[paramName]) {
                clearTimeout(debounceTimers.current[paramName]);
            }

            if (expression.trim() === "") return;

            debounceTimers.current[paramName] = setTimeout(async () => {
                try {
                    const result = await validateFormula(expression, enabledParamNamesRef.current);
                    const latest = formulasRef.current.map((f) =>
                        f.parameter_name === paramName
                            ? { ...f, valid: result.valid, depends_on: result.depends_on, error: result.error }
                            : f
                    );
                    onChange(latest);
                } catch {
                    const latest = formulasRef.current.map((f) =>
                        f.parameter_name === paramName
                            ? { ...f, valid: false, error: "Validation service unavailable" }
                            : f
                    );
                    onChange(latest);
                }
            }, 600);
        },
        [onChange]
    );

    if (calculatedParams.length === 0) {
        return (
            <div className="step-content">
                <h2 className="step-title">
                    <span className="step-icon">🧮</span>
                    Formulas
                </h2>
                <div className="empty-state">
                    <span className="empty-icon">✨</span>
                    <p>No calculated parameters enabled. You can skip this step.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="step-content">
            <h2 className="step-title">
                <span className="step-icon">🧮</span>
                Formulas
            </h2>
            <p className="step-description">
                Define formulas for each calculated parameter. Use enabled parameter names as variables.
            </p>

            <div className="available-params">
                <span className="hint">Available variables: </span>
                {enabledParamNames.map((name) => (
                    <code key={name} className="var-chip">{name}</code>
                ))}
            </div>

            <div className="formula-list">
                {formulas.map((f) => {
                    const param = calculatedParams.find((p) => p.name === f.parameter_name);
                    return (
                        <div key={f.parameter_name} className="formula-card">
                            <div className="formula-header">
                                <span className="formula-param-name">
                                    {param?.display_name || f.parameter_name}
                                </span>
                                <span
                                    className={`validation-badge ${f.valid === true
                                            ? "valid"
                                            : f.valid === false
                                                ? "invalid"
                                                : "pending"
                                        }`}
                                >
                                    {f.valid === true ? "✔ Valid" : f.valid === false ? "✖ Invalid" : "⏳ Waiting"}
                                </span>
                            </div>

                            <div className="formula-input-row">
                                <span className="formula-eq">=</span>
                                <input
                                    type="text"
                                    className={`formula-input ${f.valid === false ? "input-error" : f.valid === true ? "input-valid" : ""
                                        }`}
                                    placeholder={`e.g. steam_generation / coal_consumption * 100`}
                                    value={f.expression}
                                    onChange={(e) => handleExpressionChange(f.parameter_name, e.target.value)}
                                />
                            </div>

                            {f.error && <div className="formula-error">{f.error}</div>}

                            {f.depends_on && f.depends_on.length > 0 && (
                                <div className="formula-deps">
                                    Depends on:{" "}
                                    {f.depends_on.map((d) => (
                                        <code key={d} className="dep-chip">{d}</code>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
