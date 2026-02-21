"use client";

import React from "react";
import StepIndicator from "./StepIndicator";

interface WizardLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    onStepClick: (step: number) => void;
    completedSteps: boolean[];
    onNext: () => void;
    onPrev: () => void;
    canNext: boolean;
    isLastStep: boolean;
    onSubmit?: () => void;
    submitting?: boolean;
}

const STEP_LABELS = ["Plant Info", "Assets", "Parameters", "Formulas", "Review"];

export default function WizardLayout({
    children,
    currentStep,
    onStepClick,
    completedSteps,
    onNext,
    onPrev,
    canNext,
    isLastStep,
    onSubmit,
    submitting,
}: WizardLayoutProps) {
    return (
        <div className="wizard-container">
            <div className="wizard-header">
                <div className="wizard-logo">
                    <span className="logo-icon">⚡</span>
                    <h1>Plant Onboarding</h1>
                </div>
                <p className="wizard-subtitle">Configure your plant in a few easy steps</p>
            </div>

            <StepIndicator
                steps={STEP_LABELS}
                currentStep={currentStep}
                onStepClick={onStepClick}
                completedSteps={completedSteps}
            />

            <div className="wizard-content">
                <div className="wizard-card">
                    {children}
                </div>
            </div>

            <div className="wizard-footer">
                <button
                    className="btn btn-secondary"
                    onClick={onPrev}
                    disabled={currentStep === 0}
                >
                    ← Back
                </button>
                <div className="step-counter">
                    Step {currentStep + 1} of {STEP_LABELS.length}
                </div>
                {isLastStep ? (
                    <button
                        className="btn btn-primary btn-submit"
                        onClick={onSubmit}
                        disabled={!canNext || submitting}
                    >
                        {submitting ? "Submitting…" : "Submit ✓"}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={onNext}
                        disabled={!canNext}
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
}
