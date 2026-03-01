import { createClient } from "@/lib/supabase/server";
import SkillList from "@/components/SkillList";
import type { SectorSkill } from "@/lib/types";

export default async function QuickWinsPage() {
    const supabase = await createClient();

    const { data: quickWins } = await supabase
        .from("sector_skills")
        .select("*, skill:skills(*), sector:sectors(*)")
        .gte("quick_win_score", 3)
        .order("quick_win_score", { ascending: false })
        .limit(20);

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">Quick Wins</h2>
                <p className="text-[13px] text-muted">
                    Low-effort, high-impact skills that can be quickly implemented in VET programs
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                <SkillList sectorSkills={(quickWins as SectorSkill[]) || []} />
            </div>
        </>
    );
}
