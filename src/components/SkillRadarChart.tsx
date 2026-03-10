"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";

interface SkillRadarChartProps {
    scores: {
        trending: number;
        impact: number;
        effortToLearn: number;
        effortToApply: number;
        urgency: number;
    };
}

export default function SkillRadarChart({ scores }: SkillRadarChartProps) {
    const data = [
        { subject: "Trending", value: scores.trending },
        { subject: "Impact", value: scores.impact },
        { subject: "Urgency", value: scores.urgency },
        { subject: "Effort to Apply", value: scores.effortToApply },
        { subject: "Effort to Learn", value: scores.effortToLearn },
    ];

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                        }}
                    />
                    <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        fill="#1d4ed8"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
