"use client";

import React from "react";

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
    onStepClick: (step: number) => void;
    completedSteps: boolean[];
}

export default function StepIndicator({
    steps,
    currentStep,
    onStepClick,
    completedSteps,
}: StepIndicatorProps) {
    return (
        <div className="step-indicator">
            {steps.map((label, i) => {
                const isActive = i === currentStep;
                const isCompleted = completedSteps[i];
                const isClickable = isCompleted || i <= currentStep;

                return (
                    <React.Fragment key={i}>
                        <button
                            className={`step-dot ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                            onClick={() => isClickable && onStepClick(i)}
                            disabled={!isClickable}
                            title={label}
                        >
                            <span className="step-number">
                                {isCompleted ? "✓" : i + 1}
                            </span>
                            <span className="step-label">{label}</span>
                        </button>
                        {i < steps.length - 1 && (
                            <div className={`step-line ${isCompleted ? "completed" : ""}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
