import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import type { SectorSkill } from "@/lib/types";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch all sector_skills (client-side filtering/pagination)
    const { data: sectorSkills } = await supabase
        .from("sector_skills")
        .select("*, skill:skills(*), sector:sectors(*)")
        .order("priority_score", { ascending: false })
        .limit(200);

    // Fetch active sectors for filter dropdown
    const { data: sectors } = await supabase
        .from("sectors")
        .select("name")
        .eq("is_active", true)
        .order("name");

    // Stats for pulse card
    const { count: totalSkills } = await supabase
        .from("skills")
        .select("*", { count: "exact", head: true });

    const { count: totalTrends } = await supabase
        .from("trends")
        .select("*", { count: "exact", head: true });

    const { count: totalSources } = await supabase
        .from("sources")
        .select("*", { count: "exact", head: true });

    return (
        <Dashboard
            sectorSkills={(sectorSkills as SectorSkill[]) || []}
            sectors={sectors?.map((s: any) => s.name) || []}
            stats={{
                totalSkills: totalSkills ?? 0,
                totalTrends: totalTrends ?? 0,
                totalSources: totalSources ?? 0,
            }}
        />
    );
}
