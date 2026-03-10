"use client";

import { useState } from "react";

// ── TYPES ────────────────────────────────────────────────────────────────

export interface ChartSkill {
  id: string;
  name: string;
  status: string;
  impact: number;
  effort: number;
  trending: number;
  urgency: number;
  quickWin: boolean;
  type: string;
}

interface ChartCardProps {
  skills: ChartSkill[];
  expanded: boolean;
  onToggle: () => void;
}

interface MatrixCardProps extends ChartCardProps {
  onSelectSkill?: (s: ChartSkill) => void;
}

// ── INFO ICON ────────────────────────────────────────────────────────────

const InfoIcon = ({ tooltip }: { tooltip: string }) => {
  const [show, setShow] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => { setShow(true); setHov(true); }}
      onMouseLeave={() => { setShow(false); setHov(false); }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        border: `1.5px solid ${hov ? "#9ca3af" : "#e5e7eb"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "help", fontSize: 11, fontWeight: 700,
        color: hov ? "#6b7280" : "#d1d5db",
        transition: "all 0.15s", background: hov ? "#f9fafb" : "white",
      }}>i</div>
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#1f2937", color: "white", fontSize: 12, lineHeight: 1.55,
          padding: "10px 14px", borderRadius: 10, width: 230, zIndex: 9999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", pointerEvents: "none", whiteSpace: "normal",
        }}>
          {tooltip}
          <div style={{
            position: "absolute", bottom: "100%", right: 6, width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderBottom: "6px solid #1f2937",
          }} />
        </div>
      )}
    </div>
  );
};

// ── EXPAND BUTTON ────────────────────────────────────────────────────────

const ExpandBtn = ({ onClick }: { onClick: () => void }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 24, height: 24, borderRadius: 6,
        border: `1.5px solid ${hov ? "#9ca3af" : "#e5e7eb"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: hov ? "#6b7280" : "#d1d5db",
        transition: "all 0.15s", background: hov ? "#f9fafb" : "white", flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M9 1h4v4M5 13H1V9M13 1L8.5 5.5M1 13l4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

// ── CHART TOOLTIPS ───────────────────────────────────────────────────────

const chartTooltips = {
  matrix: "Shows each skill plotted by impact (vertical) vs effort (horizontal). Top-left quadrant = quick wins with high impact and low effort.",
  trending: "Ranks skills by how fast their trending score is accelerating. Shows what's gaining momentum right now.",
  donut: "Breakdown of skill lifecycle stages. Emerging skills need early investment, Established need maintenance, Declining may be deprioritised.",
  urgency: "Skills sorted by urgency score. Darker = more time-sensitive. Helps identify which skills need action first.",
};

// ── A: PRIORITY MATRIX ──────────────────────────────────────────────────

export const PriorityMatrixCard = ({ skills, expanded, onToggle, onSelectSkill }: MatrixCardProps) => {
  const nonDeclining = skills.filter(s => s.status !== "Declining");

  if (!expanded) {
    const qw = nonDeclining.filter(s => s.effort <= 5 && s.impact >= 7).length;
    const strategic = nonDeclining.filter(s => s.effort > 5 && s.impact >= 7).length;
    const lowPri = nonDeclining.filter(s => s.effort <= 5 && s.impact < 7).length;
    const reconsider = nonDeclining.filter(s => s.effort > 5 && s.impact < 7).length;

    return (
      <div
        className="chart-card"
        style={{ background: "white", border: "1px solid #ececec", borderRadius: 14, padding: 22, cursor: "pointer", height: "100%", position: "relative", overflow: "hidden" }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Priority Matrix</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <InfoIcon tooltip={chartTooltips.matrix} />
            <ExpandBtn onClick={onToggle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { count: qw, label: "Quick wins", bg: "#f0fdf4", color: "#059669" },
            { count: strategic, label: "Strategic", bg: "#fefce8", color: "#b45309" },
            { count: lowPri, label: "Low priority", bg: "#f9fafb", color: "#9ca3af" },
            { count: reconsider, label: "Reconsider", bg: "#fef2f2", color: "#dc2626" },
          ].map(q => (
            <div key={q.label} style={{ background: q.bg, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: q.color, lineHeight: 1 }}>{q.count}</div>
              <div style={{ fontSize: 11, color: q.color, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>{q.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#d1d5db" }}>&#x2191; Impact</span>
          <span style={{ fontSize: 10, color: "#d1d5db" }}>Effort &#x2192;</span>
        </div>
      </div>
    );
  }

  const W = 760, H = 480, PAD = 60, INNER_W = W - PAD - 20, INNER_H = H - PAD - 30;
  return (
    <div style={{ background: "white", borderRadius: 14, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Priority Matrix</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>Impact (vertical) vs Effort (horizontal) — top-left = quick wins</div>
        </div>
        <button onClick={onToggle} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280" }}>&#x2715;</button>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
        <rect x={PAD} y={10} width={INNER_W / 2} height={INNER_H / 2} fill="#f0fdf4" rx="6" />
        <rect x={PAD + INNER_W / 2} y={10} width={INNER_W / 2} height={INNER_H / 2} fill="#fefce8" rx="6" />
        <rect x={PAD} y={10 + INNER_H / 2} width={INNER_W / 2} height={INNER_H / 2} fill="#f9fafb" rx="6" />
        <rect x={PAD + INNER_W / 2} y={10 + INNER_H / 2} width={INNER_W / 2} height={INNER_H / 2} fill="#fef2f2" rx="6" />
        <text x={PAD + 12} y={30} fontSize="12" fill="#059669" fontWeight="600" opacity="0.8">Quick wins</text>
        <text x={PAD + INNER_W / 2 + 12} y={30} fontSize="12" fill="#b45309" fontWeight="600" opacity="0.7">Strategic</text>
        <text x={PAD + 12} y={INNER_H + 4} fontSize="12" fill="#9ca3af" fontWeight="600" opacity="0.7">Low priority</text>
        <text x={PAD + INNER_W / 2 + 12} y={INNER_H + 4} fontSize="12" fill="#dc2626" fontWeight="600" opacity="0.6">Reconsider</text>
        <line x1={PAD} y1={10 + INNER_H} x2={PAD + INNER_W} y2={10 + INNER_H} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={PAD} y1={10} x2={PAD} y2={10 + INNER_H} stroke="#e5e7eb" strokeWidth="1" />
        <text x={PAD + INNER_W / 2} y={H - 4} fontSize="12" fill="#9ca3af" textAnchor="middle" fontWeight="500">Effort &#x2192;</text>
        <text x={16} y={10 + INNER_H / 2} fontSize="12" fill="#9ca3af" textAnchor="middle" fontWeight="500" transform={`rotate(-90,16,${10 + INNER_H / 2})`}>Impact &#x2191;</text>
        {[2, 4, 6, 8].map(v => (
          <g key={v}>
            <line x1={PAD} y1={10 + INNER_H - (v / 10) * INNER_H} x2={PAD + INNER_W} y2={10 + INNER_H - (v / 10) * INNER_H} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={PAD - 8} y={10 + INNER_H - (v / 10) * INNER_H + 4} fontSize="10" fill="#d1d5db" textAnchor="end">{v}</text>
            <line x1={PAD + (v / 10) * INNER_W} y1={10} x2={PAD + (v / 10) * INNER_W} y2={10 + INNER_H} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={PAD + (v / 10) * INNER_W} y={10 + INNER_H + 16} fontSize="10" fill="#d1d5db" textAnchor="middle">{v}</text>
          </g>
        ))}
        {nonDeclining.map(s => {
          const x = PAD + (s.effort / 10) * INNER_W;
          const y = 10 + INNER_H - (s.impact / 10) * INNER_H;
          const r = 6 + s.trending * 0.4;
          return (
            <g key={s.id} style={{ cursor: "pointer" }} onClick={e => { e.stopPropagation(); onSelectSkill?.(s); }}>
              <circle cx={x} cy={y} r={r} fill={s.quickWin ? "#059669" : "#2563eb"} opacity="0.75" stroke="white" strokeWidth="2" />
              <text x={x + r + 5} y={y + 4} fontSize="11" fill="#374151" fontWeight="500">
                {s.name.length > 30 ? s.name.slice(0, 28) + "\u2026" : s.name}
              </text>
            </g>
          );
        })}
        <circle cx={PAD + INNER_W - 120} cy={H - 14} r="5" fill="#059669" opacity="0.75" />
        <text x={PAD + INNER_W - 110} y={H - 10} fontSize="11" fill="#6b7280">Quick win</text>
        <circle cx={PAD + INNER_W - 40} cy={H - 14} r="5" fill="#2563eb" opacity="0.75" />
        <text x={PAD + INNER_W - 30} y={H - 10} fontSize="11" fill="#6b7280">Other</text>
      </svg>
    </div>
  );
};

// ── B: TRENDING VELOCITY ────────────────────────────────────────────────

export const TrendingVelocityCard = ({ skills, expanded, onToggle }: ChartCardProps) => {
  const sorted = [...skills].filter(s => s.status !== "Declining").sort((a, b) => b.trending - a.trending);
  const top = expanded ? sorted : sorted.slice(0, 8);
  const maxT = Math.max(...sorted.map(s => s.trending), 1);

  if (!expanded) {
    return (
      <div
        className="chart-card"
        style={{ background: "white", border: "1px solid #ececec", borderRadius: 14, padding: 22, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Trending Velocity</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <InfoIcon tooltip={chartTooltips.trending} />
            <ExpandBtn onClick={onToggle} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, justifyContent: "space-between" }}>
          {sorted.slice(0, 8).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", width: 14, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(s.trending / maxT) * 100}%`, background: s.trending > 8 ? "#059669" : "#2563eb", borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827", minWidth: 22, textAlign: "right" }}>{s.trending.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Trending Velocity</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>Skills ranked by trending score — fastest rising first</div>
        </div>
        <button onClick={onToggle} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280" }}>&#x2715;</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {top.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", width: 24, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, width: 260, flexShrink: 0 }}>{s.name}</span>
            <div style={{ flex: 1, height: 10, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(s.trending / maxT) * 100}%`, background: s.trending > 8 ? "#059669" : "#2563eb", borderRadius: 99, transition: "width 0.4s" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 30, textAlign: "right" }}>{s.trending.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── C: SKILL LANDSCAPE (DONUTS) ─────────────────────────────────────────

export const SkillLandscapeCard = ({ skills, expanded, onToggle }: ChartCardProps) => {
  const emerging = skills.filter(s => s.status === "Emerging").length;
  const established = skills.filter(s => s.status === "Established").length;
  const declining = skills.filter(s => s.status === "Declining").length;
  const typeLower = (s: ChartSkill) => s.type.toLowerCase();
  const tools = skills.filter(s => typeLower(s).includes("tool")).length;
  const hard = skills.filter(s => typeLower(s).includes("hard")).length;
  const soft = skills.filter(s => typeLower(s).includes("soft")).length;
  const meth = skills.filter(s => typeLower(s).includes("method")).length;
  const other = skills.length - tools - hard - soft - meth;
  const total = skills.length || 1;

  const MiniDonut = ({ data, colors, size = 28, sw = 6, label }: {
    data: { v: number }[]; colors: string[]; size?: number; sw?: number; label?: string;
  }) => {
    const circ = 2 * Math.PI * size;
    let offset = 0;
    return (
      <svg width={size * 2 + sw} height={size * 2 + sw} viewBox={`0 0 ${size * 2 + sw} ${size * 2 + sw}`}>
        <circle cx={size + sw / 2} cy={size + sw / 2} r={size} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
        {data.map((d, i) => {
          const dash = (d.v / total) * circ;
          const el = (
            <circle key={i} cx={size + sw / 2} cy={size + sw / 2} r={size} fill="none"
              stroke={colors[i]} strokeWidth={sw} strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={`${-offset}`} transform={`rotate(-90 ${size + sw / 2} ${size + sw / 2})`}
              strokeLinecap="round" />
          );
          offset += dash;
          return el;
        })}
        <text x={size + sw / 2} y={size + sw / 2 + 1} textAnchor="middle" fontSize={expanded ? 14 : 10} fontWeight="700" fill="#111827">{skills.length}</text>
        {expanded && label && <text x={size + sw / 2} y={size + sw / 2 + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{label}</text>}
      </svg>
    );
  };

  const statusData = [{ v: emerging }, { v: established }, { v: declining }];
  const statusColors = ["#059669", "#2563eb", "#d1d5db"];
  const typeData = [{ v: tools }, { v: hard }, { v: soft }, { v: meth }, ...(other > 0 ? [{ v: other }] : [])];
  const typeColors = ["#6366f1", "#059669", "#f59e0b", "#6b7280", ...(other > 0 ? ["#d1d5db"] : [])];

  if (!expanded) {
    return (
      <div
        className="chart-card"
        style={{ background: "white", border: "1px solid #ececec", borderRadius: 14, padding: 22, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Skill Landscape</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <InfoIcon tooltip={chartTooltips.donut} />
            <ExpandBtn onClick={onToggle} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MiniDonut data={statusData} colors={statusColors} size={30} sw={6} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Lifecycle</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { l: "Emerging", c: emerging, cl: "#059669" },
                  { l: "Established", c: established, cl: "#2563eb" },
                  { l: "Declining", c: declining, cl: "#d1d5db" },
                ].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.cl }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{x.c} {x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MiniDonut data={typeData} colors={typeColors} size={30} sw={6} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Skill type</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { l: "Tool", c: tools, cl: "#6366f1" },
                  { l: "Hard", c: hard, cl: "#059669" },
                  { l: "Soft", c: soft, cl: "#f59e0b" },
                  { l: "Method", c: meth, cl: "#6b7280" },
                  ...(other > 0 ? [{ l: "Other", c: other, cl: "#d1d5db" }] : []),
                ].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.cl }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{x.c} {x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Skill Landscape</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>Breakdown by lifecycle stage and skill type</div>
        </div>
        <button onClick={onToggle} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280" }}>&#x2715;</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Lifecycle stage</div>
          <MiniDonut data={statusData} colors={statusColors} size={70} sw={14} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "stretch" }}>
            {[
              { l: "Emerging", c: emerging, cl: "#059669", desc: "New skills gaining traction" },
              { l: "Established", c: established, cl: "#2563eb", desc: "Mature, stable demand" },
              { l: "Declining", c: declining, cl: "#d1d5db", desc: "Fading relevance" },
            ].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: x.cl, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{x.c} {x.l}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{x.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Skill type</div>
          <MiniDonut data={typeData} colors={typeColors} size={70} sw={14} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "stretch" }}>
            {[
              { l: "Tool", c: tools, cl: "#6366f1", desc: "Software & platform proficiency" },
              { l: "Hard Skill", c: hard, cl: "#059669", desc: "Technical, measurable abilities" },
              { l: "Soft Skill", c: soft, cl: "#f59e0b", desc: "Interpersonal & cognitive" },
              { l: "Methodology", c: meth, cl: "#6b7280", desc: "Frameworks & processes" },
            ].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: x.cl, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{x.c} {x.l}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{x.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── D: URGENCY HEATMAP ──────────────────────────────────────────────────

export const UrgencyHeatmapCard = ({ skills, expanded, onToggle }: ChartCardProps) => {
  const sorted = [...skills].filter(s => s.status !== "Declining").sort((a, b) => b.urgency - a.urgency);
  const getColor = (v: number) => v >= 8.5 ? "#991b1b" : v >= 7.5 ? "#dc2626" : v >= 6.5 ? "#f97316" : v >= 5.5 ? "#fbbf24" : "#d1d5db";

  if (!expanded) {
    return (
      <div
        className="chart-card"
        style={{ background: "white", border: "1px solid #ececec", borderRadius: 14, padding: 22, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Urgency Heatmap</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <InfoIcon tooltip={chartTooltips.urgency} />
            <ExpandBtn onClick={onToggle} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, justifyContent: "space-between" }}>
          {sorted.slice(0, 8).map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 14, borderRadius: 2, background: getColor(s.urgency), flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name.split(" ").slice(0, 3).join(" ")}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: getColor(s.urgency) }}>{s.urgency.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Urgency Heatmap</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>Skills ranked by urgency — darker = more time-sensitive</div>
        </div>
        <button onClick={onToggle} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280" }}>&#x2715;</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 26, borderRadius: 4, background: getColor(s.urgency), flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#374151", flex: 1, fontWeight: 500 }}>{s.name}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: getColor(s.urgency) }}>{s.urgency.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── CHART MODAL ─────────────────────────────────────────────────────────

export const ChartModal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 250,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)",
    }}
    onClick={onClose}
  >
    <div
      style={{ width: "min(880px,92vw)", maxHeight: "85vh", overflowY: "auto", background: "white", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
