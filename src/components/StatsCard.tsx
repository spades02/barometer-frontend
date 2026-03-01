interface StatsCardProps {
    value: string | number;
    label: string;
    trend?: string;
    trendUp?: boolean;
}

export default function StatsCard({ value, label, trend, trendUp }: StatsCardProps) {
    return (
        <div
            className="bg-white rounded-xl p-5 border-l-4 transition-all cursor-pointer hover:shadow-md"
            style={{
                height: "110px",
                borderLeftColor: "#1d4ed8",
                borderTop: "1px solid #e2e8f0",
                borderRight: "1px solid #e2e8f0",
                borderBottom: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
        >
            <div
                style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    marginBottom: "8px",
                }}
            >
                {value}
            </div>
            <div className="flex items-center justify-between">
                <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
                {trend && (
                    <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{
                            backgroundColor: trendUp ? "#dbeafe" : "#ffe4e6",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: trendUp ? "#1e3a8a" : "#9f1239",
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            style={{ transform: trendUp ? "none" : "scaleY(-1)" }}
                        >
                            <path
                                d="M2 8L6 4L10 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
