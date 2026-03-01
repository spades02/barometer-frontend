import Link from "next/link";
import ScoreBar from "./ScoreBar";
import type { SectorSkill } from "@/lib/types";

interface SkillCardProps {
    sectorSkill: SectorSkill;
}

export default function SkillCard({ sectorSkill }: SkillCardProps) {
    const skill = sectorSkill.skill;
    if (!skill) return null;

    const tags = skill.skill_type ? [skill.skill_type] : [];
    const quickWin = (sectorSkill.quick_win_score ?? 0) > 3;

    return (
        <div
            className="bg-white rounded-xl border transition-all hover:shadow-md"
            style={{
                borderColor: "#e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
        >
            <div className="flex flex-col lg:flex-row">
                {/* Left: Name + Description */}
                <div
                    className="flex-1 p-5 lg:p-6 flex flex-col justify-between lg:border-r"
                    style={{ borderColor: "#f1f5f9", minWidth: 0 }}
                >
                    <div>
                        <h3 className="text-[16px] font-bold text-heading mb-2 line-clamp-1">
                            {skill.name}
                        </h3>
                        <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mb-3">
                            {skill.description || "No description available."}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium"
                                    style={{
                                        backgroundColor: "#eff6ff",
                                        color: "#1d4ed8",
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                            {quickWin && (
                                <span
                                    className="px-2 py-0.5 rounded text-[11px] font-medium"
                                    style={{
                                        backgroundColor: "#ecfdf5",
                                        color: "#065f46",
                                    }}
                                >
                                    ⚡ Quick Win
                                </span>
                            )}
                        </div>
                    </div>

                    <Link
                        href={`/skills/${sectorSkill.skill_id}`}
                        className="text-[13px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                        View Details →
                    </Link>
                </div>

                {/* Right: Scores */}
                <div className="p-5 lg:p-6 lg:w-[320px] shrink-0 flex flex-col gap-3">
                    <h4 className="text-[12px] font-semibold text-heading mb-1 uppercase tracking-wide">
                        Scores
                    </h4>
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
        </div>
    );
}
