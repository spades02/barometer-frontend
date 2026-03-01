export default function DashboardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-white border-b px-6 lg:px-8 py-5" style={{ borderColor: "#e2e8f0" }}>
                <div className="h-6 w-48 bg-border-light rounded mb-2" />
                <div className="h-4 w-72 bg-border-light rounded" />
            </div>

            {/* Filter bar skeleton */}
            <div className="bg-white border-b px-6 lg:px-8 py-4" style={{ borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2">
                    {[120, 100, 100, 90, 90].map((w, i) => (
                        <div
                            key={i}
                            className="h-9 rounded-full bg-border-light"
                            style={{ width: `${w}px` }}
                        />
                    ))}
                </div>
            </div>

            <div className="px-6 lg:px-8 py-6">
                {/* Stats skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-5 border-l-4"
                            style={{
                                height: "110px",
                                borderLeftColor: "#e2e8f0",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <div className="h-8 w-16 bg-border-light rounded mb-3" />
                            <div className="h-4 w-24 bg-border-light rounded" />
                        </div>
                    ))}
                </div>

                {/* Skill cards skeleton */}
                <div className="flex flex-col gap-5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border p-6"
                            style={{ borderColor: "#e2e8f0" }}
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="h-5 w-48 bg-border-light rounded mb-3" />
                                    <div className="h-4 w-full bg-border-light rounded mb-2" />
                                    <div className="h-4 w-3/4 bg-border-light rounded mb-4" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-16 bg-border-light rounded" />
                                        <div className="h-5 w-20 bg-border-light rounded" />
                                    </div>
                                </div>
                                <div className="lg:w-[320px] space-y-3">
                                    {[1, 2, 3, 4, 5].map((j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <div className="h-3 w-16 bg-border-light rounded" />
                                            <div className="flex-1 h-[6px] bg-border-light rounded-full" />
                                            <div className="h-3 w-6 bg-border-light rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
