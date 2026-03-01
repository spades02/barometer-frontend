"use client";

import { useState } from "react";
import SkillCard from "./SkillCard";
import SkillDetailDrawer from "./SkillDetailDrawer";
import type { SectorSkill } from "@/lib/types";

interface SkillListProps {
    sectorSkills: SectorSkill[];
}

export default function SkillList({ sectorSkills }: SkillListProps) {
    const [selectedSkill, setSelectedSkill] = useState<SectorSkill | null>(null);

    return (
        <>
            <div className="flex flex-col gap-5">
                {sectorSkills.length === 0 && (
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
                {sectorSkills.map((ss) => (
                    <SkillCard
                        key={ss.id}
                        sectorSkill={ss}
                        onViewDetails={() => setSelectedSkill(ss)}
                    />
                ))}
            </div>

            <SkillDetailDrawer
                sectorSkill={selectedSkill}
                onClose={() => setSelectedSkill(null)}
            />
        </>
    );
}
