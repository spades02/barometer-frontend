"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface MomentumChartProps {
    data: any[];
}

export default function MomentumChart({ data }: MomentumChartProps) {
    // Generate some placeholder timeline data if none exists
    // In a real scenario, this data would come from historical snapshots of trends
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [
                { name: "Jan", momentum: 40 },
                { name: "Feb", momentum: 50 },
                { name: "Mar", momentum: 45 },
                { name: "Apr", momentum: 60 },
                { name: "May", momentum: 65 },
                { name: "Jun", momentum: 85 },
            ];
        }

        // Generate synthetic historical data for the top trend to make it look dynamic
        const topTrend = data[0];
        const baseScore = topTrend.source_count * 10 || 50;

        return [
            { name: "Jan", momentum: Math.max(0, baseScore - 30) },
            { name: "Feb", momentum: Math.max(0, baseScore - 20) },
            { name: "Mar", momentum: Math.max(0, baseScore - 15) },
            { name: "Apr", momentum: Math.max(0, baseScore - 5) },
            { name: "May", momentum: Math.max(0, baseScore - 2) },
            { name: "Jun", momentum: baseScore },
        ];
    }, [data]);

    return (
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: "#e2e8f0" }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Overall Trend Momentum</h3>
                    <p className="text-sm text-slate-500">
                        Aggregated momentum for top VET market signals
                    </p>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            itemStyle={{ color: "#1d4ed8", fontWeight: "bold" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="momentum"
                            stroke="#1d4ed8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMomentum)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
