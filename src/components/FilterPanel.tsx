"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X, LayoutGrid, List } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Sector } from "@/lib/types";

interface FilterPanelProps {
    sectors: Sector[];
}

type FilterKey = "sector" | "impact" | "horizon" | "effort" | "timeRange";

const FILTER_OPTIONS: Record<FilterKey, { label: string; options: string[] }> = {
    sector: { label: "All sectors", options: [] }, // populated dynamically
    impact: { label: "Impact level", options: ["High", "Medium", "Low"] },
    horizon: {
        label: "Time horizon",
        options: ["Short-term", "Medium-term", "Long-term"],
    },
    effort: { label: "Effort level", options: ["Low", "Medium", "High"] },
    timeRange: {
        label: "Time range",
        options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"],
    },
};

const SORT_OPTIONS = [
    "Priority",
    "Trending",
    "Impact",
    "Urgency",
    "Alphabetical",
];

export default function FilterPanel({ sectors }: FilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [openDropdown, setOpenDropdown] = useState<FilterKey | "sort" | null>(
        null
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Read active filters from URL
    const activeFilters: Record<FilterKey, string | null> = {
        sector: searchParams.get("sector"),
        impact: searchParams.get("impact"),
        horizon: searchParams.get("horizon"),
        effort: searchParams.get("effort"),
        timeRange: searchParams.get("timeRange"),
    };
    const sortBy = searchParams.get("sort") || "Priority";
    const view = (searchParams.get("view") as "grouped" | "list") || "grouped";

    const updateParams = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            router.push(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    const selectedChips = (Object.keys(activeFilters) as FilterKey[])
        .filter((k) => activeFilters[k])
        .map((k) => ({
            key: k,
            label: activeFilters[k]!,
        }));

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function FilterDropdown({
        filterKey,
        label,
        options,
    }: {
        filterKey: FilterKey;
        label: string;
        options: string[];
    }) {
        const isOpen = openDropdown === filterKey;
        const hasValue = !!activeFilters[filterKey];

        return (
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all text-[13px]"
                    style={{
                        borderColor: hasValue ? "#1d4ed8" : "#e2e8f0",
                        backgroundColor: hasValue ? "#eff6ff" : "white",
                        color: hasValue ? "#1d4ed8" : "#64748b",
                        fontWeight: hasValue ? 500 : 400,
                    }}
                >
                    <span>{hasValue ? activeFilters[filterKey] : label}</span>
                    <ChevronDown
                        size={14}
                        className="transition-transform"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                </button>

                {isOpen && (
                    <div
                        className="absolute top-full mt-1 left-0 bg-white rounded-lg border overflow-hidden z-30"
                        style={{
                            borderColor: "#e2e8f0",
                            minWidth: "160px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    updateParams(filterKey, opt);
                                    setOpenDropdown(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-surface"
                                style={{
                                    color:
                                        activeFilters[filterKey] === opt ? "#1d4ed8" : "#475569",
                                    fontWeight: activeFilters[filterKey] === opt ? 500 : 400,
                                    backgroundColor:
                                        activeFilters[filterKey] === opt
                                            ? "#eff6ff"
                                            : "transparent",
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={dropdownRef}
            className="bg-white border-b px-6 lg:px-8 py-4"
            style={{ borderColor: "#e2e8f0" }}
        >
            <div className="flex flex-col gap-3">
                {/* Top row: Filters + Sorting/View */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    {/* Left: Filter dropdowns */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-heading mr-1">
                            Filters
                        </span>
                        <FilterDropdown
                            filterKey="sector"
                            label="All sectors"
                            options={sectors.map((s) => s.name)}
                        />
                        <FilterDropdown
                            filterKey="impact"
                            label="Impact level"
                            options={FILTER_OPTIONS.impact.options}
                        />
                        <FilterDropdown
                            filterKey="horizon"
                            label="Time horizon"
                            options={FILTER_OPTIONS.horizon.options}
                        />
                        <FilterDropdown
                            filterKey="effort"
                            label="Effort level"
                            options={FILTER_OPTIONS.effort.options}
                        />
                        <FilterDropdown
                            filterKey="timeRange"
                            label="Time range"
                            options={FILTER_OPTIONS.timeRange.options}
                        />
                    </div>

                    {/* Right: Sorting + View */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Sorting */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-muted">Sorting</span>
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setOpenDropdown(openDropdown === "sort" ? null : "sort")
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[13px]"
                                    style={{
                                        borderColor: "#e2e8f0",
                                        backgroundColor: "white",
                                        color: "#475569",
                                    }}
                                >
                                    <span>{sortBy}</span>
                                    <ChevronDown size={14} />
                                </button>

                                {openDropdown === "sort" && (
                                    <div
                                        className="absolute top-full mt-1 right-0 bg-white rounded-lg border overflow-hidden z-30"
                                        style={{
                                            borderColor: "#e2e8f0",
                                            minWidth: "140px",
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                        }}
                                    >
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    updateParams("sort", opt);
                                                    setOpenDropdown(null);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-surface"
                                                style={{
                                                    color: sortBy === opt ? "#1d4ed8" : "#475569",
                                                    fontWeight: sortBy === opt ? 500 : 400,
                                                    backgroundColor:
                                                        sortBy === opt ? "#eff6ff" : "transparent",
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-muted">View</span>
                            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
                                <button
                                    onClick={() => updateParams("view", "grouped")}
                                    className="flex items-center gap-1 px-3 py-1.5 text-[13px] transition-all"
                                    style={{
                                        backgroundColor: view === "grouped" ? "#eff6ff" : "white",
                                        color: view === "grouped" ? "#1d4ed8" : "#64748b",
                                        fontWeight: view === "grouped" ? 500 : 400,
                                        borderRight: "1px solid #e2e8f0",
                                    }}
                                >
                                    <LayoutGrid size={14} />
                                    <span className="hidden sm:inline">Grouped</span>
                                </button>
                                <button
                                    onClick={() => updateParams("view", "list")}
                                    className="flex items-center gap-1 px-3 py-1.5 text-[13px] transition-all"
                                    style={{
                                        backgroundColor: view === "list" ? "#eff6ff" : "white",
                                        color: view === "list" ? "#1d4ed8" : "#64748b",
                                        fontWeight: view === "list" ? 500 : 400,
                                    }}
                                >
                                    <List size={14} />
                                    <span className="hidden sm:inline">List</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected chips row */}
                {selectedChips.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-muted mr-1">Selected</span>
                        {selectedChips.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => updateParams(key, null)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full transition-all text-[12px] border hover:border-coral hover:bg-coral-light"
                                style={{
                                    backgroundColor: "#f1f5f9",
                                    borderColor: "#e2e8f0",
                                    color: "#475569",
                                }}
                            >
                                <span>{label}</span>
                                <X size={12} />
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (searchParams.get("sort"))
                                    params.set("sort", searchParams.get("sort")!);
                                if (searchParams.get("view"))
                                    params.set("view", searchParams.get("view")!);
                                router.push(`?${params.toString()}`, { scroll: false });
                            }}
                            className="text-[12px] text-coral hover:underline ml-1"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
