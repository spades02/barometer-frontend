"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { useSavedItems } from "@/lib/saved-items-context";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
    isAdmin: boolean;
    userName: string;
    userEmail: string;
}

const mainTabs = [
    { label: "Skills", href: "/" },
    { label: "Trends", href: "/trending" },
    { label: "Sources", href: "/sources" },
    { label: "Funding", href: "/funding" },
    { label: "Quick Wins", href: "/quick-wins" },
];

const adminTabs = [
    { label: "Admin Review", href: "/admin" },
    { label: "Research Queries", href: "/admin/queries" },
    { label: "Settings", href: "/settings" },
];

interface SavedDetail {
    item_type: string;
    item_id: string;
    name: string;
    subtitle: string;
}

export default function DashboardHeader({ isAdmin, userName, userEmail }: DashboardHeaderProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [savedPanelOpen, setSavedPanelOpen] = useState(false);
    const [savedDetails, setSavedDetails] = useState<SavedDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { savedItems, savedCount, toggleSave } = useSavedItems();

    const allTabs = isAdmin ? [...mainTabs, ...adminTabs] : mainTabs;
    const displayName = userName || userEmail.split("@")[0] || "User";
    const initials = getInitials(displayName);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Fetch names for saved items when panel opens
    useEffect(() => {
        if (!savedPanelOpen || savedItems.length === 0) {
            setSavedDetails([]);
            return;
        }
        let cancelled = false;
        async function fetchDetails() {
            setLoadingDetails(true);
            const supabase = createClient();
            const details: SavedDetail[] = [];

            const skillIds = savedItems.filter(s => s.item_type === "skill").map(s => s.item_id);
            const trendIds = savedItems.filter(s => s.item_type === "trend").map(s => s.item_id);
            const sourceIds = savedItems.filter(s => s.item_type === "source").map(s => s.item_id);
            const fundingIds = savedItems.filter(s => s.item_type === "funding").map(s => s.item_id);

            if (skillIds.length > 0) {
                const { data } = await supabase
                    .from("sector_skills")
                    .select("id, skill:skills(name), sector:sectors(name)")
                    .in("id", skillIds);
                data?.forEach((d: any) => details.push({
                    item_type: "skill", item_id: d.id,
                    name: d.skill?.name || "Unknown skill",
                    subtitle: d.sector?.name || "Cross-sector",
                }));
            }
            if (trendIds.length > 0) {
                const { data } = await supabase.from("trends").select("id, title").in("id", trendIds);
                data?.forEach(d => details.push({ item_type: "trend", item_id: d.id, name: d.title, subtitle: "Trend" }));
            }
            if (sourceIds.length > 0) {
                const { data } = await supabase.from("sources").select("id, title, publisher").in("id", sourceIds);
                data?.forEach(d => details.push({ item_type: "source", item_id: d.id, name: d.title, subtitle: d.publisher || "Source" }));
            }
            if (fundingIds.length > 0) {
                const { data } = await supabase.from("funding_options").select("id, name, type").in("id", fundingIds);
                data?.forEach(d => details.push({ item_type: "funding", item_id: d.id, name: d.name, subtitle: d.type || "Funding" }));
            }

            if (!cancelled) {
                setSavedDetails(details);
                setLoadingDetails(false);
            }
        }
        fetchDetails();
        return () => { cancelled = true; };
    }, [savedPanelOpen, savedItems]);

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        // Exact match for /admin, but allow /admin/* for admin subpages
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    const typeColors: Record<string, string> = {
        skill: "#2563eb",
        trend: "#059669",
        source: "#d97706",
        funding: "#7c3aed",
    };

    return (
        <>
            <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px 0 32px", position: "sticky", top: 0, zIndex: 50 }}>
                <style>{`
                    .dh-tab{display:flex;align-items:center;gap:6px;font-family:inherit;font-size:13px;font-weight:500;color:#64748b;text-decoration:none;padding:10px 14px;border-radius:8px 8px 0 0;transition:all 0.15s;white-space:nowrap;}
                    .dh-tab.active{color:white;font-weight:600;background:linear-gradient(135deg,#1d4ed8,#4f46e5);}
                    .dh-tab:hover:not(.active){color:#334155;background:#f1f5f9;}
                `}</style>

                {/* Top row: logo + saved + user */}
                <div style={{ display: "flex", alignItems: "center", height: 56, justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3L21 21M3 21L21 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>VET Skills Barometer</span>
                    </Link>

                    <div ref={userMenuRef} style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                        {/* Saved items button */}
                        <button onClick={() => setSavedPanelOpen(true)} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            background: savedCount > 0 ? "#fef2f2" : "white",
                            border: `1px solid ${savedCount > 0 ? "#fecaca" : "#e5e7eb"}`,
                            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                            fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                            color: savedCount > 0 ? "#dc2626" : "#9ca3af",
                            transition: "all 0.15s",
                        }}>
                            <svg width="14" height="14" viewBox="0 0 20 20"
                                fill={savedCount > 0 ? "#ef4444" : "none"}
                                stroke={savedCount > 0 ? "#ef4444" : "#d1d5db"} strokeWidth="1.8">
                                <path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {savedCount}
                        </button>

                        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{displayName}</span>
                        <div onClick={() => setShowUserMenu(!showUserMenu)} style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 600, color: "white", cursor: "pointer",
                        }}>{initials}</div>
                        {showUserMenu && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white",
                                border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                zIndex: 200, minWidth: 200, overflow: "hidden",
                            }}>
                                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{displayName}</div>
                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{userEmail}</div>
                                </div>
                                <form action="/auth/signout" method="POST" style={{ margin: 0, padding: 0 }}>
                                    <button
                                        type="submit"
                                        style={{
                                            width: "100%", padding: "10px 16px", background: "none", border: "none",
                                            color: "#f43f5e", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                                            textAlign: "left" as const, transition: "background 0.1s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                    >Sign Out</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation tabs */}
                <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
                    {allTabs.map(t => (
                        <Link key={t.href} href={t.href} className={`dh-tab ${isActive(t.href) ? "active" : ""}`}>
                            {t.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Saved items panel overlay */}
            {savedPanelOpen && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 250,
                    display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)",
                }} onClick={() => setSavedPanelOpen(false)}>
                    <div style={{
                        width: "min(540px,90vw)", maxHeight: "70vh", background: "white",
                        borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.15)", overflow: "hidden",
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                Saved items
                                {savedCount > 0 && <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginLeft: 8 }}>({savedCount})</span>}
                            </div>
                            <button onClick={() => setSavedPanelOpen(false)} style={{
                                background: "#f3f4f6", border: "none", borderRadius: 8, width: 30, height: 30,
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280",
                            }}>&#x2715;</button>
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: "55vh" }}>
                            {savedCount === 0 && (
                                <div style={{ padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                                    No saved items yet. Use the heart icon on any skill, trend, source, or funding option to save it.
                                </div>
                            )}
                            {loadingDetails && savedCount > 0 && (
                                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ height: 48, background: "#f3f4f6", borderRadius: 8 }} className="animate-pulse" />
                                    ))}
                                </div>
                            )}
                            {!loadingDetails && savedDetails.map(item => (
                                <div key={`${item.item_type}-${item.item_id}`} style={{
                                    padding: "14px 24px", borderBottom: "1px solid #f9fafb",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    transition: "background 0.1s",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, color: typeColors[item.item_type] || "#6b7280",
                                                background: (typeColors[item.item_type] || "#6b7280") + "15",
                                                padding: "2px 7px", borderRadius: 4, textTransform: "uppercase" as const,
                                                letterSpacing: "0.05em",
                                            }}>{item.item_type}</span>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                                        </div>
                                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{item.subtitle}</div>
                                    </div>
                                    <button
                                        onClick={() => toggleSave(item.item_type as any, item.item_id)}
                                        style={{
                                            background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" stroke="#ef4444" strokeWidth="1.8">
                                            <path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
