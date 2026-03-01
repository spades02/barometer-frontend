import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";

export default async function TrendingPage() {
    const supabase = await createClient();

    const { data: trends } = await supabase
        .from("trends")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

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
                {/* Trend cards list */}
                <div className="space-y-4">
                    {trends?.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-[48px] mb-4">📈</div>
                            <h3 className="text-[18px] font-bold text-heading mb-2">
                                No trends detected yet
                            </h3>
                            <p className="text-[14px] text-muted">
                                Trends will appear as data collection workflows run.
                            </p>
                        </div>
                    )}
                    {trends?.map(
                        (trend: {
                            id: string;
                            title: string;
                            description: string | null;
                            status: string;
                            source_count: number;
                            created_at: string;
                        }) => (
                            <div
                                key={trend.id}
                                className="bg-white rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer"
                                style={{
                                    borderColor: "#e2e8f0",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-[15px] font-bold text-heading truncate">
                                                {trend.title}
                                            </h3>
                                            <StatusBadge status={trend.status} />
                                        </div>
                                        <p className="text-[13px] text-muted line-clamp-2">
                                            {trend.description || "No description available."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-center">
                                            <div
                                                className="text-[18px] font-bold"
                                                style={{ color: "#1d4ed8" }}
                                            >
                                                {trend.source_count}
                                            </div>
                                            <div className="text-[11px] text-subtle">Sources</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[12px] text-muted">
                                                {new Date(trend.created_at).toLocaleDateString("en-GB", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <div className="text-[11px] text-subtle">Detected</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
