"use client";

import React from "react";
import { Asset, ASSET_TYPES } from "@/app/types/onboarding";

interface Step2Props {
    assets: Asset[];
    onChange: (assets: Asset[]) => void;
}

export function isStep2Valid(assets: Asset[]): boolean {
    if (assets.length === 0) return false;
    const names = assets.map((a) => a.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) return false;
    return assets.every(
        (a) => a.name.trim().length > 0 && a.display_name.trim().length > 0 && a.asset_type
    );
}

export default function Step2Assets({ assets, onChange }: Step2Props) {
    const addAsset = () => {
        onChange([...assets, { name: "", display_name: "", asset_type: "" }]);
    };

    const removeAsset = (index: number) => {
        const next = assets.filter((_, i) => i !== index);
        onChange(next);
    };

    const updateAsset = (index: number, field: keyof Asset, value: string) => {
        const next = [...assets];
        next[index] = { ...next[index], [field]: value };
        // Auto-generate name from display_name
        if (field === "display_name") {
            next[index].name = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
        }
        onChange(next);
    };

    const getDuplicateNames = (): Set<string> => {
        const names = assets.map((a) => a.name.trim().toLowerCase());
        const seen = new Set<string>();
        const dupes = new Set<string>();
        names.forEach((n) => {
            if (seen.has(n) && n) dupes.add(n);
            seen.add(n);
        });
        return dupes;
    };

    const dupes = getDuplicateNames();

    return (
        <div className="step-content">
            <h2 className="step-title">
                <span className="step-icon">⚙️</span>
                Plant Assets
            </h2>
            <p className="step-description">
                Define the assets in your plant. Each asset must have a unique name and type.
            </p>

            <div className="assets-list">
                {assets.map((asset, i) => {
                    const isDupe = dupes.has(asset.name.trim().toLowerCase());
                    return (
                        <div key={i} className="asset-row">
                            <div className="asset-fields">
                                <div className="form-group">
                                    <label>Display Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Main Boiler"
                                        value={asset.display_name}
                                        onChange={(e) => updateAsset(i, "display_name", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>System Name</label>
                                    <input
                                        type="text"
                                        value={asset.name}
                                        readOnly
                                        className={`readonly-input ${isDupe ? "input-error" : ""}`}
                                    />
                                    {isDupe && <span className="error-text">Duplicate name</span>}
                                </div>

                                <div className="form-group">
                                    <label>Asset Type <span className="required">*</span></label>
                                    <select
                                        value={asset.asset_type}
                                        onChange={(e) => updateAsset(i, "asset_type", e.target.value)}
                                    >
                                        <option value="">Select type…</option>
                                        {ASSET_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                className="btn btn-danger btn-icon"
                                onClick={() => removeAsset(i)}
                                title="Remove asset"
                            >
                                🗑
                            </button>
                        </div>
                    );
                })}

                {assets.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">📦</span>
                        <p>No assets added yet. Click below to add your first asset.</p>
                    </div>
                )}
            </div>

            <button className="btn btn-outline add-btn" onClick={addAsset}>
                + Add Asset
            </button>
        </div>
    );
}
