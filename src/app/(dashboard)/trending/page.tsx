import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import MomentumChart from "@/components/MomentumChart";
import TrendTable from "@/components/TrendTable";

interface TrendingPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    const page = Number(params.page) || 1;
    const pageSize = 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data: rawTrends, count } = await supabase
        .from("trends")
        .select(`
            *,
            skill_trend_links (
                skills (
                    tags
                )
            )
        `, { count: "exact" })
        .order("source_count", { ascending: false })
        .range(start, end);

    const totalPages = Math.ceil((count || 0) / pageSize);

    // Format the trends to extract tags from nested relations and mock momentum
    const trends = (rawTrends || []).map((t: any) => {
        const tagSet = new Set<string>();
        t.skill_trend_links?.forEach((link: any) => {
            if (link.skills?.tags) {
                link.skills.tags.forEach((tag: string) => tagSet.add(tag));
            }
        });
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            source_count: t.source_count,
            created_at: t.created_at,
            momentum: t.source_count * 10 || 50, // Mock momentum based on source count
            tags: Array.from(tagSet),
        };
    });

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">
                    Trending Analysis
                </h2>
                <p className="text-[13px] text-muted">
                    Discover emerging trends and market signals shaping VET skills
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Momentum Chart */}
                    <MomentumChart data={trends} />

                    {/* Trends Table */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Top Trending Skills</h3>
                                <p className="text-sm text-slate-500">Highest momentum signals grouped by domain</p>
                            </div>
                        </div>
                        <TrendTable trends={trends} />
                    </div>
                </div>
                {/* Pagination */}
                <Pagination totalPages={totalPages} />
            </div>
        </>
    );
}
