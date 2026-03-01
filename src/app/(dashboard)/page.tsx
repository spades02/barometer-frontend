import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/StatsCard";
import SkillCard from "@/components/SkillCard";
import FilterPanel from "@/components/FilterPanel";
import type { SectorSkill, Sector } from "@/lib/types";

interface DashboardProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
    const params = await searchParams;
    const supabase = await createClient();

    // Fetch sectors
    const { data: sectors } = await supabase
        .from("sectors")
        .select("*")
        .eq("is_active", true)
        .order("name");

    // Build skill query with filters
    let query = supabase
        .from("sector_skills")
        .select("*, skill:skills(*), sector:sectors(*)")
        .order("priority_score", { ascending: false });

    // Apply sector filter
    if (params.sector) {
        const sector = (sectors as Sector[])?.find(
            (s) => s.name === params.sector
        );
        if (sector) {
            query = query.eq("sector_id", sector.id);
        }
    }

    // Apply impact filter
    if (params.impact) {
        switch (params.impact) {
            case "High":
                query = query.gte("impact_score", 7);
                break;
            case "Medium":
                query = query.gte("impact_score", 4).lt("impact_score", 7);
                break;
            case "Low":
                query = query.lt("impact_score", 4);
                break;
        }
    }

    // Apply sorting
    const sortColumn = (() => {
        switch (params.sort) {
            case "Trending":
                return "trending_score";
            case "Impact":
                return "impact_score";
            case "Urgency":
                return "urgency_score";
            case "Alphabetical":
                return "created_at"; // fallback
            default:
                return "priority_score";
        }
    })();
    query = query.order(sortColumn, { ascending: false });

    const { data: sectorSkills } = await query.limit(20);

    // Fetch stats
    const { count: totalSkills } = await supabase
        .from("skills")
        .select("*", { count: "exact", head: true });

    const { count: totalTrends } = await supabase
        .from("trends")
        .select("*", { count: "exact", head: true });

    const { count: totalSectors } = await supabase
        .from("sectors")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

    const { count: pendingReviews } = await supabase
        .from("review_queue")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    const stats = [
        {
            value: totalSkills ?? 0,
            label: "Total Skills Tracked",
            trend: "+12%",
            trendUp: true,
        },
        {
            value: totalTrends ?? 0,
            label: "Active Trends",
            trend: "+8%",
            trendUp: true,
        },
        {
            value: totalSectors ?? 0,
            label: "Sectors Covered",
            trend: "+2",
            trendUp: true,
        },
        {
            value: pendingReviews ?? 0,
            label: "Pending Reviews",
            trend: pendingReviews ? `${pendingReviews}` : "0",
            trendUp: false,
        },
    ];

    return (
        <>
            {/* Dashboard Header */}
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">
                    Skill dashboard
                </h2>
                <p className="text-[13px] text-muted">
                    This is a description of what people can expect and what people should
                    do etc. etc.
                </p>
            </div>

            {/* Filter Panel */}
            <Suspense fallback={null}>
                <FilterPanel sectors={(sectors as Sector[]) || []} />
            </Suspense>

            {/* Content */}
            <div className="px-6 lg:px-8 py-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    {stats.map((stat) => (
                        <StatsCard key={stat.label} {...stat} />
                    ))}
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-5">
                    {(sectorSkills as SectorSkill[])?.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-[48px] mb-4">🔍</div>
                            <h3 className="text-[18px] font-bold text-heading mb-2">
                                No skills found
                            </h3>
                            <p className="text-[14px] text-muted">
                                Try adjusting your filters or check back later.
                            </p>
                        </div>
                    )}
                    {(sectorSkills as SectorSkill[])?.map((ss) => (
                        <SkillCard key={ss.id} sectorSkill={ss} />
                    ))}
                </div>
            </div>
        </>
    );
}
