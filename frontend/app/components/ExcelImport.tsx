"use client";

import React, { useRef, useState } from "react";
import { Parameter } from "@/app/types/onboarding";
import { importParameters } from "@/app/services/api";

interface ExcelImportProps {
    onImport: (params: Parameter[]) => void;
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ count: number; errors: string[] } | null>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await importParameters(file);
            onImport(res.parameters);
            setResult({ count: res.count, errors: res.errors });
        } catch {
            setResult({ count: 0, errors: ["Failed to import file. Make sure the backend is running."] });
        } finally {
            setLoading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    return (
        <div className="excel-import">
            <div className="import-header">
                <span className="import-icon">📥</span>
                <span className="import-label">Import from CSV</span>
            </div>

            <div className="import-body">
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFile}
                    style={{ display: "none" }}
                    id="csv-upload"
                />
                <button
                    className="btn btn-outline import-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={loading}
                >
                    {loading ? "Importing…" : "📄 Upload CSV File"}
                </button>
                <span className="import-hint">
                    Required columns: name, display_name, unit, category, section
                </span>
            </div>

            {result && (
                <div className={`import-result ${result.errors.length > 0 ? "has-errors" : ""}`}>
                    {result.count > 0 && (
                        <span className="import-success">✔ Imported {result.count} parameters</span>
                    )}
                    {result.errors.map((err, i) => (
                        <span key={i} className="import-error">⚠ {err}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
