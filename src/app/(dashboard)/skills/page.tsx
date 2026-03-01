import { createClient } from "@/lib/supabase/server";
import SkillList from "@/components/SkillList";
import Pagination from "@/components/Pagination";
import type { SectorSkill } from "@/lib/types";

interface SkillsPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    const page = Number(params.page) || 1;
    const pageSize = 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data: sectorSkills, count } = await supabase
        .from("sector_skills")
        .select("*, skill:skills(*), sector:sectors(*)", { count: "exact" })
        .order("priority_score", { ascending: false })
        .range(start, end);

    const totalPages = Math.ceil((count || 0) / pageSize);

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
                <SkillList sectorSkills={(sectorSkills as SectorSkill[]) || []} />
                <Pagination totalPages={totalPages} />
            </div>
        </>
    );
}
