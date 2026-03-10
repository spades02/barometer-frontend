"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { SectorSkill } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useSavedItems } from "@/lib/saved-items-context";
import {
  PriorityMatrixCard,
  TrendingVelocityCard,
  SkillLandscapeCard,
  UrgencyHeatmapCard,
  ChartModal,
  type ChartSkill,
} from "./DashboardWidgets";

// ── TYPES ─────────────────────────────────────────────────────────────────

interface DashboardSkill {
  id: string;
  name: string;
  desc: string;
  type: string;
  status: "Emerging" | "Established" | "Declining";
  sector: string;
  priority: number;
  impact: number;
  effort: number;
  trending: number;
  urgency: number;
  quickWin: boolean;
  trendCount: number;
  sourceCount: number;
  sparkline: number[];
  summaRecommended: boolean;
  reason: "trending" | "quickwin" | "urgent" | "priority";
  category: string;
  horizon: string;
  mentions: number[];
  sectorSkill: SectorSkill;
}

interface DashboardProps {
  sectorSkills: SectorSkill[];
  sectors: string[];
  stats: { totalSkills: number; totalTrends: number; totalSources: number };
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────

const impactOptions = ["Very High (9–10)", "High (7–8)", "Medium (5–6)", "Low (1–4)"];
const effortOptions = ["Very Low (1–2)", "Low (3–4)", "Medium (5–6)", "High (7–10)"];
const horizonOptions = ["< 6 months", "6–12 months", "1–2 years", "2+ years"];
const PAGE_SIZE = 6;
const HIGHLIGHT_PAGE_SIZE = 9;

const reasonLabels: Record<string, { label: string; color: string }> = {
  trending: { label: "Fast rising", color: "#2563eb" },
  quickwin: { label: "Quick win", color: "#d97706" },
  urgent: { label: "Urgent", color: "#dc2626" },
  priority: { label: "Top priority", color: "#374151" },
};

// ── HELPERS ───────────────────────────────────────────────────────────────

function generateSparkline(current: number, status: string): number[] {
  const n = 10;
  const r: number[] = [];
  if (status === "Emerging") {
    for (let i = 0; i < n; i++) { const p = i / (n - 1); r.push(+(current * 0.3 + current * 0.7 * p).toFixed(1)); }
  } else if (status === "Declining") {
    for (let i = 0; i < n; i++) { const p = i / (n - 1); const s = Math.min(current * 2.2, 10); r.push(+(s - (s - current) * p).toFixed(1)); }
  } else {
    for (let i = 0; i < n; i++) r.push(+(current - 0.2 + Math.random() * 0.4).toFixed(1));
    r[n - 1] = +current.toFixed(1);
  }
  return r;
}

function inferCategory(name: string, type: string): string {
  const l = (name + " " + type).toLowerCase();
  if (/\b(ai|artificial|digital|cyber|automat|machine|robot|smart|iot)\b/.test(l)) return "AI & Digitalisation";
  if (/\b(sustain|circular|green|environ|climate|esg|recycl)\b/.test(l)) return "Sustainability";
  if (/\b(customer|patient|omnichannel|ux|user.exp|care|service)\b/.test(l)) return "Customer Experience";
  if (/\b(data|analy|inventor|predict|statist|bi|metric)\b/.test(l)) return "Data & Analytics";
  if (/\b(lead|manage|lean|process|agile|change|coach)\b/.test(l)) return "Leadership";
  return "AI & Digitalisation";
}

function generateMentions(sourceCount: number): number[] {
  const n = 7;
  const r: number[] = [];
  for (let i = 0; i < n; i++) {
    r.push(Math.max(1, Math.round(sourceCount * (0.3 + 0.7 * (i / (n - 1))) + (Math.random() * 2 - 1))));
  }
  r[n - 1] = sourceCount;
  return r;
}

function transformSectorSkill(ss: SectorSkill, index: number): DashboardSkill {
  const skill = ss.skill!;
  const trending = ss.trending_score ?? 0;
  const impact = ss.impact_score ?? 0;
  const effortL = ss.effort_learn_score ?? 5;
  const effortA = ss.effort_apply_score ?? 5;
  const effort = +((effortL + effortA) / 2).toFixed(1);
  const urgency = ss.urgency_score ?? 0;
  const priority = ss.priority_score ?? 0;
  const qw = ss.quick_win_score ?? 0;

  let status: "Emerging" | "Established" | "Declining";
  if (trending >= 7) status = "Emerging";
  else if (trending < 3) status = "Declining";
  else status = "Established";

  let reason: "trending" | "quickwin" | "urgent" | "priority";
  if (trending >= 7 && qw > 3) reason = "trending";
  else if (qw > 3) reason = "quickwin";
  else if (urgency >= 8) reason = "urgent";
  else reason = "priority";

  const category = inferCategory(skill.name, skill.skill_type || "");

  let horizon: string;
  if (urgency >= 8) horizon = "< 6 months";
  else if (urgency >= 6) horizon = "6–12 months";
  else if (urgency >= 4) horizon = "1–2 years";
  else horizon = "2+ years";

  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "General";

  return {
    id: ss.id, name: skill.name,
    desc: skill.description || "No description available.",
    type: cap(skill.skill_type || "general"),
    status, sector: ss.sector?.name || "Cross-Sector",
    priority, impact, effort, trending, urgency,
    quickWin: qw > 3,
    trendCount: Math.max(5, Math.floor(trending * 3)),
    sourceCount: Math.max(8, Math.floor(impact * 4)),
    sparkline: generateSparkline(priority, status),
    summaRecommended: index === 0,
    reason, category, horizon,
    mentions: generateMentions(Math.max(8, Math.floor(impact * 4))),
    sectorSkill: ss,
  };
}

// ── MICRO COMPONENTS ──────────────────────────────────────────────────────

const Spark = ({ data, declining, w = 52, h = 22 }: { data: number[]; declining: boolean; w?: number; h?: number }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 5) - 2}`).join(" ");
  const c = declining ? "#d1d5db" : "#111827";
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * (h - 5) - 2} r="2.5" fill={c} />
    </svg>
  );
};

const Bars = ({ value, declining }: { value: number; declining: boolean }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 18 }}>
    {[...Array(7)].map((_, i) => {
      const filled = value >= (i + 1) / 7 * 10;
      return <div key={i} style={{ width: 3, height: 5 + i * 1.8, borderRadius: 2, background: filled ? (declining ? "#d1d5db" : "#111827") : "#f0f0f0" }} />;
    })}
  </div>
);

const StatusDot = ({ status }: { status: string }) => {
  const c = status === "Emerging" ? "#059669" : status === "Declining" ? "#9ca3af" : "#2563eb";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />{status}
    </span>
  );
};

const TypeTag = ({ type }: { type: string }) => (
  <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>{type}</span>
);

const MiniBarChart = ({ data, w = 70, h = 20 }: { data: number[]; w?: number; h?: number }) => {
  const max = Math.max(...data, 1);
  const barW = Math.floor((w - (data.length - 1) * 2) / data.length);
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * (h - 2));
        return <rect key={i} x={i * (barW + 2)} y={h - bh} width={barW} height={bh} rx="1.5" fill={i === data.length - 1 ? "#111827" : "#d1d5db"} />;
      })}
    </svg>
  );
};

const ScoreBarMini = ({ label, value, declining }: { label: string; value: number; declining: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 11, color: "#9ca3af", width: 52, flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1, height: 3, background: "#f0f0f0", borderRadius: 99 }}>
      <div style={{ height: "100%", width: `${value * 10}%`, background: declining ? "#d1d5db" : "#111827", borderRadius: 99 }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: declining ? "#9ca3af" : "#374151", minWidth: 24, textAlign: "right" as const }}>{value.toFixed(1)}</span>
  </div>
);

// ── MULTI-SELECT DROPDOWN ─────────────────────────────────────────────────

const MultiDropdown = ({ label, options, values, onChange }: {
  label: string; options: string[]; values: string[]; onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = values.length > 0;
  const toggle = (opt: string) => onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, background: active ? "#111827" : "white",
        border: `1.5px solid ${active ? "#111827" : "#e5e7eb"}`, color: active ? "white" : "#374151",
        padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "inherit",
        cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all 0.15s", minWidth: 120, justifyContent: "space-between",
      }}>
        <span>{active ? `${label} (${values.length})` : label}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, background: "white",
          border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          zIndex: 200, minWidth: 210, overflow: "hidden",
        }}>
          {options.map(opt => {
            const sel = values.includes(opt);
            return (
              <button key={opt} onClick={() => toggle(opt)} style={{
                display: "flex", alignItems: "center", width: "100%", padding: "10px 14px",
                background: sel ? "#f9fafb" : "white", border: "none", borderBottom: "1px solid #f9fafb",
                color: sel ? "#111827" : "#374151", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                textAlign: "left" as const, transition: "background 0.1s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={e => (e.currentTarget.style.background = sel ? "#f9fafb" : "white")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${sel ? "#111827" : "#d1d5db"}`,
                    background: sel ? "#111827" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {sel && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  {opt}
                </div>
              </button>
            );
          })}
          {active && (
            <button onClick={() => onChange([])} style={{
              width: "100%", padding: "8px 14px", background: "none", border: "none",
              borderTop: "1px solid #f3f4f6", color: "#9ca3af", fontSize: 12, fontFamily: "inherit",
              cursor: "pointer", textAlign: "left" as const,
            }}>Clear</button>
          )}
        </div>
      )}
    </div>
  );
};

// ── SEARCH OVERLAY ────────────────────────────────────────────────────────

const SearchOverlay = ({ skills, onClose, onSelect }: {
  skills: DashboardSkill[]; onClose: () => void; onSelect: (s: DashboardSkill) => void;
}) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const results = q.length > 1 ? skills.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.category.toLowerCase().includes(q.toLowerCase()) ||
    s.sector.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 6) : [];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300,
      display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 100, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        width: "min(640px,90vw)", background: "white", borderRadius: 16,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "18px 20px",
          borderBottom: results.length || q.length ? "1px solid #f3f4f6" : "none",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M13 13l2.5 2.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search skills, categories, sectors…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "#111827", fontFamily: "inherit", background: "transparent" }}
          />
          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", color: "#6b7280", padding: "4px 10px",
            borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 500,
          }}>esc</button>
        </div>
        {results.length > 0 && results.map(s => (
          <button key={s.id} onClick={() => { onSelect(s); onClose(); }} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            padding: "13px 20px", background: "white", border: "none", borderBottom: "1px solid #f9fafb",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "background 0.1s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{s.sector} · {s.category} · {s.type}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StatusDot status={s.status} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>{s.priority.toFixed(1)}</span>
            </div>
          </button>
        ))}
        {q.length > 1 && results.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No skills found for &ldquo;{q}&rdquo;</div>
        )}
        {q.length === 0 && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 10 }}>Suggested</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["AI & Digitalisation", "Sustainability", "Quick wins", "Emerging"].map(tag => (
                <button key={tag} onClick={() => setQ(tag)} style={{
                  background: "#f3f4f6", border: "none", color: "#6b7280", padding: "6px 13px",
                  borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
                >{tag}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── SKILL DETAIL ──────────────────────────────────────────────────────────

const SkillDetail = ({ skill, onClose }: { skill: DashboardSkill; onClose: () => void }) => {
  const [saved, setSaved] = useState(false);
  const [openScore, setOpenScore] = useState<string | null>(null);
  const [showTrends, setShowTrends] = useState(false);
  const [deepData, setDeepData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const dec = skill.status === "Declining";

  useEffect(() => {
    let mounted = true;
    async function fetchDeep() {
      setLoading(true);
      setDeepData(null);
      const skillId = skill.sectorSkill.skill?.id;
      if (!skillId) { setLoading(false); return; }

      const { data: trendLinks } = await supabase
        .from("skill_trend_links")
        .select("id, causal_description, trend:trends(id, title, status, source_count, abstraction_level)")
        .eq("skill_id", skillId);

      let trendSources: any[] = [];
      if (trendLinks && trendLinks.length > 0) {
        const trendIds = trendLinks.map((tl: any) => tl.trend?.id).filter(Boolean);
        if (trendIds.length > 0) {
          const { data: ts } = await supabase
            .from("trend_sources")
            .select("id, trend_id, source:sources(id, url, title, publisher, authority_score, publication_date), excerpt:source_excerpts(id, excerpt_text)")
            .in("trend_id", trendIds)
            .limit(5);
          trendSources = ts || [];
        }
      }

      const { data: clusterLinks } = await supabase
        .from("skill_cluster_members")
        .select("cluster:skill_clusters(id, name, is_cross_sector)")
        .eq("skill_id", skillId);
      const clusterIds = clusterLinks?.map((cl: any) => cl.cluster?.id).filter(Boolean) || [];

      let lloOfferings: any[] = [];
      let fundingOptions: any[] = [];
      if (clusterIds.length > 0) {
        const { data: llo } = await supabase.from("llo_offerings").select("*").in("skill_cluster_id", clusterIds);
        lloOfferings = llo || [];
        const { data: fundLinks } = await supabase.from("funding_skill_clusters").select("funding:funding_options(*)").in("skill_cluster_id", clusterIds);
        fundingOptions = fundLinks?.map((fl: any) => fl.funding).filter(Boolean) || [];
      }

      if (mounted) {
        setDeepData({ trendLinks: trendLinks || [], trendSources, lloOfferings, fundingOptions });
        setLoading(false);
      }
    }
    fetchDeep();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id]);

  const scoreR: Record<string, string> = {
    Impact: skill.sectorSkill.ai_rationale
      ? (typeof skill.sectorSkill.ai_rationale === "string" ? skill.sectorSkill.ai_rationale : "Based on cross-sector analysis and source consensus.")
      : "Appears across multiple sectors with strong source consensus. Missing this skill creates direct operational risk.",
    Effort: "Learnable in under 12 hours of structured training. No prior technical knowledge required for most roles.",
    Trending: "Source mentions increased significantly over last 3 sweeps. Signal accelerating, not plateauing.",
    Urgency: "Competitive and regulatory pressure converging. Early adopters already gaining measurable advantage.",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <StatusDot status={skill.status} /><span style={{ fontSize: 12, color: "#d1d5db" }}>·</span>
              <TypeTag type={skill.type} /><span style={{ fontSize: 12, color: "#d1d5db" }}>·</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{skill.sector}</span>
              {skill.quickWin && <><span style={{ fontSize: 12, color: "#d1d5db" }}>·</span><span style={{ fontSize: 12, fontWeight: 600, color: "#d97706", background: "#fffbeb", padding: "2px 10px", borderRadius: 20 }}>⚡ Quick win</span></>}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", lineHeight: 1.2, letterSpacing: "-0.025em" }}>{skill.name}</h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setSaved(!saved)} style={{
              display: "flex", alignItems: "center", gap: 5, background: saved ? "#f0fdf4" : "none",
              border: `1px solid ${saved ? "#bbf7d0" : "#e5e7eb"}`, color: saved ? "#15803d" : "#6b7280",
              padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
            }}>{saved ? "✓ Saved" : "♡ Save"}</button>
            <button onClick={onClose} style={{
              background: "#f3f4f6", border: "none", color: "#6b7280", width: 34, height: 34,
              borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 36px" }}>
        {/* Description */}
        <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.75, marginBottom: 14 }}>{skill.desc}</p>
        </div>

        {/* Stats summary */}
        <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", border: "1px solid #f3f4f6", borderRadius: 12, overflow: "hidden" }}>
            {[
              { label: "Priority", value: skill.priority.toFixed(1), sub: "impact ÷ effort", visual: <Spark data={skill.sparkline} declining={dec} /> },
              { label: "Trending", value: skill.trending.toFixed(1), sub: "score", visual: <Bars value={skill.trending} declining={dec} /> },
              { label: "Evidence", value: String(skill.sourceCount), sub: `${skill.trendCount} trends`, visual: null },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "14px 16px", borderRight: i < 2 ? "1px solid #f3f4f6" : "none", background: "#fafafa" }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6 }}>{s.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 3 }}>{s.sub}</div>
                  </div>
                  {s.visual}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this skill matters */}
        {!loading && deepData && deepData.trendLinks.length > 0 && (
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>Why this skill matters</div>
            {deepData.trendLinks.slice(0, 2).map((link: any, i: number) => (
              <div key={link.id} style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#f3f4f6", border: "1px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6b7280", flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ width: 1, flex: 1, minHeight: 18, background: "#e5e7eb", margin: "3px 0" }} />
                </div>
                <div style={{ paddingBottom: 14, flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>{link.trend?.abstraction_level || "Macro"} · {link.trend?.source_count || 0} sources</div>
                  <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, lineHeight: 1.45 }}>{link.trend?.title}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />
              </div>
              <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 13px" }}>
                <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Derived skill</div>
                <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{skill.name}</div>
              </div>
            </div>
            <button onClick={() => setShowTrends(!showTrends)} style={{
              background: "none", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 8,
              padding: "8px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", width: "100%", marginTop: 10,
            }}>{showTrends ? "Hide contributing trends" : `Show all ${skill.trendCount} contributing trends`}</button>
            {showTrends && (
              <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280", background: "#f9fafb", borderRadius: 8, padding: "12px 14px", lineHeight: 1.7 }}>
                {deepData.trendLinks.map((link: any) => (
                  <div key={link.id} style={{ marginBottom: 4 }}>• {link.trend?.title} ({link.trend?.source_count || 0} sources)</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scores */}
        <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 14 }}>Scores</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { l: "Impact", v: skill.impact },
              { l: "Effort", v: skill.effort },
              { l: "Trending", v: skill.trending },
              { l: "Urgency", v: skill.urgency },
            ].map(s => (
              <div key={s.l} onClick={() => setOpenScore(openScore === s.l ? null : s.l)} style={{
                background: "#f9fafb", border: `1px solid ${openScore === s.l ? "#e5e7eb" : "#f3f4f6"}`,
                borderRadius: 12, padding: "14px 15px", cursor: "pointer",
              }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>{s.l}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v.toFixed(1)}</div>
                  <Bars value={s.v} declining={dec} />
                </div>
                <div style={{ height: 3, background: "#e5e7eb", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${s.v * 10}%`, background: dec ? "#d1d5db" : "#111827", borderRadius: 99 }} />
                </div>
                {openScore === s.l && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280", lineHeight: 1.65, borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>{scoreR[s.l]}</div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 8 }}>Click any score to see AI reasoning</p>
        </div>

        {/* Evidence */}
        {!loading && deepData && deepData.trendSources.length > 0 && (
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Evidence</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{skill.sourceCount} sources · {skill.trendCount} trends</div>
            </div>
            {deepData.trendSources.map((ts: any) => (
              <div key={ts.id} style={{ border: "1px solid #f3f4f6", borderRadius: 10, padding: 14, marginBottom: 8, cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={el => (el.currentTarget.style.borderColor = "#e5e7eb")}
                onMouseLeave={el => (el.currentTarget.style.borderColor = "#f3f4f6")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{ts.source?.title || "Unknown Source"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {ts.source?.publisher || "Unknown"} · {ts.source?.publication_date ? new Date(ts.source.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}
                    </div>
                  </div>
                  {ts.source?.authority_score && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: 6, flexShrink: 0, marginLeft: 10 }}>
                      {ts.source.authority_score}/10
                    </span>
                  )}
                </div>
                {ts.excerpt?.excerpt_text && (
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65, borderLeft: "2px solid #e5e7eb", paddingLeft: 10, marginBottom: 8 }}>
                    &ldquo;{ts.excerpt.excerpt_text}&rdquo;
                  </p>
                )}
                {ts.source?.url && (
                  <a href={ts.source.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#9ca3af", textDecoration: "none" }}>View source →</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Training */}
        {!loading && deepData && deepData.lloOfferings.length > 0 && (
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 12 }}>Available training</div>
            {deepData.lloOfferings.slice(0, 3).map((offer: any) => (
              <div key={offer.id} style={{
                background: "#111827", borderRadius: 10, padding: "14px 16px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1f2937")}
                onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2 }}>{offer.title}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{offer.format || "Online"} · {offer.duration || "Self-paced"}</div>
                </div>
                <span style={{ color: "#6b7280", fontSize: 14 }}>→</span>
              </div>
            ))}
          </div>
        )}

        {/* Funding */}
        {!loading && deepData && deepData.fundingOptions.length > 0 && (
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 12 }}>Funding</div>
            {deepData.fundingOptions.map((f: any, i: number) => (
              <div key={f.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0",
                borderBottom: i < deepData.fundingOptions.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {f.deadline ? `Deadline ${new Date(f.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Open"}
                  </div>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
                    {f.max_amount ? `€${f.max_amount.toLocaleString()}` : "Variable"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ paddingTop: 20 }}>
            {[60, 100, 80].map((h, i) => (
              <div key={i} style={{ height: h, background: "#f3f4f6", borderRadius: 12, marginBottom: 12 }} className="animate-pulse" />
            ))}
          </div>
        )}

        {/* Export */}
        <div style={{ paddingTop: 20 }}>
          <button style={{
            width: "100%", background: "#111827", border: "none", color: "white", borderRadius: 10,
            padding: 14, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1f2937")}
            onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
          >Export summary as PDF</button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────

export default function Dashboard({ sectorSkills, sectors, stats }: DashboardProps) {
  const [view, setView] = useState("highlights");
  const [selectedSkill, setSelectedSkill] = useState<DashboardSkill | null>(null);
  const [panelMounted, setPanelMounted] = useState(false);
  const [sortBy, setSortBy] = useState("priority");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  const [fSector, setFSector] = useState<string[]>([]);
  const [fImpact, setFImpact] = useState<string[]>([]);
  const [fEffort, setFEffort] = useState<string[]>([]);
  const [fHorizon, setFHorizon] = useState<string[]>([]);
  const [fQW, setFQW] = useState(false);
  const [searchQ] = useState("");

  const { isSaved: isItemSaved, toggleSave: toggleSaveItem } = useSavedItems();

  useEffect(() => { setTimeout(() => setChartsLoaded(true), 100); }, []);

  const allSkills = useMemo(() =>
    sectorSkills.filter(ss => ss.skill).map((ss, i) => transformSectorSkill(ss, i)),
    [sectorSkills]
  );

  const openSkill = (s: DashboardSkill) => { setSelectedSkill(s); setTimeout(() => setPanelMounted(true), 20); };
  const closeSkill = () => { setPanelMounted(false); setTimeout(() => setSelectedSkill(null), 420); };

  const impactInRange = (v: number, opts: string[]) => {
    if (!opts.length) return true;
    return opts.some(o => {
      if (o.includes("9–10")) return v >= 9;
      if (o.includes("7–8")) return v >= 7 && v < 9;
      if (o.includes("5–6")) return v >= 5 && v < 7;
      if (o.includes("1–4")) return v < 5;
      return true;
    });
  };
  const effortInRange = (v: number, opts: string[]) => {
    if (!opts.length) return true;
    return opts.some(o => {
      if (o.includes("1–2")) return v <= 2;
      if (o.includes("3–4")) return v >= 3 && v <= 4;
      if (o.includes("5–6")) return v >= 5 && v <= 6;
      if (o.includes("7–10")) return v >= 7;
      return true;
    });
  };
  const clearAll = () => { setFSector([]); setFImpact([]); setFEffort([]); setFHorizon([]); setFQW(false); };
  const activeCount = [fSector, fImpact, fEffort, fHorizon].filter(a => a.length > 0).length + (fQW ? 1 : 0);

  const filtered = allSkills
    .filter(s => fSector.length ? fSector.includes(s.sector) : true)
    .filter(s => impactInRange(s.impact, fImpact))
    .filter(s => effortInRange(s.effort, fEffort))
    .filter(s => fHorizon.length ? fHorizon.includes(s.horizon) : true)
    .filter(s => fQW ? s.quickWin : s.status !== "Declining")
    .filter(s => searchQ ? s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.category.toLowerCase().includes(searchQ.toLowerCase()) : true)
    .sort((a, b) => sortBy === "priority" ? b.priority - a.priority : sortBy === "trending" ? b.trending - a.trending : b.urgency - a.urgency);

  const currentPageSize = view === "highlights" ? HIGHLIGHT_PAGE_SIZE : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice((page - 1) * currentPageSize, page * currentPageSize);

  const chartSkills: ChartSkill[] = allSkills.map(s => ({
    id: s.id, name: s.name, status: s.status, impact: s.impact,
    effort: s.effort, trending: s.trending, urgency: s.urgency,
    quickWin: s.quickWin, type: s.type,
  }));

  const selectedTags = [
    ...fSector.map(v => ({ label: v, clear: () => setFSector(fSector.filter(x => x !== v)) })),
    ...fImpact.map(v => ({ label: `Impact: ${v}`, clear: () => setFImpact(fImpact.filter(x => x !== v)) })),
    ...fEffort.map(v => ({ label: `Effort: ${v}`, clear: () => setFEffort(fEffort.filter(x => x !== v)) })),
    ...fHorizon.map(v => ({ label: `Horizon: ${v}`, clear: () => setFHorizon(fHorizon.filter(x => x !== v)) })),
    ...(fQW ? [{ label: "Quick wins only", clear: () => setFQW(false) }] : []),
  ];

  const topTrending = allSkills.length > 0
    ? [...allSkills].sort((a, b) => b.trending - a.trending)[0]?.name || "N/A"
    : "N/A";

  return (
    <div style={{ fontFamily: "var(--font-inter), 'Inter', -apple-system, sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      <style>{`
        .db-view-btn{background:none;border:none;color:#9ca3af;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;padding:6px 12px;border-radius:6px;transition:all 0.15s;}
        .db-view-btn.active{background:white;color:#111827;box-shadow:0 1px 3px rgba(0,0,0,0.08);}
        .db-sort-btn{background:none;border:none;color:#9ca3af;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;padding:5px 10px;border-radius:6px;transition:all 0.15s;}
        .db-sort-btn.active{color:#111827;background:#f3f4f6;}
        .db-sort-btn:hover:not(.active){color:#374151;}
        .db-h-card{background:white;border:1px solid #ececec;border-radius:14px;padding:20px;cursor:pointer;transition:all 0.18s;}
        .db-h-card:hover{border-color:#d1d5db;box-shadow:0 4px 16px rgba(0,0,0,0.07);transform:translateY(-2px);}
        .db-h-card.recommended{box-shadow:0 0 0 1.5px #111827,0 0 0 4px rgba(0,0,0,0.04);}
        .db-t-row{display:grid;grid-template-columns:52px 1fr 80px 70px 100px 170px;gap:0;align-items:center;padding:16px 20px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background 0.1s;}
        .db-t-row:hover{background:#fafafa;}
        .db-g-card{background:white;border:1px solid #ececec;border-radius:12px;padding:18px;cursor:pointer;transition:all 0.18s;}
        .db-g-card:hover{border-color:#d1d5db;box-shadow:0 4px 12px rgba(0,0,0,0.06);transform:translateY(-1px);}
        .db-pg-btn{background:white;border:1px solid #e5e7eb;color:#374151;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;font-weight:500;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .db-pg-btn:hover:not(:disabled){border-color:#d1d5db;background:#f9fafb;}
        .db-pg-btn.active-pg{background:#111827;border-color:#111827;color:white;}
        .db-pg-btn:disabled{opacity:0.3;cursor:default;}
        .db-slide-panel{transform:translateX(110%);transition:transform 0.42s cubic-bezier(0.16,1,0.3,1);}
        .db-slide-panel.open{transform:translateX(0);}
        .db-search-input{background:white;border:1.5px solid #e5e7eb;color:#374151;padding:8px 12px 8px 36px;border-radius:8px;font-size:13px;font-family:inherit;outline:none;width:220px;transition:border-color 0.15s;}
        .db-search-input:focus{border-color:#d1d5db;}
        .db-desc-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .chart-card{transition:all 0.15s,opacity 0.6s,transform 0.6s;}
        .chart-card:hover{border-color:#d1d5db !important;box-shadow:0 4px 16px rgba(0,0,0,0.06);transform:translateY(-2px);}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .chart-animate{animation:fadeSlideUp 0.5s ease-out both;}
        .db-h-card:hover .score-bar-fill{background:#2563eb !important;}
        .db-h-card:hover .save-on-hover{opacity:1 !important;}
      `}</style>

      {/* ── MAIN ── */}
      <div style={{ padding: "28px 36px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em" }}>Skills</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>{filtered.length} skills · sorted by {sortBy}</p>
        </div>
            {/* ── PULSE CARD ── */}
            {pulseVisible && (
              <div style={{ background: "white", border: "1px solid #ececec", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
                  {[
                    { l: "Skills tracked", v: String(stats.totalSkills) },
                    { l: "Active trends", v: String(stats.totalTrends) },
                    { l: "Top trending", v: topTrending.length > 25 ? topTrending.slice(0, 25) + "…" : topTrending },
                    { l: "Sources active", v: String(stats.totalSources) },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{s.v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPulseVisible(false)} style={{
                  background: "none", border: "none", color: "#d1d5db", cursor: "pointer", padding: 4,
                  display: "flex", alignItems: "center", flexShrink: 0, marginLeft: 16, borderRadius: 6, transition: "color 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#d1d5db")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            )}

            {/* ── 4 CHART CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
              {[
                <PriorityMatrixCard key="m" skills={chartSkills} expanded={false} onToggle={() => setExpandedChart("matrix")} onSelectSkill={cs => { const match = allSkills.find(s => s.id === cs.id); if (match) openSkill(match); }} />,
                <TrendingVelocityCard key="t" skills={chartSkills} expanded={false} onToggle={() => setExpandedChart("trending")} />,
                <SkillLandscapeCard key="d" skills={chartSkills} expanded={false} onToggle={() => setExpandedChart("donut")} />,
                <UrgencyHeatmapCard key="u" skills={chartSkills} expanded={false} onToggle={() => setExpandedChart("urgency")} />,
              ].map((card, i) => (
                <div key={i} className={chartsLoaded ? "chart-animate" : ""} style={{ animationDelay: `${i * 0.1}s`, opacity: chartsLoaded ? undefined : 0 }}>
                  {card}
                </div>
              ))}
            </div>

            {expandedChart && (
              <ChartModal onClose={() => setExpandedChart(null)}>
                {expandedChart === "matrix" && <PriorityMatrixCard skills={chartSkills} expanded onToggle={() => setExpandedChart(null)} onSelectSkill={cs => { setExpandedChart(null); const match = allSkills.find(s => s.id === cs.id); if (match) openSkill(match); }} />}
                {expandedChart === "trending" && <TrendingVelocityCard skills={chartSkills} expanded onToggle={() => setExpandedChart(null)} />}
                {expandedChart === "donut" && <SkillLandscapeCard skills={chartSkills} expanded onToggle={() => setExpandedChart(null)} />}
                {expandedChart === "urgency" && <UrgencyHeatmapCard skills={chartSkills} expanded onToggle={() => setExpandedChart(null)} />}
              </ChartModal>
            )}

            {/* ── FILTER CARD ── */}
            <div style={{ background: "white", border: "1px solid #ececec", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="6" cy="6" r="4" stroke="#9ca3af" strokeWidth="1.5" />
                    <path d="M10 10l2 2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input className="db-search-input" placeholder="Search skills…" readOnly onClick={() => setSearchOpen(true)} style={{ cursor: "pointer" }} />
                </div>
                <div style={{ width: 1, height: 24, background: "#e5e7eb", flexShrink: 0 }} />
                <MultiDropdown label="Sector" options={sectors} values={fSector} onChange={v => { setFSector(v); setPage(1); }} />
                <MultiDropdown label="Impact" options={impactOptions} values={fImpact} onChange={v => { setFImpact(v); setPage(1); }} />
                <MultiDropdown label="Effort level" options={effortOptions} values={fEffort} onChange={v => { setFEffort(v); setPage(1); }} />
                <MultiDropdown label="Time horizon" options={horizonOptions} values={fHorizon} onChange={v => { setFHorizon(v); setPage(1); }} />
                <button onClick={() => { setFQW(!fQW); setPage(1); }} style={{
                  display: "flex", alignItems: "center", gap: 6, background: fQW ? "#111827" : "none",
                  border: `1.5px solid ${fQW ? "#111827" : "#e5e7eb"}`, color: fQW ? "white" : "#374151",
                  padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}>⚡ Quick wins</button>
                {activeCount > 0 && (
                  <button onClick={clearAll} style={{
                    background: "none", border: "none", color: "#9ca3af", fontSize: 12, fontFamily: "inherit",
                    cursor: "pointer", padding: "4px 8px", borderRadius: 6, marginLeft: "auto", transition: "color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                  >Clear all ({activeCount})</button>
                )}
              </div>
              {selectedTags.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Selected:</span>
                  {selectedTags.map(f => (
                    <span key={f.label} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6",
                      border: "1px solid #e5e7eb", color: "#374151", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    }}>
                      {f.label}
                      <button onClick={f.clear} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, display: "flex" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* View + sort */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 2, background: "white", padding: 4, borderRadius: 10, border: "1px solid #ececec" }}>
                {([["highlights", "✦ Highlights"], ["grid", "⊞ Grid"], ["table", "≡ Table"]] as const).map(([v, label]) => (
                  <button key={v} className={`db-view-btn ${view === v ? "active" : ""}`} onClick={() => { setView(v); setPage(1); }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#9ca3af", marginRight: 4 }}>Sort</span>
                {([["priority", "Priority"], ["trending", "Trending"], ["urgency", "Urgency"]] as const).map(([v, label]) => (
                  <button key={v} className={`db-sort-btn ${sortBy === v ? "active" : ""}`} onClick={() => setSortBy(v)}>{label}</button>
                ))}
              </div>
            </div>

            {/* ── HIGHLIGHTS VIEW ── */}
            {view === "highlights" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {paginated.map((s) => {
                    const dec = s.status === "Declining";
                    const r = reasonLabels[s.reason];
                    const skillSaved = isItemSaved("skill", s.id);
                    return (
                      <div key={s.id} className={`db-h-card ${s.summaRecommended ? "recommended" : ""}`} onClick={() => openSkill(s)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
                              color: "#9ca3af", background: "#f9fafb", border: "1px solid #f0f0f0",
                              padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.color, display: "inline-block" }} />
                              {r.label}
                            </span>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
                              color: "#9ca3af", background: "#f9fafb", border: "1px solid #f0f0f0",
                              padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
                            }}>
                              <StatusDot status={s.status} />
                            </span>
                            <span style={{
                              display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500,
                              color: "#9ca3af", background: "#f9fafb", border: "1px solid #f0f0f0",
                              padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
                            }}>{s.type}</span>
                            {s.quickWin && (
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600,
                                color: "#d97706", background: "#fffbeb", border: "1px solid #fef3c7",
                                padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
                              }}>&#x26A1; Quick win</span>
                            )}
                          </div>
                          <button
                            className="save-on-hover"
                            onClick={e => { e.stopPropagation(); toggleSaveItem("skill", s.id); }}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6,
                              opacity: skillSaved ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0, marginLeft: 6,
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 20 20" fill={skillSaved ? "#ef4444" : "none"} stroke={skillSaved ? "#ef4444" : "#d1d5db"} strokeWidth="1.8">
                              <path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.015em" }}>{s.name}</h3>
                        <p className="db-desc-clamp" style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, marginBottom: 22 }}>{s.desc}</p>
                        <div style={{ display: "flex", gap: 0, alignItems: "stretch", paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
                          <div style={{ width: "38%", flexShrink: 0, paddingRight: 16 }}>
                            <div style={{ fontSize: 12, color: "#d1d5db", marginBottom: 6 }}>Priority</div>
                            <div style={{ fontSize: 38, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.priority.toFixed(1)}</div>
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, justifyContent: "center", borderLeft: "1px solid #f3f4f6", paddingLeft: 16 }}>
                            {[
                              { label: "Impact", value: s.impact },
                              { label: "Urgency", value: s.urgency },
                              { label: "Trending", value: s.trending },
                            ].map(sc => (
                              <div key={sc.label} style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
                                <span style={{ fontSize: 12, color: "#9ca3af", width: 50, flexShrink: 0 }}>{sc.label}</span>
                                <div style={{ flex: 1, height: 3, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                                  <div className="score-bar-fill" style={{ height: "100%", width: `${sc.value * 10}%`, background: dec ? "#d1d5db" : "#111827", borderRadius: 99, transition: "all 0.3s" }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", minWidth: 24, textAlign: "right" as const }}>{sc.value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{s.sourceCount} sources</span>
                          <span style={{ fontSize: 13, color: "#e5e7eb" }}>&#xB7;</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{s.trendCount} trends</span>
                          <span style={{ fontSize: 13, color: "#e5e7eb" }}>&#xB7;</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{s.sector}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
                    <button className="db-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&larr;</button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} className={`db-pg-btn ${page === i + 1 ? "active-pg" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="db-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&rarr;</button>
                  </div>
                )}
              </>
            )}

            {/* ── GRID VIEW ── */}
            {view === "grid" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {paginated.map((s, idx) => {
                  const dec = s.status === "Declining";
                  return (
                    <div key={s.id} className="db-g-card" onClick={() => openSkill(s)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#e5e7eb" }}>#{(page - 1) * PAGE_SIZE + idx + 1}</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {s.quickWin && <span style={{ fontSize: 12, color: "#d97706" }}>⚡</span>}
                          <TypeTag type={s.type} />
                        </div>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: dec ? "#9ca3af" : "#111827", lineHeight: 1.35, marginBottom: 6, letterSpacing: "-0.01em" }}>{s.name}</h4>
                      <p className="db-desc-clamp" style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.55, marginBottom: 12 }}>{s.desc}</p>
                      <div style={{ marginBottom: 12 }}><StatusDot status={s.status} /></div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#d1d5db", marginBottom: 3 }}>Priority</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", letterSpacing: "-0.03em" }}>{s.priority.toFixed(1)}</div>
                        </div>
                        <Spark data={s.sparkline} declining={dec} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TABLE VIEW ── */}
            {view === "table" && (
              <div style={{ background: "white", border: "1px solid #ececec", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 80px 70px 100px 170px", gap: 0, alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                  {["", "Skill", "Sector", "Priority", "Mentions", "Scores"].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>{h}</div>
                  ))}
                </div>
                {paginated.map((s, idx) => {
                  const dec = s.status === "Declining";
                  return (
                    <div key={s.id} className="db-t-row" onClick={() => openSkill(s)}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: "transparent", WebkitTextStroke: "1.8px #d1d5db", lineHeight: 1, letterSpacing: "-0.05em" }}>{(page - 1) * PAGE_SIZE + idx + 1}</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: dec ? "#9ca3af" : "#111827" }}>{s.name}</div>
                          {s.summaRecommended && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7c3aed", fontWeight: 600, background: "#f3f0ff", border: "1px solid #e9e5ff", padding: "2px 8px", borderRadius: 6 }}>
                              Summa pick
                            </span>
                          )}
                        </div>
                        <p className="db-desc-clamp" style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, marginBottom: 5, maxWidth: 380 }}>{s.desc}</p>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <StatusDot status={s.status} />
                          <span style={{ fontSize: 12, color: "#e5e7eb" }}>&#xB7;</span>
                          <TypeTag type={s.type} />
                          {s.quickWin && <><span style={{ fontSize: 12, color: "#e5e7eb" }}>&#xB7;</span><span style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>&#x26A1; Quick win</span></>}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>{s.sector}</div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: dec ? "#9ca3af" : "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.priority.toFixed(1)}</div>
                        <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 2 }}>i&#xF7;e</div>
                      </div>
                      <div>
                        <MiniBarChart data={s.mentions} w={80} h={22} />
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{s.mentions[s.mentions.length - 1]} mentions</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <ScoreBarMini label="Impact" value={s.impact} declining={dec} />
                        <ScoreBarMini label="Urgency" value={s.urgency} declining={dec} />
                        <ScoreBarMini label="Trending" value={s.trending} declining={dec} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14, background: "white", borderRadius: 14, border: "1px solid #ececec" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>∅</div>
                No skills match your current filters.
                <button onClick={clearAll} style={{ display: "block", margin: "12px auto 0", background: "none", border: "1px solid #e5e7eb", color: "#374151", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Clear filters</button>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {view !== "highlights" && totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
                <button className="db-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`db-pg-btn ${page === i + 1 ? "active-pg" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="db-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
      </div>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && <SearchOverlay skills={allSkills} onClose={() => setSearchOpen(false)} onSelect={s => openSkill(s)} />}

      {/* ── SLIDE PANEL ── */}
      {selectedSkill && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 40, backdropFilter: "blur(2px)" }} onClick={closeSkill} />}
      <div className={`db-slide-panel ${panelMounted ? "open" : ""}`} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(580px, 100vw)",
        background: "white", borderLeft: "1px solid #ececec", zIndex: 50, overflowY: "hidden",
      }}>
        {selectedSkill && <SkillDetail skill={selectedSkill} onClose={closeSkill} />}
      </div>
    </div>
  );
}
