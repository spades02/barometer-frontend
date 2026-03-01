export default function SkillDetailLoading() {
    return (
        <div className="animate-pulse">
            <div className="bg-white border-b px-6 lg:px-8 py-5" style={{ borderColor: "#e2e8f0" }}>
                <div className="h-3 w-32 bg-border-light rounded mb-3" />
                <div className="h-6 w-64 bg-border-light rounded" />
            </div>
            <div className="px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e2e8f0" }}>
                            <div className="h-4 w-24 bg-border-light rounded mb-4" />
                            <div className="h-4 w-full bg-border-light rounded mb-2" />
                            <div className="h-4 w-full bg-border-light rounded mb-2" />
                            <div className="h-4 w-2/3 bg-border-light rounded" />
                        </div>
                        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e2e8f0" }}>
                            <div className="h-4 w-16 bg-border-light rounded mb-4" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-3 mb-3">
                                    <div className="h-3 w-16 bg-border-light rounded" />
                                    <div className="flex-1 h-[6px] bg-border-light rounded-full" />
                                    <div className="h-3 w-8 bg-border-light rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e2e8f0" }}>
                            <div className="h-4 w-32 bg-border-light rounded mb-4" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 w-full bg-border-light rounded mb-2" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
