"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
    id: string;
    title: string;
    type: "Skill" | "Trend" | "Quick Win";
    url: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchTasks = async () => {
            if (!query.trim()) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            setIsOpen(true);

            const searchTerms = `%${query}%`;

            try {
                // Fetch matching skills
                const { data: skillsData } = await supabase
                    .from("skills")
                    .select("id, name")
                    .ilike("name", searchTerms)
                    .limit(4);

                // Fetch matching trends
                const { data: trendsData } = await supabase
                    .from("trends")
                    .select("id, title")
                    .ilike("title", searchTerms)
                    .limit(3);

                // Fetch quick wins (sector_skills with high quick_win_score that join with matching skills)
                const { data: quickWinsData } = await supabase
                    .from("sector_skills")
                    .select("id, skill_id, quick_win_score, skill:skills(name)")
                    .gte("quick_win_score", 3)
                    .limit(3);

                // Filter quick wins manually since we can't ilike on joined tables easily without RPC
                const filteredQuickWins = (quickWinsData || [])
                    .filter(qw => {
                        const s = qw.skill as any;
                        return s && s.name && s.name.toLowerCase().includes(query.toLowerCase());
                    })

                const combined: SearchResult[] = [];

                if (skillsData) {
                    skillsData.forEach((s) => {
                        combined.push({
                            id: s.id,
                            title: s.name,
                            type: "Skill",
                            url: `/skills/${s.id}`,
                        });
                    });
                }

                if (trendsData) {
                    trendsData.forEach((t) => {
                        combined.push({
                            id: t.id,
                            title: t.title,
                            type: "Trend",
                            url: `/trending`,
                        });
                    });
                }

                if (filteredQuickWins && filteredQuickWins.length > 0) {
                    filteredQuickWins.forEach((qw) => {
                        const name = (qw.skill as any).name;
                        // Only add if not already added as a skill
                        if (!combined.some(c => c.type === "Skill" && c.title === name)) {
                            combined.push({
                                id: qw.skill_id,
                                title: name,
                                type: "Quick Win",
                                url: `/skills/${qw.skill_id}`
                            });
                        }
                    })
                }

                setResults(combined);
            } catch (e) {
                console.error("Search error", e);
            }

            setLoading(false);
        };

        const timer = setTimeout(() => {
            searchTasks();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (url: string) => {
        setIsOpen(false);
        setQuery("");
        router.push(url);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div
                className="flex items-center gap-2 px-3 h-[36px] rounded-lg bg-surface transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white"
                style={{ width: "260px" }}
            >
                <Search size={16} className="text-subtle shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true);
                    }}
                    placeholder="Search skills, trends..."
                    className="bg-transparent border-none outline-none text-[13px] w-full text-text placeholder:text-subtle"
                />
                {loading && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
            </div>

            {isOpen && query.trim() && (
                <div
                    className="absolute top-full mt-2 w-full sm:w-[320px] right-0 sm:right-auto bg-white rounded-xl overflow-hidden z-50 border"
                    style={{
                        borderColor: "#e2e8f0",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    {loading && results.length === 0 ? (
                        <div className="p-4 text-center text-[13px] text-muted">Thinking...</div>
                    ) : results.length > 0 ? (
                        <div className="py-2 flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
                            {results.map((result, idx) => (
                                <button
                                    key={`${result.type}-${result.id}-${idx}`}
                                    onClick={() => handleNavigate(result.url)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors flex flex-col gap-0.5 group"
                                >
                                    <span className="text-[13px] font-medium text-heading line-clamp-1 group-hover:text-primary transition-colors">
                                        {result.title}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                                            style={{
                                                background: result.type === 'Skill' ? '#eff6ff' : result.type === 'Trend' ? '#fdf4ff' : '#ecfdf5',
                                                color: result.type === 'Skill' ? '#1d4ed8' : result.type === 'Trend' ? '#a21caf' : '#047857'
                                            }}
                                        >
                                            {result.type}
                                        </span>
                                        <span className="text-[11px] text-subtle">
                                            on {result.type === 'Skill' ? 'Skills Library' : result.type === 'Trend' ? 'Trending Analysis' : 'Quick Wins'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-[13px] font-medium text-heading">No results found</p>
                            <p className="text-[12px] text-muted">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
