import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ScoreBar from "@/components/ScoreBar";

interface SkillDetailProps {
    params: Promise<{ id: string }>;
}

export default async function SkillDetailPage({ params }: SkillDetailProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch skill
    const { data: skill } = await supabase
        .from("skills")
        .select("*")
        .eq("id", id)
        .single();

    if (!skill) notFound();

    // Fetch sector_skills with sector info
    const { data: sectorSkills } = await supabase
        .from("sector_skills")
        .select("*, sector:sectors(name)")
        .eq("skill_id", id);

    // Fetch related trends
    const { data: trendLinks } = await supabase
        .from("skill_trend_links")
        .select("*, trend:trends(*)")
        .eq("skill_id", id);

    const bestScore = sectorSkills?.[0];

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <div className="flex items-center gap-2 mb-2 text-[12px] text-subtle">
                    <span>Skills Library</span>
                    <span>›</span>
                    <span className="text-muted">{skill.name}</span>
                </div>
                <h2 className="text-[20px] font-bold text-heading">
                    {skill.name}
                </h2>
            </div>

            <div className="px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div
                            className="bg-white rounded-xl border p-6"
                            style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                        >
                            <h3 className="text-[14px] font-semibold text-heading mb-3">
                                Description
                            </h3>
                            <p className="text-[14px] text-text leading-relaxed">
                                {skill.description || "No description available for this skill."}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {skill.skill_type && (
                                    <span
                                        className="px-2.5 py-1 rounded text-[11px] font-medium"
                                        style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                                    >
                                        {skill.skill_type}
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
                        </div>

                        {/* Scores by sector */}
                        {bestScore && (
                            <div
                                className="bg-white rounded-xl border p-6"
                                style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                            >
                                <h3 className="text-[14px] font-semibold text-heading mb-4">
                                    Scores
                                </h3>
                                <div className="space-y-3">
                                    <ScoreBar label="Trending" score={bestScore.trending_score ?? 0} />
                                    <ScoreBar label="Impact" score={bestScore.impact_score ?? 0} />
                                    <ScoreBar label="Urgency" score={bestScore.urgency_score ?? 0} />
                                    <ScoreBar label="Priority" score={bestScore.priority_score ?? 0} />
                                    <ScoreBar label="Quick Win" score={bestScore.quick_win_score ?? 0} />
                                </div>

                                {bestScore.ai_rationale && (
                                    <div className="mt-4 p-4 rounded-lg bg-surface">
                                        <h4 className="text-[12px] font-semibold text-heading mb-2">
                                            AI Rationale
                                        </h4>
                                        <p className="text-[13px] text-text leading-relaxed">
                                            {bestScore.ai_rationale}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Related Trends */}
                        {trendLinks && trendLinks.length > 0 && (
                            <div
                                className="bg-white rounded-xl border p-6"
                                style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                            >
                                <h3 className="text-[14px] font-semibold text-heading mb-4">
                                    Related Trends
                                </h3>
                                <div className="space-y-3">
                                    {trendLinks.map((link: Record<string, unknown>) => {
                                        const trend = link.trend as Record<string, unknown> | null;
                                        if (!trend) return null;
                                        return (
                                            <div
                                                key={link.id as string}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                                    style={{ backgroundColor: "#3b82f6" }}
                                                />
                                                <div>
                                                    <p className="text-[14px] font-medium text-heading">
                                                        {trend.title as string}
                                                    </p>
                                                    <p className="text-[12px] text-muted mt-0.5">
                                                        {trend.status as string}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* Sectors */}
                        <div
                            className="bg-white rounded-xl border p-6"
                            style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                        >
                            <h3 className="text-[14px] font-semibold text-heading mb-3">
                                Present in Sectors
                            </h3>
                            <div className="space-y-2">
                                {sectorSkills?.map((ss: Record<string, unknown>) => {
                                    const sector = ss.sector as Record<string, unknown> | null;
                                    return (
                                        <div
                                            key={ss.id as string}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-surface"
                                        >
                                            <span className="text-[13px] text-text">
                                                {sector?.name as string ?? "Unknown"}
                                            </span>
                                            <span
                                                className="text-[12px] font-semibold"
                                                style={{ color: "#1d4ed8" }}
                                            >
                                                {((ss.priority_score as number) ?? 0).toFixed(1)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Win badge */}
                        {bestScore && (bestScore.quick_win_score ?? 0) > 3 && (
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
                                    This skill has a high quick-win score, making it ideal for
                                    rapid implementation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
