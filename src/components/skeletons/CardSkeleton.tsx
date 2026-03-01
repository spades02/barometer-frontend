export default function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border p-6"
                    style={{ borderColor: "#e2e8f0" }}
                >
                    <div className="h-5 w-32 bg-border-light rounded mb-3" />
                    <div className="h-4 w-full bg-border-light rounded mb-2" />
                    <div className="h-4 w-2/3 bg-border-light rounded mb-4" />
                    <div className="flex gap-2 mb-4">
                        <div className="h-5 w-14 bg-border-light rounded" />
                        <div className="h-5 w-18 bg-border-light rounded" />
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="flex items-center gap-2">
                                <div className="h-3 w-12 bg-border-light rounded" />
                                <div className="flex-1 h-[6px] bg-border-light rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
