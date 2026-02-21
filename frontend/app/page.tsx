"use client";

import React, { useState, useEffect } from "react";
import WizardLayout from "./components/WizardLayout";
import Step1PlantInfo, { isStep1Valid } from "./components/Step1PlantInfo";
import Step2Assets, { isStep2Valid } from "./components/Step2Assets";
import Step3Parameters, { isStep3Valid } from "./components/Step3Parameters";
import Step4Formulas, { isStep4Valid, hasCalculatedParams } from "./components/Step4Formulas";
import Step5Review from "./components/Step5Review";
import ThemeToggle from "./components/ThemeToggle";
import TemplateManager from "./components/TemplateManager";
import { useWizardState } from "./hooks/useWizardState";
import { submitOnboarding } from "./services/api";
import { WizardState } from "./types/onboarding";

export default function Home() {
  const {
    state,
    hydrated,
    setPlant,
    setAssets,
    setParameters,
    setFormulas,
    setCurrentStep,
    resetState,
  } = useWizardState();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  // Theme handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("onboarding_theme");
      if (saved === "light") setIsDark(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("onboarding_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const step = state.currentStep;

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return isStep1Valid(state.plant);
      case 1: return isStep2Valid(state.assets);
      case 2: return isStep3Valid(state.parameters);
      case 3: return !hasCalculatedParams(state.parameters) || isStep4Valid(state.formulas);
      case 4: return true;
      default: return false;
    }
  };

  const completedSteps = [
    isStep1Valid(state.plant),
    isStep2Valid(state.assets),
    isStep3Valid(state.parameters),
    !hasCalculatedParams(state.parameters) || isStep4Valid(state.formulas),
    false,
  ];

  const handleNext = () => {
    if (step < 4 && canProceed()) {
      if (step === 2 && !hasCalculatedParams(state.parameters)) {
        setCurrentStep(4);
      } else {
        setCurrentStep(step + 1);
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      if (step === 4 && !hasCalculatedParams(state.parameters)) {
        setCurrentStep(2);
      } else {
        setCurrentStep(step - 1);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const enabledParams = state.parameters.filter((p) => p.enabled);
      const payload = {
        plant: state.plant,
        assets: state.assets,
        parameters: enabledParams.map(({ enabled, applicable_asset_types, ...rest }) => rest),
        formulas: state.formulas
          .filter((f) => f.expression.trim())
          .map(({ valid, error, ...rest }) => rest),
      };
      const result = await submitOnboarding(payload);
      setSubmitResult(result.message);
      setSubmitted(true);
    } catch {
      setSubmitResult("Submission failed. Please check the backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadTemplate = (config: Record<string, unknown>) => {
    const c = config as unknown as Omit<WizardState, "currentStep">;
    if (c.plant) setPlant(c.plant);
    if (c.assets) setAssets(c.assets);
    if (c.parameters) setParameters(c.parameters);
    if (c.formulas) setFormulas(c.formulas);
    setCurrentStep(0);
    setShowTemplates(false);
  };

  if (!hydrated) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading wizard…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="success-screen">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2>Onboarding Complete!</h2>
          <p>{submitResult}</p>
          <button className="btn btn-primary" onClick={() => { resetState(); setSubmitted(false); }}>
            Start New Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="top-bar">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          📋 Templates
        </button>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>

      {showTemplates && (
        <div className="template-overlay">
          <TemplateManager state={state} onLoadTemplate={handleLoadTemplate} />
        </div>
      )}

      <WizardLayout
        currentStep={step}
        onStepClick={setCurrentStep}
        completedSteps={completedSteps}
        onNext={handleNext}
        onPrev={handlePrev}
        canNext={canProceed()}
        isLastStep={step === 4}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        {step === 0 && <Step1PlantInfo plant={state.plant} onChange={setPlant} />}
        {step === 1 && <Step2Assets assets={state.assets} onChange={setAssets} />}
        {step === 2 && (
          <Step3Parameters
            assets={state.assets}
            parameters={state.parameters}
            onChange={setParameters}
            plantDescription={state.plant.description}
          />
        )}
        {step === 3 && (
          <Step4Formulas
            parameters={state.parameters}
            formulas={state.formulas}
            onChange={setFormulas}
          />
        )}
        {step === 4 && <Step5Review state={state} onStepClick={setCurrentStep} />}
      </WizardLayout>
    </>
  );
}
