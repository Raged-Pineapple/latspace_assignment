"use client";

import React from "react";
import { PlantInfo } from "@/app/types/onboarding";

interface Step1Props {
    plant: PlantInfo;
    onChange: (plant: PlantInfo) => void;
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStep1Valid(plant: PlantInfo): boolean {
    return (
        plant.name.trim().length > 0 &&
        plant.address.trim().length > 0 &&
        validateEmail(plant.manager_email)
    );
}

export default function Step1PlantInfo({ plant, onChange }: Step1Props) {
    const update = (field: keyof PlantInfo, value: string) => {
        onChange({ ...plant, [field]: value });
    };

    const emailValid = plant.manager_email === "" || validateEmail(plant.manager_email);

    return (
        <div className="step-content">
            <h2 className="step-title">
                <span className="step-icon">🏭</span>
                Plant Information
            </h2>
            <p className="step-description">
                Provide basic details about the plant being onboarded.
            </p>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="plant-name">
                        Plant Name <span className="required">*</span>
                    </label>
                    <input
                        id="plant-name"
                        type="text"
                        placeholder="e.g. Riverside Cogeneration Plant"
                        value={plant.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={plant.name.trim() === "" && plant.name !== "" ? "input-error" : ""}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="plant-address">
                        Address <span className="required">*</span>
                    </label>
                    <input
                        id="plant-address"
                        type="text"
                        placeholder="e.g. 123 Industrial Ave, Mumbai"
                        value={plant.address}
                        onChange={(e) => update("address", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="manager-email">
                        Manager Email <span className="required">*</span>
                    </label>
                    <input
                        id="manager-email"
                        type="email"
                        placeholder="e.g. manager@plant.com"
                        value={plant.manager_email}
                        onChange={(e) => update("manager_email", e.target.value)}
                        className={!emailValid ? "input-error" : ""}
                    />
                    {!emailValid && (
                        <span className="error-text">Please enter a valid email address</span>
                    )}
                </div>

                <div className="form-group full-width">
                    <label htmlFor="plant-description">Description (optional)</label>
                    <textarea
                        id="plant-description"
                        placeholder="Brief description of the plant, its capacity, etc."
                        value={plant.description}
                        onChange={(e) => update("description", e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
}
