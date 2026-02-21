"use client";

import React, { useState } from "react";
import { Parameter } from "@/app/types/onboarding";
import { suggestParameters } from "@/app/services/api";

interface AISuggesterProps {
    description: string;
    assetTypes: string[];
    existingParams: Parameter[];
    onAccept: (params: Parameter[]) => void;
}

interface SuggestedParam extends Parameter {
    reason?: string;
}

export default function AISuggester({ description, assetTypes, existingParams, onAccept }: AISuggesterProps) {
    const [suggestions, setSuggestions] = useState<SuggestedParam[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [fetched, setFetched] = useState(false);

    const handleSuggest = async () => {
        setLoading(true);
        try {
            const res = await suggestParameters(description, assetTypes);
            const existingNames = new Set(existingParams.map((p) => p.name));
            const newSuggestions = res.suggestions.filter((s: SuggestedParam) => !existingNames.has(s.name));
            setSuggestions(newSuggestions);
            setSelected(new Set(newSuggestions.map((s: SuggestedParam) => s.name)));
            setFetched(true);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (name: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const handleAccept = () => {
        const accepted = suggestions
            .filter((s) => selected.has(s.name))
            .map((s) => ({ ...s, enabled: true }));
        onAccept(accepted);
        setSuggestions([]);
        setFetched(false);
    };

    return (
        <div className="ai-suggester">
            <div className="suggester-header">
                <span className="ai-icon">🤖</span>
                <span className="ai-label">AI Parameter Suggestion</span>
            </div>

            {!fetched && (
                <button className="btn btn-outline ai-btn" onClick={handleSuggest} disabled={loading}>
                    {loading ? "Analyzing…" : "✨ Suggest Parameters"}
                </button>
            )}

            {fetched && suggestions.length === 0 && (
                <p className="ai-empty">No additional parameters suggested for your plant configuration.</p>
            )}

            {suggestions.length > 0 && (
                <div className="suggestion-list">
                    {suggestions.map((s) => (
                        <label key={s.name} className={`suggestion-item ${selected.has(s.name) ? "selected" : ""}`}>
                            <input
                                type="checkbox"
                                checked={selected.has(s.name)}
                                onChange={() => toggleSelect(s.name)}
                            />
                            <div className="suggestion-info">
                                <span className="suggestion-name">{s.display_name}</span>
                                <span className="suggestion-meta">{s.unit} · {s.category} · {s.section}</span>
                                {s.reason && <span className="suggestion-reason">{s.reason}</span>}
                            </div>
                        </label>
                    ))}
                    <div className="suggestion-actions">
                        <button className="btn btn-primary btn-sm" onClick={handleAccept} disabled={selected.size === 0}>
                            Add {selected.size} Parameter{selected.size !== 1 ? "s" : ""}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSuggestions([]); setFetched(false); }}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
