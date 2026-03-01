import CardSkeleton from "@/components/skeletons/CardSkeleton";

export default function SkillsLoading() {
    return (
        <div className="px-6 lg:px-8 py-6">
            <div className="animate-pulse mb-6">
                <div className="h-6 w-48 bg-border-light rounded mb-2" />
                <div className="h-4 w-64 bg-border-light rounded" />
            </div>
            <CardSkeleton count={6} />
        </div>
    );
}
