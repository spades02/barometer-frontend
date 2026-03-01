import { getScoreColor } from "@/lib/utils";

interface ScoreBarProps {
    label: string;
    score: number;
    maxScore?: number;
}

export default function ScoreBar({ label, score, maxScore = 10 }: ScoreBarProps) {
    const pct = Math.min((score / maxScore) * 100, 100);
    const color = getScoreColor(score);

    return (
        <div className="flex items-center gap-3">
            <span
                className="text-[12px] text-muted w-[80px] shrink-0 text-right"
            >
                {label}
            </span>
            <div className="flex-1 h-[6px] bg-border-light rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
            <span
                className="text-[12px] font-semibold w-[28px] text-right"
                style={{ color }}
            >
                {score.toFixed(1)}
            </span>
        </div>
    );
}
