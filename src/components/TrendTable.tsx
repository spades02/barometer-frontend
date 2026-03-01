import StatusBadge from "@/components/StatusBadge";

interface Trend {
    id: string;
    title: string;
    description: string | null;
    status: string;
    source_count: number;
    created_at: string;
    momentum: number;
    tags: string[];
}

interface TrendTableProps {
    trends: Trend[];
}

export default function TrendTable({ trends }: TrendTableProps) {
    if (trends.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: "#e2e8f0" }}>
                <div className="text-[48px] mb-4">📉</div>
                <h3 className="text-[18px] font-bold text-heading mb-2">No trends detected yet</h3>
                <p className="text-[14px] text-muted">Trends will appear as data collection workflows run.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-16 text-center">
                                Rank
                            </th>
                            <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                                Skill / Trend
                            </th>
                            <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-64 hidden md:table-cell">
                                Tags
                            </th>
                            <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-32 text-center">
                                Momentum
                            </th>
                            <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-24 text-center">
                                Volume
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {trends.map((trend, idx) => (
                            <tr
                                key={trend.id}
                                className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <td className="py-4 px-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                        #{idx + 1}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 text-sm">{trend.title}</span>
                                            <StatusBadge status={trend.status} />
                                        </div>
                                        <span className="text-slate-500 text-xs line-clamp-1" title={trend.description || ""}>
                                            {trend.description || "No description available."}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 hidden md:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {trend.tags.length > 0 ? (
                                            trend.tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-slate-100 text-slate-600 font-normal text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">No tags</span>
                                        )}
                                        {trend.tags.length > 3 && (
                                            <span
                                                className="bg-slate-100 text-slate-500 font-medium text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap"
                                            >
                                                +{trend.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(0, trend.momentum))}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 w-6 text-right">
                                            {trend.momentum}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="font-bold text-slate-700 text-sm">
                                        {trend.source_count}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block -mt-1 uppercase tracking-wider">
                                        Docs
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
