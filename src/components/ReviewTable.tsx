"use client";

import { useState, useCallback, useMemo } from "react";
import {
    Check,
    X,
    Trash2,
    Pencil,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronRight,
    Search,
    Filter,
    ExternalLink,
    FileText,
    BarChart3,
    Lightbulb,
    AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";

interface ReviewItem {
    id: string;
    item_type: string;
    item_name: string | null;
    description: string | null;
    reason: string | null;
    status: string;
    priority: number | null;
    created_at: string;
    item_id: string | null;
    reviewed_at?: string | null;
}

interface ReviewTableProps {
    initialReviews: ReviewItem[];
}

const TYPE_ICONS: Record<string, typeof FileText> = {
    source: FileText,
    trend: BarChart3,
    skill: Lightbulb,
};

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
    source: { color: "#d97706", bg: "#fffbeb" },
    trend: { color: "#059669", bg: "#ecfdf5" },
    skill: { color: "#2563eb", bg: "#eff6ff" },
    funding: { color: "#7c3aed", bg: "#f5f3ff" },
};

export default function ReviewTable({ initialReviews }: ReviewTableProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(false);
    const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = createClient();

    // Filtering
    const filteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (typeFilter !== "all" && r.item_type !== typeFilter) return false;
            if (searchTerm && !r.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
                && !r.reason?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [reviews, statusFilter, typeFilter, searchTerm]);

    // Counts
    const pendingCount = reviews.filter((r) => r.status === "pending").length;
    const approvedCount = reviews.filter((r) => r.status === "approved").length;
    const rejectedCount = reviews.filter((r) => r.status === "rejected").length;
    const types = useMemo(() => [...new Set(reviews.map((r) => r.item_type))], [reviews]);

    const allSelected = filteredReviews.length > 0 && selected.size === filteredReviews.length;
    const someSelected = selected.size > 0;

    const toggleSelect = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(filteredReviews.map((r) => r.id)));
    }, [allSelected, filteredReviews]);

    async function updateStatus(ids: string[], status: string) {
        setLoading(true);
        const { error } = await supabase
            .from("review_queue")
            .update({ status, reviewed_at: new Date().toISOString() })
            .in("id", ids);
        if (!error) {
            setReviews((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status, reviewed_at: new Date().toISOString() } : r)));
            setSelected(new Set());
        }
        setLoading(false);
        setBulkMenuOpen(false);
    }

    async function deleteItems(ids: string[]) {
        setLoading(true);
        const { error } = await supabase.from("review_queue").delete().in("id", ids);
        if (!error) {
            setReviews((prev) => prev.filter((r) => !ids.includes(r.id)));
            setSelected(new Set());
        }
        setLoading(false);
        setBulkMenuOpen(false);
    }

    async function saveEdit(id: string) {
        setLoading(true);
        const { error } = await supabase
            .from("review_queue")
            .update({ item_name: editName })
            .eq("id", id);
        if (!error) {
            setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, item_name: editName } : r)));
        }
        setEditingId(null);
        setLoading(false);
    }

    return (
        <>
            {/* Status counts */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                {[
                    { key: "all", label: `${reviews.length} Total`, bg: "#f1f5f9", color: "#475569" },
                    { key: "pending", label: `${pendingCount} Pending`, bg: "#fef3c7", color: "#92400e" },
                    { key: "approved", label: `${approvedCount} Approved`, bg: "#d1fae5", color: "#065f46" },
                    { key: "rejected", label: `${rejectedCount} Rejected`, bg: "#fee2e2", color: "#9f1239" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                        style={{
                            backgroundColor: f.bg,
                            outline: statusFilter === f.key ? `2px solid ${f.color}` : "none",
                            outlineOffset: 1,
                        }}
                    >
                        <span className="text-[13px] font-semibold" style={{ color: f.color }}>
                            {f.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                {/* Type filter */}
                <div className="flex items-center gap-1.5">
                    <Filter size={14} className="text-muted" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-8 px-2 rounded-lg border text-[13px] outline-none"
                        style={{ borderColor: "#e2e8f0" }}
                    >
                        <option value="all">All types</option>
                        {types.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1" />

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name or reason..."
                        className="h-8 pl-8 pr-3 rounded-lg border text-[13px] outline-none focus:border-primary w-56"
                        style={{ borderColor: "#e2e8f0" }}
                    />
                </div>
            </div>

            {/* Bulk action bar */}
            {someSelected && (
                <div
                    className="flex items-center gap-3 px-5 py-3 mb-4 rounded-xl border"
                    style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
                >
                    <span className="text-[13px] font-medium" style={{ color: "#1d4ed8" }}>
                        {selected.size} selected
                    </span>
                    <div className="flex-1" />
                    <div className="relative">
                        <button
                            onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)", color: "white" }}
                        >
                            Bulk Actions <ChevronDown size={14} />
                        </button>
                        {bulkMenuOpen && (
                            <div
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl border overflow-hidden z-50"
                                style={{ borderColor: "#e2e8f0", minWidth: 180, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            >
                                <button onClick={() => updateStatus(Array.from(selected), "approved")}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#065f46" }}><CheckCircle2 size={16} /> Approve All</button>
                                <button onClick={() => updateStatus(Array.from(selected), "rejected")}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#9f1239" }}><XCircle size={16} /> Reject All</button>
                                <div className="border-t" style={{ borderColor: "#f1f5f9" }} />
                                <button onClick={() => deleteItems(Array.from(selected))}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#dc2626" }}><Trash2 size={16} /> Delete All</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Header */}
                <div
                    className="grid grid-cols-12 gap-3 px-5 py-3 border-b text-[11px] font-semibold text-muted uppercase tracking-wider items-center"
                    style={{ borderColor: "#f1f5f9", backgroundColor: "#fafafa" }}
                >
                    <div className="col-span-1 flex items-center justify-center">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded cursor-pointer accent-primary" />
                    </div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Reason</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Empty state */}
                {filteredReviews.length === 0 && (
                    <div className="text-center py-16">
                        {reviews.length === 0 ? (
                            <>
                                <div className="text-[48px] mb-4">✅</div>
                                <h3 className="text-[18px] font-bold text-heading mb-2">All caught up!</h3>
                                <p className="text-[14px] text-muted">No items in the review queue.</p>
                            </>
                        ) : (
                            <>
                                <div className="text-[48px] mb-4">🔍</div>
                                <h3 className="text-[18px] font-bold text-heading mb-2">No matches</h3>
                                <p className="text-[14px] text-muted">Try adjusting your filters.</p>
                            </>
                        )}
                    </div>
                )}

                {/* Rows */}
                {filteredReviews.map((item) => {
                    const typeInfo = TYPE_COLORS[item.item_type] || { color: "#64748b", bg: "#f1f5f9" };
                    const TypeIcon = TYPE_ICONS[item.item_type] || AlertCircle;
                    const isExpanded = expandedId === item.id;

                    return (
                        <div key={item.id}>
                            <div
                                className="grid grid-cols-12 gap-3 px-5 py-3 border-b items-center transition-colors cursor-pointer"
                                style={{
                                    borderColor: "#f1f5f9",
                                    backgroundColor: selected.has(item.id) ? "#eff6ff" : isExpanded ? "#fafafa" : "transparent",
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            >
                                {/* Checkbox */}
                                <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded cursor-pointer accent-primary" />
                                </div>

                                {/* Type */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: typeInfo.bg }}>
                                        <TypeIcon size={13} style={{ color: typeInfo.color }} />
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium capitalize" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                                        {item.item_type}
                                    </span>
                                </div>

                                {/* Name */}
                                <div className="col-span-3 min-w-0" onClick={(e) => e.stopPropagation()}>
                                    {editingId === item.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                                                autoFocus
                                                className="flex-1 h-7 px-2 rounded border text-[13px] outline-none focus:border-primary"
                                                style={{ borderColor: "#e2e8f0" }}
                                            />
                                            <button onClick={() => saveEdit(item.id)} className="p-1 rounded hover:bg-surface transition-colors">
                                                <Check size={14} className="text-success" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-surface transition-colors">
                                                <X size={14} className="text-muted" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[13px] text-heading font-medium truncate block">{item.item_name || "Unnamed"}</span>
                                    )}
                                </div>

                                {/* Reason */}
                                <div className="col-span-2 text-[12px] text-muted truncate">
                                    {item.reason || "—"}
                                </div>

                                {/* Priority */}
                                <div className="col-span-1">
                                    {item.priority != null ? (
                                        <span
                                            className="px-2 py-0.5 rounded text-[11px] font-semibold"
                                            style={{
                                                background: item.priority >= 8 ? "#fee2e2" : item.priority >= 5 ? "#fef3c7" : "#f1f5f9",
                                                color: item.priority >= 8 ? "#dc2626" : item.priority >= 5 ? "#d97706" : "#64748b",
                                            }}
                                        >
                                            P{item.priority}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-muted">—</span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                    <StatusBadge status={item.status} />
                                </div>

                                {/* Date */}
                                <div className="col-span-1 text-[11px] text-muted">
                                    {new Date(item.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                    {item.status === "pending" && (
                                        <>
                                            <button onClick={() => updateStatus([item.id], "approved")} disabled={loading}
                                                className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50" title="Approve">
                                                <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                                            </button>
                                            <button onClick={() => updateStatus([item.id], "rejected")} disabled={loading}
                                                className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50" title="Reject">
                                                <XCircle size={16} style={{ color: "#f43f5e" }} />
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => { setEditingId(item.id); setEditName(item.item_name || ""); }} disabled={loading}
                                        className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50" title="Edit">
                                        <Pencil size={14} className="text-muted" />
                                    </button>
                                    <button onClick={() => deleteItems([item.id])} disabled={loading}
                                        className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50" title="Delete">
                                        <Trash2 size={14} style={{ color: "#dc2626" }} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded detail row */}
                            {isExpanded && (
                                <div className="px-5 py-4 border-b" style={{ borderColor: "#f1f5f9", background: "#fafafa" }}>
                                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                                        <div>
                                            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Description</div>
                                            <p className="text-heading">{item.description || "No description provided."}</p>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Details</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-muted">Item ID</span>
                                                    <span className="text-heading font-mono text-[12px]">{item.item_id?.slice(0, 8) || "—"}...</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted">Created</span>
                                                    <span className="text-heading">{new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                                                </div>
                                                {item.reviewed_at && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted">Reviewed</span>
                                                        <span className="text-heading">{new Date(item.reviewed_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                                                    </div>
                                                )}
                                                {item.priority != null && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted">Priority</span>
                                                        <span className="text-heading font-semibold">{item.priority}/10</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {item.reason && (
                                        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#e2e8f0" }}>
                                            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">AI Reason</div>
                                            <p className="text-[13px] text-heading">{item.reason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
