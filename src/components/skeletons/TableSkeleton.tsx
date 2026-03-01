export default function TableSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="animate-pulse bg-white rounded-xl border" style={{ borderColor: "#e2e8f0" }}>
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
                {[100, 120, 80, 100, 60].map((w, i) => (
                    <div
                        key={i}
                        className="h-3 bg-border-light rounded"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0"
                    style={{ borderColor: "#f1f5f9" }}
                >
                    <div className="h-4 w-20 bg-border-light rounded" />
                    <div className="h-4 flex-1 bg-border-light rounded" />
                    <div className="h-4 w-16 bg-border-light rounded" />
                    <div className="h-6 w-16 bg-border-light rounded-full" />
                    <div className="h-8 w-20 bg-border-light rounded" />
                </div>
            ))}
        </div>
    );
}
