import { Bookmark } from "lucide-react";
import type { SectorSkill } from "@/lib/types";

// A custom bar to match the new design
function CustomScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
    const pct = Math.min((score / 10) * 100, 100);
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-[#6B7280]">
                    {label}
                </span>
                <span className="text-[12px] font-bold" style={{ color }}>
                    {Math.round(pct)}%
                </span>
            </div>
            <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}

interface SkillCardProps {
    sectorSkill: SectorSkill;
    onViewDetails?: () => void;
}

export default function SkillCard({ sectorSkill, onViewDetails }: SkillCardProps) {
    const skill = sectorSkill.skill;
    if (!skill) return null;

    // We'll extract a few tags or mock some if there's only one to match the visual density of the mock.
    const tags = skill.skill_type
        ? [skill.skill_type, "Communication", "Teamwork", "Problem Solving"].slice(0, 4)
        : ["General", "Hard Skill"];
    const quickWin = (sectorSkill.quick_win_score ?? 0) > 3;
    if (quickWin) {
        tags.push("Quick Win");
    }

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 transition-all hover:shadow-md mb-4 flex flex-col lg:flex-row relative cursor-pointer"
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)" }}
            onClick={onViewDetails}
        >
            {/* Bookmark Icon */}
            <button className="absolute top-5 right-5 text-gray-400 hover:text-primary-hover transition-colors hidden lg:block z-10">
                <Bookmark size={22} strokeWidth={2} />
            </button>

            {/* Left: Name + Description + Button */}
            <div
                className="flex-1 p-6 flex flex-col justify-start lg:w-[35%]"
                style={{ minWidth: 0 }}
            >
                <div className="mb-4">
                    <h3 className="text-[20px] font-bold text-[#111827] mb-2 line-clamp-1 group-hover:text-primary-hover transition-colors">
                        {skill.name}
                    </h3>
                    <p className="text-[14px] text-[#6B7280] leading-relaxed line-clamp-2">
                        {skill.description || "This is a short description of the skill and what it entails. Its the clickbaith for clicking on this card etc. etc....."}
                    </p>
                </div>

                <div className="mt-auto pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.();
                        }}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#4B5563] hover:text-primary-hover hover:bg-[#EEF2FF] hover:border-primary-hover transition-all"
                    >
                        View details
                    </button>
                </div>
            </div>

            {/* Middle: Tags Section */}
            <div className="flex-1 p-6 lg:border-l border-gray-100 lg:w-[35%]">
                <div className="flex items-center gap-2 mb-4 text-[13px] font-semibold text-[#4B5563]">
                    <span className="w-5 h-5 rounded-md bg-[#EEF2FF] text-primary-hover inline-flex items-center justify-center text-[12px]">⚙</span>
                    <span>{tags.length} related skills</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px]">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1.5 rounded-full font-medium bg-[#F3F4F6] text-[#4B5563]"
                        >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                    ))}
                    <span className="px-3 py-1.5 rounded-full font-bold bg-primary-hover text-white">
                        +3
                    </span>
                </div>
            </div>

            {/* Right: Scores */}
            <div className="p-6 lg:border-l border-gray-100 flex flex-col justify-center gap-5 lg:w-[30%] shrink-0 pr-12">
                <CustomScoreBar
                    label="Trending"
                    score={sectorSkill.trending_score ?? 0}
                    color="#10B981" // Green
                />
                <CustomScoreBar
                    label="Impact"
                    score={sectorSkill.impact_score ?? 0}
                    color="#F97316" // Orange
                />
                <CustomScoreBar
                    label="Urgency"
                    score={sectorSkill.urgency_score ?? 0}
                    color="#F59E0B" // Yellow/Amber
                />
            </div>

            {/* Mobile Bookmark */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-primary-hover transition-colors lg:hidden z-10">
                <Bookmark size={20} strokeWidth={2} />
            </button>
        </div>
    );
}
