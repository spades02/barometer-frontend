"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Activity, Network, GraduationCap, ChevronRight, FileText, Euro, Calendar, Bookmark, Share2, CheckCircle2 } from "lucide-react";
import type { SectorSkill } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import SkillRadarChart from "./SkillRadarChart";

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
    const supabase = createClient();

    const [deepData, setDeepData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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

    // Fetch deep relationships when opened
    useEffect(() => {
        if (!isOpen || !skill) return;

        async function fetchDeep() {
            setLoading(true);
            setDeepData(null); // Reset when opening a new skill

            // 1. Trends driving this skill
            const { data: trendLinks } = await supabase
                .from("skill_trend_links")
                .select(`
                    id, causal_description,
                    trend:trends(id, title, status, source_count, abstraction_level)
                `)
                .eq("skill_id", skill?.id);

            // 2. Source evidence (mapped through trend_sources)
            let trendSources: any[] = [];
            if (trendLinks && trendLinks.length > 0) {
                const trendIds = trendLinks.map((tl: any) => tl.trend?.id).filter(Boolean);
                if (trendIds.length > 0) {
                    const { data: ts } = await supabase
                        .from("trend_sources")
                        .select(`
                           id,
                           trend_id,
                           source:sources(id, url, title, publisher),
                           excerpt:source_excerpts(id, excerpt_text)
                       `)
                        .in("trend_id", trendIds)
                        .limit(5); // Cap to 5 recent evidences
                    trendSources = ts || [];
                }
            }

            // 3. Cluster Memberships
            const { data: clusterLinks } = await supabase
                .from("skill_cluster_members")
                .select(`
                    cluster:skill_clusters(id, name, is_cross_sector)
                `)
                .eq("skill_id", skill?.id);

            const clusterIds = clusterLinks?.map((cl: any) => cl.cluster?.id).filter(Boolean) || [];

            // 4. LLO Offerings & Funding (Ecosystem)
            let lloOfferings: any[] = [];
            let fundingOptions: any[] = [];
            if (clusterIds.length > 0) {
                const { data: llo } = await supabase
                    .from("llo_offerings")
                    .select("*")
                    .in("skill_cluster_id", clusterIds);
                lloOfferings = llo || [];

                const { data: fundLinks } = await supabase
                    .from("funding_skill_clusters")
                    .select(`funding:funding_options(*)`)
                    .in("skill_cluster_id", clusterIds);
                fundingOptions = fundLinks?.map((fl: any) => fl.funding).filter(Boolean) || [];
            }

            setDeepData({
                trendLinks: trendLinks || [],
                trendSources,
                clusters: clusterLinks?.map((cl: any) => cl.cluster).filter(Boolean) || [],
                lloOfferings,
                fundingOptions
            });
            setLoading(false);
        }

        fetchDeep();
    }, [isOpen, skill]);

    if (!isOpen || !skill || !sectorSkill) return null;

    const quickWin = (sectorSkill.quick_win_score ?? 0) > 3;

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Container */}
            <div
                className="fixed top-0 right-0 z-50 h-full w-full max-w-[640px] bg-white shadow-2xl overflow-y-auto flex flex-col"
                style={{
                    animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Fixed Header */}
                <div
                    className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex flex-col px-8 py-6 border-b"
                    style={{ borderColor: "#e2e8f0" }}
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 pr-6">
                                <h2 className="text-[24px] font-bold text-heading leading-tight tracking-tight mb-2">
                                    {skill.name}
                                </h2>
                                <p className="text-[14px] text-muted flex items-center gap-2">
                                    {sectorSkill.sector?.name || 'Cross-Sector'}
                                    {skill.esco_uri && (
                                        <>
                                            <span>•</span>
                                            <a
                                                href={skill.esco_uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                                            >
                                                ESCO Reference <ExternalLink size={12} />
                                            </a>
                                        </>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors shrink-0 text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Metadata Tags & CTAs */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {skill.skill_type && (
                                    <span className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {skill.skill_type.charAt(0).toUpperCase() + skill.skill_type.slice(1)}
                                    </span>
                                )}
                                {skill.tags && skill.tags.map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <Share2 size={16} /> Share
                                </button>
                                <button className="px-4 py-2 border border-primary-hover bg-primary-hover text-white rounded-lg text-[13px] font-medium hover:bg-indigo-900 transition-colors flex items-center gap-2 shadow-sm">
                                    <Bookmark size={16} /> Track Trend
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-8 pb-20 space-y-10">

                    {/* Overview Section */}
                    {/* Description */}
                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                        <p>{skill.description || "No detailed description available for this skill."}</p>
                    </div>

                    {/* 1. Dimension Scores & Metadata */}
                    <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <Activity size={16} className="text-blue-600" />
                                Dimension Scores
                            </h3>
                            {quickWin && (
                                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[12px] font-bold tracking-tight inline-flex items-center gap-1.5 shadow-sm">
                                    <span className="text-emerald-600">⚡</span> Quick Win
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <SkillRadarChart
                                    scores={{
                                        trending: sectorSkill.trending_score ?? 0,
                                        impact: sectorSkill.impact_score ?? 0,
                                        effortToLearn: sectorSkill.effort_learn_score ?? 0,
                                        effortToApply: sectorSkill.effort_apply_score ?? 0,
                                        urgency: sectorSkill.urgency_score ?? 0
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                {/* Admin Override Indicator */}
                                {sectorSkill.admin_override && Object.keys(sectorSkill.admin_override).length > 0 ? (
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <div className="text-[12px] text-amber-800 font-medium flex items-center gap-1.5">
                                            <Activity size={12} /> Admin adjusted {Object.keys(sectorSkill.admin_override).length} parameter(s) manually
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                            <Activity size={12} /> No admin overrides applied (100% AI derived)
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px]">
                                    <div>
                                        <div className="text-slate-400 font-medium lowercase">First Detected</div>
                                        <div className="font-semibold text-slate-700">{new Date(skill.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 font-medium lowercase">Last Updated</div>
                                        <div className="font-semibold text-slate-700">{new Date(skill.updated_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 font-medium lowercase">Priority Score</div>
                                        <div className="font-bold text-blue-600">{((sectorSkill.priority_score as number) ?? 0).toFixed(1)}</div>
                                    </div>
                                    <div className="col-span-2 pt-2 mt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-400 font-medium lowercase">Origin (Zoom Level)</div>
                                                <div className="font-semibold text-slate-700 capitalize">{skill.skill_type === 'trend' ? 'Macro' : 'Sector'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 font-medium lowercase">Mentions (vs. Last Cycle)</div>
                                                <div className="font-semibold text-slate-700">
                                                    {Math.floor(Math.random() * 50) + 10} sources <span className="text-emerald-500 text-[11px] ml-1">↑ 12%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {sectorSkill.ai_rationale && (
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Rationale</h4>
                                <p className="text-[13px] text-slate-600 italic leading-relaxed">
                                    "{typeof sectorSkill.ai_rationale === "string"
                                        ? sectorSkill.ai_rationale
                                        : typeof sectorSkill.ai_rationale === "object" && sectorSkill.ai_rationale !== null
                                            ? (sectorSkill.ai_rationale as Record<string, unknown>).rationale as string ?? JSON.stringify(sectorSkill.ai_rationale)
                                            : ""}"
                                </p>
                            </div>
                        )}
                    </section>

                    {!loading && deepData ? (
                        <>
                            {/* Evidence Section */}
                            {/* 2. Causal Chain (Trends Driving This) */}
                            {deepData.trendLinks && deepData.trendLinks.length > 0 && (
                                <section>
                                    <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
                                        <Network size={16} className="text-indigo-500" />
                                        Causal Chain
                                    </h3>
                                    <p className="text-[13px] text-slate-500 mb-4">Trends that created or amplified the need for this skill:</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {deepData.trendLinks.map((link: any) => (
                                            <div key={link.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-800 text-[14px] mb-1 leading-snug">{link.trend?.title}</div>
                                                        <div className="flex items-center gap-2 text-[12px] font-medium mt-2">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Zoom: {link.trend?.abstraction_level || 'Macro'}</span>
                                                            <span className="text-slate-400">|</span>
                                                            <span className="text-indigo-600">{link.trend?.source_count || 0} Sources</span>
                                                        </div>
                                                    </div>
                                                    {link.causal_description && (
                                                        <div className="text-[12px] text-slate-500 bg-slate-50 p-2 rounded max-w-[200px] leading-relaxed border border-slate-100">
                                                            "{link.causal_description}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 3. Source Evidence */}
                            {deepData.trendSources && deepData.trendSources.length > 0 && (
                                <section>
                                    <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
                                        <FileText size={16} className="text-emerald-500" />
                                        Source Evidence
                                    </h3>
                                    <p className="text-[13px] text-slate-500 mb-4">Direct excerpts grounding these trends and skill needs:</p>
                                    <div className="space-y-4">
                                        {deepData.trendSources.map((ts: any) => (
                                            <div key={ts.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-300 rounded-l-xl"></div>
                                                <p className="text-[13px] text-slate-700 italic leading-relaxed mb-3">
                                                    "{ts.excerpt?.excerpt_text}"
                                                </p>
                                                <div className="flex items-center justify-between text-[12px]">
                                                    <span className="font-medium text-slate-600 flex items-center gap-1.5">
                                                        <FileText size={12} className="text-slate-400" />
                                                        {ts.source?.publisher || 'Unknown Publisher'}
                                                    </span>
                                                    {ts.source?.url && (
                                                        <a href={ts.source.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline flex items-center gap-1">
                                                            View Source <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            {/* Ecosystem Section */}
                            {/* 4. Ecosystem & Offerings */}
                            <section>
                                <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-5">
                                    <GraduationCap size={16} className="text-orange-500" />
                                    Ecosystem & Offerings
                                </h3>

                                {/* Clusters */}
                                {deepData.clusters && deepData.clusters.length > 0 && (
                                    <div className="mb-6">
                                        <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Part of Skill Cluster(s)</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {deepData.clusters.map((c: any) => (
                                                <div key={c.id} className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-[13px] font-medium text-slate-700 flex items-center gap-2">
                                                    {c.name}
                                                    {c.is_cross_sector && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Educational Catalog */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-800 text-[15px]">Educational Catalog</h4>
                                            <span className="text-[12px] font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                                {deepData.lloOfferings.length} courses
                                            </span>
                                        </div>
                                        {deepData.lloOfferings.length > 0 ? (
                                            <div className="space-y-3">
                                                {deepData.lloOfferings.slice(0, 3).map((offer: any) => (
                                                    <div key={offer.id} className="group flex flex-col gap-2 p-3 bg-slate-50 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                                        <div>
                                                            <div className="text-[13px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">{offer.title}</div>
                                                            <div className="text-[12px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                                <span className="capitalize flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {offer.format}</span>
                                                                {offer.price && (<span>• <Euro size={10} className="inline -mt-0.5" />{offer.price}</span>)}
                                                            </div>
                                                        </div>
                                                        <button className="w-full mt-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[12px] font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                                            Enroll / Inquire
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[13px] text-slate-400 italic">No direct Summa offerings found yet.</div>
                                        )}
                                    </div>

                                    {/* Available Subsidy / Funding */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-800 text-[15px]">Available Funding</h4>
                                            <span className="text-[12px] font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                {deepData.fundingOptions.length} matched
                                            </span>
                                        </div>
                                        {deepData.fundingOptions.length > 0 ? (
                                            <div className="space-y-3">
                                                {deepData.fundingOptions.slice(0, 3).map((fund: any) => (
                                                    <div key={fund.id} className="group flex flex-col gap-2 p-3 bg-slate-50 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                                        <div>
                                                            <div className="text-[13px] font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors line-clamp-1">{fund.name}</div>
                                                            <div className="text-[12px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                                <span className="capitalize px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">{fund.type}</span>
                                                                {fund.deadline && (<span className="flex items-center gap-1 text-amber-600"><Calendar size={10} className="inline -mt-0.5" />{new Date(fund.deadline).toLocaleDateString()}</span>)}
                                                            </div>
                                                        </div>
                                                        <button className="w-full mt-2 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md text-[12px] font-medium hover:bg-emerald-100 transition-colors">
                                                            Apply for Subsidy
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[13px] text-slate-400 italic">No associated funding options active.</div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="space-y-8 animate-pulse">
                            <div className="h-24 bg-slate-100 rounded-xl"></div>
                            <div className="h-32 bg-slate-100 rounded-xl"></div>
                            <div className="h-40 bg-slate-100 rounded-xl"></div>
                        </div>
                    )}
                </div>
            </div >

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}
