"use client";

import { useState, useEffect, useCallback } from "react";
import { WizardState, PlantInfo, Asset, Parameter, Formula, DEFAULT_PLANT } from "@/app/types/onboarding";

const STORAGE_KEY = "onboarding_wizard_state";

const initialState: WizardState = {
    plant: { ...DEFAULT_PLANT },
    assets: [],
    parameters: [],
    formulas: [],
    currentStep: 0,
};

function loadState(): WizardState {
    if (typeof window === "undefined") return initialState;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch {
        // ignore
    }
    return initialState;
}

export function useWizardState() {
    const [state, setState] = useState<WizardState>(initialState);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        setState(loadState());
        setHydrated(true);
    }, []);

    // Persist to localStorage on every change
    useEffect(() => {
        if (hydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, hydrated]);

    const setPlant = useCallback((plant: PlantInfo) => {
        setState((prev) => ({ ...prev, plant }));
    }, []);

    const setAssets = useCallback((assets: Asset[]) => {
        setState((prev) => ({ ...prev, assets }));
    }, []);

    const setParameters = useCallback((parameters: Parameter[]) => {
        setState((prev) => ({ ...prev, parameters }));
    }, []);

    const setFormulas = useCallback((formulas: Formula[]) => {
        setState((prev) => ({ ...prev, formulas }));
    }, []);

    const setCurrentStep = useCallback((step: number) => {
        setState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    const resetState = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState(initialState);
    }, []);

    return {
        state,
        hydrated,
        setPlant,
        setAssets,
        setParameters,
        setFormulas,
        setCurrentStep,
        resetState,
    };
}
