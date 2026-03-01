"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ScoreBar from "./ScoreBar";
import type { SectorSkill } from "@/lib/types";

interface SkillDetailDrawerProps {
    sectorSkill: SectorSkill | null;
    onClose: () => void;
}

export default function SkillDetailDrawer({
    sectorSkill,
    onClose,
}: SkillDetailDrawerProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const skill = sectorSkill?.skill;
    const isOpen = !!sectorSkill;

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !skill) return null;

    const quickWin = (sectorSkill.quick_win_score ?? 0) > 3;

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed top-0 right-0 z-50 h-full w-full max-w-[520px] bg-white border-l overflow-y-auto"
                style={{
                    borderColor: "#e2e8f0",
                    boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.08)",
                    animation: "slideIn 0.25s ease-out",
                }}
            >
                {/* Header */}
                <div
                    className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "#e2e8f0" }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-[18px] font-bold text-heading truncate">
                            {skill.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface transition-colors shrink-0"
                    >
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {skill.skill_type && (
                            <span
                                className="px-2.5 py-1 rounded text-[11px] font-medium"
                                style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                            >
                                {skill.skill_type.charAt(0).toUpperCase() +
                                    skill.skill_type.slice(1)}
                            </span>
                        )}
                        {quickWin && (
                            <span
                                className="px-2.5 py-1 rounded text-[11px] font-medium"
                                style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                            >
                                ⚡ Quick Win
                            </span>
                        )}
                        {skill.esco_uri && (
                            <a
                                href={skill.esco_uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded text-[11px] font-medium hover:underline"
                                style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                            >
                                ESCO Link ↗
                            </a>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-[13px] font-semibold text-heading mb-2 uppercase tracking-wide">
                            Description
                        </h3>
                        <p className="text-[14px] text-text leading-relaxed">
                            {skill.description || "No description available for this skill."}
                        </p>
                    </div>

                    {/* Scores */}
                    <div
                        className="bg-surface rounded-xl p-5"
                    >
                        <h3 className="text-[13px] font-semibold text-heading mb-4 uppercase tracking-wide">
                            Scores
                        </h3>
                        <div className="space-y-3">
                            <ScoreBar
                                label="Trending"
                                score={sectorSkill.trending_score ?? 0}
                            />
                            <ScoreBar
                                label="Impact"
                                score={sectorSkill.impact_score ?? 0}
                            />
                            <ScoreBar
                                label="Urgency"
                                score={sectorSkill.urgency_score ?? 0}
                            />
                            <ScoreBar
                                label="Priority"
                                score={sectorSkill.priority_score ?? 0}
                            />
                            <ScoreBar
                                label="Quick Win"
                                score={sectorSkill.quick_win_score ?? 0}
                            />
                        </div>
                    </div>

                    {/* AI Rationale */}
                    {sectorSkill.ai_rationale && (
                        <div>
                            <h3 className="text-[13px] font-semibold text-heading mb-2 uppercase tracking-wide">
                                AI Rationale
                            </h3>
                            <div
                                className="p-4 rounded-xl border"
                                style={{
                                    borderColor: "#e2e8f0",
                                    backgroundColor: "#fafbff",
                                }}
                            >
                                <p className="text-[13px] text-text leading-relaxed">
                                    {typeof sectorSkill.ai_rationale === "string"
                                        ? sectorSkill.ai_rationale
                                        : typeof sectorSkill.ai_rationale === "object" && sectorSkill.ai_rationale !== null
                                            ? (sectorSkill.ai_rationale as Record<string, unknown>).rationale as string ?? JSON.stringify(sectorSkill.ai_rationale)
                                            : ""}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Sector */}
                    {sectorSkill.sector && (
                        <div>
                            <h3 className="text-[13px] font-semibold text-heading mb-2 uppercase tracking-wide">
                                Sector
                            </h3>
                            <div className="flex items-center gap-2">
                                <span
                                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium"
                                    style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                                >
                                    {sectorSkill.sector.name}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Quick Win callout */}
                    {quickWin && (
                        <div
                            className="rounded-xl border p-5 text-center"
                            style={{
                                borderColor: "#10b981",
                                backgroundColor: "#ecfdf5",
                            }}
                        >
                            <div className="text-[24px] mb-2">⚡</div>
                            <h4
                                className="text-[14px] font-bold mb-1"
                                style={{ color: "#065f46" }}
                            >
                                Quick Win Opportunity
                            </h4>
                            <p className="text-[12px]" style={{ color: "#047857" }}>
                                High impact with relatively low implementation effort — ideal
                                for rapid adoption in VET programs.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
        </>
    );
}
