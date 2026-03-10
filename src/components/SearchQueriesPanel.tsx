"use client";

import { useState, useCallback } from "react";
import {
    Plus,
    Trash2,
    Search,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronRight,
    Globe,
    Flag,
    Building2,
    MapPin,
    Layers,
    FileText,
    ExternalLink,
    Power,
    PowerOff,
    X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SearchQuery } from "@/lib/types";

interface Sector {
    id: string;
    name: string;
    name_nl: string;
    is_active: boolean;
}

interface RecentSource {
    id: string;
    title: string;
    url: string | null;
    publisher: string | null;
    authority_score: number | null;
    triage_score: number | null;
    triage_status: string | null;
    publication_date: string | null;
    created_at: string;
    sector_id: string | null;
}

interface Props {
    sectors: Sector[];
    initialQueries: SearchQuery[];
    recentSources: RecentSource[];
}

const LEVEL_META: Record<number, { label: string; icon: typeof Globe; color: string; bg: string }> = {
    1: { label: "International", icon: Globe, color: "#1d4ed8", bg: "#eff6ff" },
    2: { label: "National NL", icon: Flag, color: "#059669", bg: "#ecfdf5" },
    3: { label: "Sector", icon: Building2, color: "#7c3aed", bg: "#f5f3ff" },
    4: { label: "Brainport", icon: MapPin, color: "#ea580c", bg: "#fff7ed" },
};

const LAYER_LABELS: Record<number, string> = { 1: "Strategic / Trends", 2: "Shop Floor / Skills" };
const SPOOR_LABELS: Record<string, string> = { A: "Trend-oriented", B: "Skill-oriented" };
const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    neural: { label: "Neural", color: "#2563eb" },
    keyword: { label: "Keyword / PDF", color: "#d97706" },
};

export default function SearchQueriesPanel({ sectors, initialQueries, recentSources }: Props) {
    const [queries, setQueries] = useState<SearchQuery[]>(initialQueries);
    const [activeSector, setActiveSector] = useState<string>(sectors[0]?.id || "");
    const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const [showSources, setShowSources] = useState(false);

    // Add form state
    const [newQuery, setNewQuery] = useState({
        level: 3,
        layer: 1,
        spoor: "A",
        search_type: "neural",
        query_text: "",
    });

    const supabase = createClient();

    const sectorQueries = queries.filter((q) => q.sector_id === activeSector);
    const filteredQueries = searchFilter
        ? sectorQueries.filter((q) => q.query_text.toLowerCase().includes(searchFilter.toLowerCase()))
        : sectorQueries;

    const toggleLevel = useCallback((lvl: string) => {
        setExpandedLevels((prev) => {
            const next = new Set(prev);
            if (next.has(lvl)) next.delete(lvl);
            else next.add(lvl);
            return next;
        });
    }, []);

    // ── Selection helpers ──
    const toggleSelectOne = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectLevel = useCallback(
        (level: number) => {
            const levelIds = filteredQueries.filter((q) => q.level === level).map((q) => q.id);
            setSelectedIds((prev) => {
                const allSelected = levelIds.every((id) => prev.has(id));
                const next = new Set(prev);
                if (allSelected) {
                    levelIds.forEach((id) => next.delete(id));
                } else {
                    levelIds.forEach((id) => next.add(id));
                }
                return next;
            });
        },
        [filteredQueries]
    );

    const toggleSelectAll = useCallback(() => {
        const allIds = filteredQueries.map((q) => q.id);
        setSelectedIds((prev) => {
            const allSelected = allIds.every((id) => prev.has(id));
            if (allSelected) return new Set();
            return new Set(allIds);
        });
    }, [filteredQueries]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setConfirmBulkDelete(false);
    }, []);

    // ── Bulk actions ──
    async function bulkToggleActive(enable: boolean) {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setLoading(true);
        const { error } = await supabase
            .from("search_queries")
            .update({ is_active: enable, updated_at: new Date().toISOString() })
            .in("id", ids);
        if (!error) {
            setQueries((prev) =>
                prev.map((q) => (selectedIds.has(q.id) ? { ...q, is_active: enable } : q))
            );
        }
        setLoading(false);
    }

    async function bulkDelete() {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setLoading(true);
        const { error } = await supabase
            .from("search_queries")
            .delete()
            .in("id", ids);
        if (!error) {
            setQueries((prev) => prev.filter((q) => !selectedIds.has(q.id)));
            clearSelection();
        }
        setLoading(false);
    }

    async function toggleActive(id: string, currentState: boolean) {
        setLoading(true);
        const { error } = await supabase
            .from("search_queries")
            .update({ is_active: !currentState, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (!error) {
            setQueries((prev) =>
                prev.map((q) => (q.id === id ? { ...q, is_active: !currentState } : q))
            );
        }
        setLoading(false);
    }

    async function deleteQuery(id: string) {
        setLoading(true);
        const { error } = await supabase.from("search_queries").delete().eq("id", id);

        if (!error) {
            setQueries((prev) => prev.filter((q) => q.id !== id));
        }
        setLoading(false);
    }

    async function addQuery() {
        if (!newQuery.query_text.trim()) return;
        setLoading(true);

        const maxSort = sectorQueries
            .filter((q) => q.level === newQuery.level && q.layer === newQuery.layer && q.spoor === newQuery.spoor)
            .reduce((max, q) => Math.max(max, q.sort_order), 0);

        const { data, error } = await supabase
            .from("search_queries")
            .insert({
                sector_id: activeSector,
                level: newQuery.level,
                layer: newQuery.layer,
                spoor: newQuery.spoor,
                search_type: newQuery.search_type,
                query_text: newQuery.query_text.trim(),
                sort_order: maxSort + 1,
                is_active: true,
            })
            .select()
            .single();

        if (!error && data) {
            setQueries((prev) => [...prev, data]);
            setNewQuery((prev) => ({ ...prev, query_text: "" }));
            setShowAddForm(false);
        }
        setLoading(false);
    }

    // Stats
    const totalForSector = sectorQueries.length;
    const activeForSector = sectorQueries.filter((q) => q.is_active).length;
    const sectorSources = recentSources.filter((s) => s.sector_id === activeSector);
    const selectedCount = selectedIds.size;
    const allVisibleSelected = filteredQueries.length > 0 && filteredQueries.every((q) => selectedIds.has(q.id));
    const someVisibleSelected = filteredQueries.some((q) => selectedIds.has(q.id));

    return (
        <div className="space-y-5">
            {/* Sector tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {sectors.map((s) => {
                    const count = queries.filter((q) => q.sector_id === s.id).length;
                    const isActive = s.id === activeSector;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveSector(s.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                            style={{
                                background: isActive ? "linear-gradient(135deg, #1d4ed8, #4f46e5)" : "white",
                                color: isActive ? "white" : "#475569",
                                border: isActive ? "none" : "1px solid #e2e8f0",
                            }}
                        >
                            {s.name}
                            <span
                                className="px-1.5 py-0.5 rounded text-[11px] font-semibold"
                                style={{
                                    background: isActive ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                                    color: isActive ? "white" : "#94a3b8",
                                }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Stats + actions bar */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Select All checkbox */}
                <label
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={(e) => { e.preventDefault(); toggleSelectAll(); }}
                >
                    <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                        readOnly
                        className="w-4 h-4 rounded accent-[#4f46e5] cursor-pointer"
                    />
                    <span className="text-[13px] font-medium" style={{ color: "#475569" }}>Select All</span>
                </label>

                <div className="w-px h-5" style={{ background: "#e2e8f0" }} />

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#ecfdf5" }}>
                    <span className="text-[13px] font-semibold" style={{ color: "#065f46" }}>
                        {activeForSector} active
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f1f5f9" }}>
                    <span className="text-[13px] font-semibold" style={{ color: "#64748b" }}>
                        {totalForSector - activeForSector} disabled
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#eff6ff" }}>
                    <span className="text-[13px] font-semibold" style={{ color: "#1d4ed8" }}>
                        {sectorSources.length} recent sources
                    </span>
                </div>

                <div className="flex-1" />

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Filter queries..."
                        className="h-8 pl-8 pr-3 rounded-lg border text-[13px] outline-none focus:border-primary w-52"
                        style={{ borderColor: "#e2e8f0" }}
                    />
                </div>

                {/* Toggle sources panel */}
                <button
                    onClick={() => setShowSources(!showSources)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[13px] font-medium transition-all hover:bg-surface"
                    style={{ borderColor: "#e2e8f0", color: showSources ? "#1d4ed8" : "#64748b" }}
                >
                    <FileText size={14} />
                    Sources
                </button>

                {/* Add query button */}
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}
                >
                    <Plus size={14} />
                    Add Query
                </button>
            </div>

            {/* Bulk action toolbar */}
            {selectedCount > 0 && (
                <div
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border"
                    style={{
                        background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                        borderColor: "#c7d2fe",
                        boxShadow: "0 2px 8px rgba(79,70,229,0.08)",
                    }}
                >
                    <span className="text-[13px] font-semibold" style={{ color: "#4338ca" }}>
                        {selectedCount} {selectedCount === 1 ? "query" : "queries"} selected
                    </span>

                    <div className="w-px h-5" style={{ background: "#c7d2fe" }} />

                    <button
                        onClick={() => bulkToggleActive(true)}
                        disabled={loading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#10b981", color: "white" }}
                    >
                        <Power size={13} />
                        Enable
                    </button>
                    <button
                        onClick={() => bulkToggleActive(false)}
                        disabled={loading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#f59e0b", color: "white" }}
                    >
                        <PowerOff size={13} />
                        Disable
                    </button>

                    {confirmBulkDelete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium" style={{ color: "#dc2626" }}>
                                Delete {selectedCount}?
                            </span>
                            <button
                                onClick={bulkDelete}
                                disabled={loading}
                                className="h-7 px-3 rounded-lg text-[12px] font-medium text-white disabled:opacity-50"
                                style={{ background: "#dc2626" }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setConfirmBulkDelete(false)}
                                className="h-7 px-3 rounded-lg text-[12px] font-medium border"
                                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmBulkDelete(true)}
                            disabled={loading}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#dc2626", color: "white" }}
                        >
                            <Trash2 size={13} />
                            Delete
                        </button>
                    )}

                    <div className="flex-1" />

                    <button
                        onClick={clearSelection}
                        className="flex items-center gap-1 h-7 px-2 rounded-lg text-[12px] font-medium transition-all hover:bg-white/60"
                        style={{ color: "#64748b" }}
                    >
                        <X size={13} />
                        Clear
                    </button>
                </div>
            )}

            {/* Add query form */}
            {showAddForm && (
                <div
                    className="bg-white rounded-xl border p-5 space-y-4"
                    style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                    <div className="text-[14px] font-semibold text-heading">Add New Query</div>
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">Level</label>
                            <select
                                value={newQuery.level}
                                onChange={(e) => setNewQuery((p) => ({ ...p, level: Number(e.target.value) }))}
                                className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none"
                                style={{ borderColor: "#e2e8f0" }}
                            >
                                {[1, 2, 3, 4].map((l) => (
                                    <option key={l} value={l}>{LEVEL_META[l].label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">Layer</label>
                            <select
                                value={newQuery.layer}
                                onChange={(e) => setNewQuery((p) => ({ ...p, layer: Number(e.target.value) }))}
                                className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none"
                                style={{ borderColor: "#e2e8f0" }}
                            >
                                <option value={1}>L1 — Strategic / Trends</option>
                                <option value={2}>L2 — Shop Floor / Skills</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">Spoor</label>
                            <select
                                value={newQuery.spoor}
                                onChange={(e) => setNewQuery((p) => ({ ...p, spoor: e.target.value }))}
                                className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none"
                                style={{ borderColor: "#e2e8f0" }}
                            >
                                <option value="A">A — Trend-oriented</option>
                                <option value="B">B — Skill-oriented</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">Search Type</label>
                            <select
                                value={newQuery.search_type}
                                onChange={(e) => setNewQuery((p) => ({ ...p, search_type: e.target.value }))}
                                className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none"
                                style={{ borderColor: "#e2e8f0" }}
                            >
                                <option value="neural">Neural</option>
                                <option value="keyword">Keyword / PDF</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">Query Text</label>
                        <div className="flex gap-2">
                            <input
                                value={newQuery.query_text}
                                onChange={(e) => setNewQuery((p) => ({ ...p, query_text: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") addQuery(); }}
                                placeholder="e.g. Healthcare workforce transformation technology 2025 2026 strategic report"
                                className="flex-1 h-9 px-3 rounded-lg border text-[13px] outline-none focus:border-primary"
                                style={{ borderColor: "#e2e8f0" }}
                            />
                            <button
                                onClick={addQuery}
                                disabled={loading || !newQuery.query_text.trim()}
                                className="h-9 px-5 rounded-lg text-[13px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="h-9 px-4 rounded-lg border text-[13px] font-medium text-muted transition-all hover:bg-surface"
                                style={{ borderColor: "#e2e8f0" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent sources panel */}
            {showSources && sectorSources.length > 0 && (
                <div
                    className="bg-white rounded-xl border overflow-hidden"
                    style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                    <div className="px-5 py-3 border-b" style={{ borderColor: "#f1f5f9", background: "#fafafa" }}>
                        <span className="text-[13px] font-semibold text-heading">
                            Recent Sources Found
                        </span>
                        <span className="text-[11px] text-muted ml-2">({sectorSources.length})</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {sectorSources.map((src) => (
                            <div
                                key={src.id}
                                className="flex items-center gap-3 px-5 py-2.5 border-b last:border-b-0 hover:bg-surface transition-colors"
                                style={{ borderColor: "#f9fafb" }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium text-heading truncate">{src.title}</div>
                                    <div className="text-[11px] text-muted truncate">{src.publisher || src.url || "—"}</div>
                                </div>
                                {src.triage_status && (
                                    <span
                                        className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                                        style={{
                                            background: src.triage_status === "approved" ? "#d1fae5"
                                                : src.triage_status === "rejected" ? "#fee2e2" : "#fef3c7",
                                            color: src.triage_status === "approved" ? "#065f46"
                                                : src.triage_status === "rejected" ? "#9f1239" : "#92400e",
                                        }}
                                    >
                                        {src.triage_status}
                                    </span>
                                )}
                                {src.triage_score != null && (
                                    <span className="text-[11px] font-mono font-semibold" style={{ color: "#64748b" }}>
                                        {src.triage_score}/10
                                    </span>
                                )}
                                {src.url && (
                                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
                                        <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Queries grouped by level */}
            {[1, 2, 3, 4].map((level) => {
                const levelQueries = filteredQueries.filter((q) => q.level === level);
                if (levelQueries.length === 0 && searchFilter) return null;
                const meta = LEVEL_META[level];
                const LevelIcon = meta.icon;
                const isExpanded = expandedLevels.has(String(level));
                const activeCount = levelQueries.filter((q) => q.is_active).length;

                return (
                    <div
                        key={level}
                        className="bg-white rounded-xl border overflow-hidden"
                        style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                        {/* Level header */}
                        <div className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface text-left">
                            {/* Level checkbox */}
                            <input
                                type="checkbox"
                                checked={levelQueries.length > 0 && levelQueries.every((q) => selectedIds.has(q.id))}
                                ref={(el) => {
                                    if (el) {
                                        const someSelected = levelQueries.some((q) => selectedIds.has(q.id));
                                        const allSelected = levelQueries.length > 0 && levelQueries.every((q) => selectedIds.has(q.id));
                                        el.indeterminate = someSelected && !allSelected;
                                    }
                                }}
                                onChange={() => toggleSelectLevel(level)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded accent-[#4f46e5] cursor-pointer flex-shrink-0"
                            />
                            <button
                                onClick={() => toggleLevel(String(level))}
                                className="flex items-center gap-3 flex-1 text-left"
                            >
                                {isExpanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                                <div
                                    className="flex items-center justify-center w-7 h-7 rounded-lg"
                                    style={{ background: meta.bg }}
                                >
                                    <LevelIcon size={15} style={{ color: meta.color }} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[14px] font-semibold text-heading">
                                        Level {level} — {meta.label}
                                    </span>
                                </div>
                                <span className="text-[12px] font-medium" style={{ color: meta.color }}>
                                    {activeCount} active
                                </span>
                                <span className="text-[12px] text-muted">
                                    / {levelQueries.length} total
                                </span>
                            </button>
                        </div>

                        {/* Level content */}
                        {isExpanded && (
                            <div className="border-t" style={{ borderColor: "#f1f5f9" }}>
                                {/* Sub-headers by layer + spoor */}
                                {[1, 2].map((layer) =>
                                    ["A", "B"].map((spoor) => {
                                        const group = levelQueries.filter(
                                            (q) => q.layer === layer && q.spoor === spoor
                                        );
                                        if (group.length === 0) return null;

                                        return (
                                            <div key={`${layer}-${spoor}`}>
                                                <div
                                                    className="flex items-center gap-2 px-5 py-2 border-b"
                                                    style={{ borderColor: "#f9fafb", background: "#fafafa" }}
                                                >
                                                    <Layers size={12} className="text-muted" />
                                                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                                                        {LAYER_LABELS[layer]} · Spoor {spoor} ({SPOOR_LABELS[spoor]})
                                                    </span>
                                                    <span className="text-[11px] text-muted ml-auto">
                                                        {group.length} queries
                                                    </span>
                                                </div>

                                                {group.map((q) => (
                                                    <QueryRow
                                                        key={q.id}
                                                        query={q}
                                                        loading={loading}
                                                        isSelected={selectedIds.has(q.id)}
                                                        onSelect={() => toggleSelectOne(q.id)}
                                                        onToggle={() => toggleActive(q.id, q.is_active)}
                                                        onDelete={() => deleteQuery(q.id)}
                                                    />
                                                ))}
                                            </div>
                                        );
                                    })
                                )}

                                {levelQueries.length === 0 && (
                                    <div className="px-5 py-8 text-center text-[13px] text-muted">
                                        No queries at this level.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function QueryRow({
    query,
    loading,
    isSelected,
    onSelect,
    onToggle,
    onDelete,
}: {
    query: SearchQuery;
    loading: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const typeInfo = TYPE_LABELS[query.search_type] || TYPE_LABELS.neural;

    return (
        <div
            className="flex items-center gap-3 px-5 py-2.5 border-b last:border-b-0 transition-colors hover:bg-surface"
            style={{
                borderColor: "#f9fafb",
                opacity: query.is_active ? 1 : 0.5,
                background: isSelected ? "#f5f3ff" : undefined,
            }}
        >
            {/* Selection checkbox */}
            <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="w-4 h-4 rounded accent-[#4f46e5] cursor-pointer flex-shrink-0"
            />
            {/* Toggle */}
            <button
                onClick={onToggle}
                disabled={loading}
                className="flex-shrink-0 transition-colors disabled:opacity-50"
                title={query.is_active ? "Disable query" : "Enable query"}
            >
                {query.is_active ? (
                    <ToggleRight size={20} style={{ color: "#10b981" }} />
                ) : (
                    <ToggleLeft size={20} style={{ color: "#cbd5e1" }} />
                )}
            </button>

            {/* Type badge */}
            <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex-shrink-0"
                style={{
                    background: typeInfo.color + "15",
                    color: typeInfo.color,
                }}
            >
                {typeInfo.label}
            </span>

            {/* Query text */}
            <span className="flex-1 text-[13px] text-heading min-w-0 truncate">
                {query.query_text}
            </span>

            {/* Delete */}
            {confirmDelete ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[11px] text-error font-medium">Delete?</span>
                    <button
                        onClick={() => { onDelete(); setConfirmDelete(false); }}
                        disabled={loading}
                        className="px-2 py-0.5 rounded text-[11px] font-medium text-white disabled:opacity-50"
                        style={{ background: "#dc2626" }}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-0.5 rounded text-[11px] font-medium border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                        No
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Delete query"
                >
                    <Trash2 size={14} style={{ color: "#dc2626" }} />
                </button>
            )}
        </div>
    );
}
