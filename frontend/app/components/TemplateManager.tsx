"use client";

import React, { useState, useEffect } from "react";
import { WizardState } from "@/app/types/onboarding";
import { listTemplates, loadTemplate, saveTemplate, deleteTemplate, TemplateInfo } from "@/app/services/api";

interface TemplateManagerProps {
    state: WizardState;
    onLoadTemplate: (config: Record<string, unknown>) => void;
}

export default function TemplateManager({ state, onLoadTemplate }: TemplateManagerProps) {
    const [templates, setTemplates] = useState<TemplateInfo[]>([]);
    const [showSave, setShowSave] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveDesc, setSaveDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const fetchTemplates = async () => {
        try {
            const res = await listTemplates();
            setTemplates(res.templates);
        } catch {
            setTemplates([]);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSave = async () => {
        if (!saveName.trim()) return;
        setSaving(true);
        try {
            const config = {
                plant: state.plant,
                assets: state.assets,
                parameters: state.parameters,
                formulas: state.formulas,
            };
            await saveTemplate(saveName, saveDesc, config);
            setMessage(`Template "${saveName}" saved!`);
            setSaveName("");
            setSaveDesc("");
            setShowSave(false);
            await fetchTemplates();
        } catch {
            setMessage("Failed to save template.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleLoad = async (id: string) => {
        try {
            const data = await loadTemplate(id);
            onLoadTemplate(data.config);
            setMessage(`Template "${data.name}" loaded!`);
            setTimeout(() => setMessage(""), 3000);
        } catch {
            setMessage("Failed to load template.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTemplate(id);
            await fetchTemplates();
            setMessage("Template deleted.");
            setTimeout(() => setMessage(""), 3000);
        } catch {
            setMessage("Failed to delete template.");
        }
    };

    return (
        <div className="template-manager">
            <div className="template-header">
                <div className="template-title-row">
                    <span className="template-icon">📋</span>
                    <span className="template-label">Templates</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setShowSave(!showSave)}>
                    {showSave ? "Cancel" : "💾 Save Current"}
                </button>
            </div>

            {message && <div className="template-message">{message}</div>}

            {showSave && (
                <div className="template-save-form">
                    <input
                        type="text"
                        placeholder="Template name"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={saveDesc}
                        onChange={(e) => setSaveDesc(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || !saveName.trim()}>
                        {saving ? "Saving…" : "Save Template"}
                    </button>
                </div>
            )}

            {templates.length > 0 ? (
                <div className="template-list">
                    {templates.map((t) => (
                        <div key={t.id} className="template-item">
                            <div className="template-info">
                                <span className="template-name">{t.name}</span>
                                {t.description && <span className="template-desc">{t.description}</span>}
                            </div>
                            <div className="template-actions">
                                <button className="btn btn-outline btn-xs" onClick={() => handleLoad(t.id)}>
                                    Load
                                </button>
                                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(t.id)}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="template-empty">No saved templates yet.</p>
            )}
        </div>
    );
}
