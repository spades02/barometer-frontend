import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function AdminLoading() {
    return (
        <div className="px-6 lg:px-8 py-6">
            <div className="animate-pulse mb-6">
                <div className="h-6 w-32 bg-border-light rounded mb-2" />
                <div className="h-4 w-64 bg-border-light rounded" />
            </div>
            <div className="flex gap-4 mb-6 animate-pulse">
                <div className="h-9 w-28 bg-border-light rounded-lg" />
                <div className="h-9 w-28 bg-border-light rounded-lg" />
                <div className="h-9 w-28 bg-border-light rounded-lg" />
            </div>
            <TableSkeleton rows={8} />
        </div>
    );
}
