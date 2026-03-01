import { createClient } from "@/lib/supabase/server";
import SkillCard from "@/components/SkillCard";
import type { SectorSkill } from "@/lib/types";

export default async function SkillsPage() {
    const supabase = await createClient();

    const { data: sectorSkills } = await supabase
        .from("sector_skills")
        .select("*, skill:skills(*), sector:sectors(*)")
        .order("priority_score", { ascending: false })
        .limit(50);

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">
                    Skills Library
                </h2>
                <p className="text-[13px] text-muted">
                    Browse and search all tracked skills across sectors
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                <div className="flex flex-col gap-5">
                    {(sectorSkills as SectorSkill[])?.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-[48px] mb-4">📚</div>
                            <h3 className="text-[18px] font-bold text-heading mb-2">
                                No skills in library
                            </h3>
                            <p className="text-[14px] text-muted">
                                Skills will appear here once data is collected.
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
