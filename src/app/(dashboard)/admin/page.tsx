import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminPage() {
    const supabase = await createClient();

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("email", user.email!)
        .maybeSingle();

    if (!adminRecord?.is_active) {
        redirect("/");
    }

    // Fetch review queue
    const { data: reviews } = await supabase
        .from("review_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    const pendingCount = reviews?.filter((r: { status: string }) => r.status === "pending").length ?? 0;
    const approvedCount = reviews?.filter((r: { status: string }) => r.status === "approved").length ?? 0;
    const rejectedCount = reviews?.filter((r: { status: string }) => r.status === "rejected").length ?? 0;

    return (
        <>
            <div className="bg-white border-b px-6 lg:px-8 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-[20px] font-bold text-heading mb-1">Admin Review</h2>
                <p className="text-[13px] text-muted">
                    Review and validate auto-detected skills, trends, and data entries
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                {/* Status counts */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-light">
                        <span className="text-[13px] font-semibold" style={{ color: "#92400e" }}>
                            {pendingCount} Pending
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-light">
                        <span className="text-[13px] font-semibold" style={{ color: "#065f46" }}>
                            {approvedCount} Approved
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral-light">
                        <span className="text-[13px] font-semibold" style={{ color: "#9f1239" }}>
                            {rejectedCount} Rejected
                        </span>
                    </div>
                </div>

                {/* Review table */}
                <div
                    className="bg-white rounded-xl border overflow-hidden"
                    style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                    {/* Table header */}
                    <div
                        className="grid grid-cols-12 gap-4 px-6 py-3 border-b text-[12px] font-semibold text-muted uppercase tracking-wide"
                        style={{ borderColor: "#f1f5f9", backgroundColor: "#fafafa" }}
                    >
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Reason</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Date</div>
                    </div>

                    {reviews?.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-[48px] mb-4">✅</div>
                            <h3 className="text-[18px] font-bold text-heading mb-2">All caught up!</h3>
                            <p className="text-[14px] text-muted">No items in the review queue.</p>
                        </div>
                    )}

                    {reviews?.map((item: {
                        id: string;
                        item_type: string;
                        item_name: string | null;
                        reason: string | null;
                        status: string;
                        created_at: string;
                    }) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b last:border-b-0 items-center hover:bg-surface transition-colors cursor-pointer"
                            style={{ borderColor: "#f1f5f9" }}
                        >
                            <div className="col-span-2">
                                <span
                                    className="px-2 py-0.5 rounded text-[11px] font-medium capitalize"
                                    style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
                                >
                                    {item.item_type}
                                </span>
                            </div>
                            <div className="col-span-3 text-[13px] text-heading font-medium truncate">
                                {item.item_name || "Unnamed"}
                            </div>
                            <div className="col-span-3 text-[12px] text-muted truncate">
                                {item.reason || "—"}
                            </div>
                            <div className="col-span-2">
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="col-span-2 text-[12px] text-muted">
                                {new Date(item.created_at).toLocaleDateString("en-GB", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
