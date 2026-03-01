"use client";

import { useState, useCallback } from "react";
import {
    Check,
    X,
    Trash2,
    Pencil,
    CheckCircle2,
    XCircle,
    ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";

interface ReviewItem {
    id: string;
    item_type: string;
    item_name: string | null;
    reason: string | null;
    status: string;
    created_at: string;
    item_id: string | null;
}

interface ReviewTableProps {
    initialReviews: ReviewItem[];
}

export default function ReviewTable({ initialReviews }: ReviewTableProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(false);
    const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

    const supabase = createClient();

    const allSelected =
        reviews.length > 0 && selected.size === reviews.length;
    const someSelected = selected.size > 0;

    const toggleSelect = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(reviews.map((r) => r.id)));
        }
    }, [allSelected, reviews]);

    async function updateStatus(ids: string[], status: string) {
        setLoading(true);
        const { error } = await supabase
            .from("review_queue")
            .update({ status, reviewed_at: new Date().toISOString() })
            .in("id", ids);

        if (!error) {
            setReviews((prev) =>
                prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
            );
            setSelected(new Set());
        }
        setLoading(false);
        setBulkMenuOpen(false);
    }

    async function deleteItems(ids: string[]) {
        setLoading(true);
        const { error } = await supabase
            .from("review_queue")
            .delete()
            .in("id", ids);

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
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, item_name: editName } : r))
            );
        }
        setEditingId(null);
        setLoading(false);
    }

    const pendingCount = reviews.filter((r) => r.status === "pending").length;
    const approvedCount = reviews.filter((r) => r.status === "approved").length;
    const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

    return (
        <>
            {/* Status counts */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#fef3c7" }}
                >
                    <span
                        className="text-[13px] font-semibold"
                        style={{ color: "#92400e" }}
                    >
                        {pendingCount} Pending
                    </span>
                </div>
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#d1fae5" }}
                >
                    <span
                        className="text-[13px] font-semibold"
                        style={{ color: "#065f46" }}
                    >
                        {approvedCount} Approved
                    </span>
                </div>
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#fee2e2" }}
                >
                    <span
                        className="text-[13px] font-semibold"
                        style={{ color: "#9f1239" }}
                    >
                        {rejectedCount} Rejected
                    </span>
                </div>
            </div>

            {/* Bulk action bar */}
            {someSelected && (
                <div
                    className="flex items-center gap-3 px-5 py-3 mb-4 rounded-xl border"
                    style={{
                        backgroundColor: "#eff6ff",
                        borderColor: "#bfdbfe",
                    }}
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
                            style={{
                                background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                                color: "white",
                            }}
                        >
                            Bulk Actions
                            <ChevronDown size={14} />
                        </button>

                        {bulkMenuOpen && (
                            <div
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl border overflow-hidden z-50"
                                style={{
                                    borderColor: "#e2e8f0",
                                    minWidth: "180px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <button
                                    onClick={() =>
                                        updateStatus(Array.from(selected), "approved")
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#065f46" }}
                                >
                                    <CheckCircle2 size={16} />
                                    Approve All
                                </button>
                                <button
                                    onClick={() =>
                                        updateStatus(Array.from(selected), "rejected")
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#9f1239" }}
                                >
                                    <XCircle size={16} />
                                    Reject All
                                </button>
                                <div
                                    className="border-t"
                                    style={{ borderColor: "#f1f5f9" }}
                                />
                                <button
                                    onClick={() => deleteItems(Array.from(selected))}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-surface transition-colors text-left"
                                    style={{ color: "#dc2626" }}
                                >
                                    <Trash2 size={16} />
                                    Delete All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div
                className="bg-white rounded-xl border overflow-hidden"
                style={{
                    borderColor: "#e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
            >
                {/* Header */}
                <div
                    className="grid grid-cols-12 gap-3 px-5 py-3 border-b text-[11px] font-semibold text-muted uppercase tracking-wider items-center"
                    style={{ borderColor: "#f1f5f9", backgroundColor: "#fafafa" }}
                >
                    <div className="col-span-1 flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded cursor-pointer accent-primary"
                        />
                    </div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Reason</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Empty state */}
                {reviews.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-[48px] mb-4">✅</div>
                        <h3 className="text-[18px] font-bold text-heading mb-2">
                            All caught up!
                        </h3>
                        <p className="text-[14px] text-muted">
                            No items in the review queue.
                        </p>
                    </div>
                )}

                {/* Rows */}
                {reviews.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b last:border-b-0 items-center transition-colors"
                        style={{
                            borderColor: "#f1f5f9",
                            backgroundColor: selected.has(item.id)
                                ? "#eff6ff"
                                : "transparent",
                        }}
                    >
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={selected.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="w-4 h-4 rounded cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Type */}
                        <div className="col-span-2">
                            <span
                                className="px-2 py-0.5 rounded text-[11px] font-medium capitalize"
                                style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                            >
                                {item.item_type}
                            </span>
                        </div>

                        {/* Name */}
                        <div className="col-span-3 min-w-0">
                            {editingId === item.id ? (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") saveEdit(item.id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        autoFocus
                                        className="flex-1 h-7 px-2 rounded border text-[13px] outline-none focus:border-primary"
                                        style={{ borderColor: "#e2e8f0" }}
                                    />
                                    <button
                                        onClick={() => saveEdit(item.id)}
                                        className="p-1 rounded hover:bg-surface transition-colors"
                                    >
                                        <Check size={14} className="text-success" />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 rounded hover:bg-surface transition-colors"
                                    >
                                        <X size={14} className="text-muted" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-[13px] text-heading font-medium truncate block">
                                    {item.item_name || "Unnamed"}
                                </span>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="col-span-2 text-[12px] text-muted truncate">
                            {item.reason || "—"}
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                            <StatusBadge status={item.status} />
                        </div>

                        {/* Date */}
                        <div className="col-span-1 text-[11px] text-muted">
                            {new Date(item.created_at).toLocaleDateString("en-GB", {
                                month: "short",
                                day: "numeric",
                            })}
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-1">
                            {item.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => updateStatus([item.id], "approved")}
                                        disabled={loading}
                                        className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
                                        title="Approve"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            style={{ color: "#10b981" }}
                                        />
                                    </button>
                                    <button
                                        onClick={() => updateStatus([item.id], "rejected")}
                                        disabled={loading}
                                        className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
                                        title="Reject"
                                    >
                                        <XCircle size={16} style={{ color: "#f43f5e" }} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setEditingId(item.id);
                                    setEditName(item.item_name || "");
                                }}
                                disabled={loading}
                                className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
                                title="Edit"
                            >
                                <Pencil size={14} className="text-muted" />
                            </button>
                            <button
                                onClick={() => deleteItems([item.id])}
                                disabled={loading}
                                className="p-1.5 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
                                title="Delete"
                            >
                                <Trash2 size={14} style={{ color: "#dc2626" }} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
