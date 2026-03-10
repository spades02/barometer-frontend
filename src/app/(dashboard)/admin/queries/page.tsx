import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SearchQueriesPanel from "@/components/SearchQueriesPanel";

export default async function QueriesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("email", user.email!)
        .maybeSingle();

    if (!adminRecord?.is_active) redirect("/");

    // Fetch sectors
    const { data: sectors } = await supabase
        .from("sectors")
        .select("id, name, name_nl, is_active")
        .eq("is_active", true)
        .order("name");

    // Fetch all queries for active sectors
    const sectorIds = (sectors || []).map((s) => s.id);
    const { data: queries } = await supabase
        .from("search_queries")
        .select("*")
        .in("sector_id", sectorIds)
        .order("level")
        .order("layer")
        .order("spoor")
        .order("sort_order");

    // Fetch recent sources found (latest 50)
    const { data: recentSources } = await supabase
        .from("sources")
        .select("id, title, url, publisher, authority_score, triage_score, triage_status, publication_date, created_at, sector_id")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">
                    Research Queries
                </h2>
                <p className="text-[13px] text-muted">
                    Manage Exa search queries per sector and level. Add, remove, or toggle queries used by the WF1 research sweep.
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                <SearchQueriesPanel
                    sectors={sectors || []}
                    initialQueries={queries || []}
                    recentSources={recentSources || []}
                />
            </div>
        </>
    );
}
