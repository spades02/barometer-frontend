import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReviewTable from "@/components/ReviewTable";

export default async function AdminPage() {
    const supabase = await createClient();

    // Check admin status
    const {
        data: { user },
    } = await supabase.auth.getUser();
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
        .limit(100);

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <h2 className="text-[20px] font-bold text-heading mb-1">
                    Admin Review
                </h2>
                <p className="text-[13px] text-muted">
                    Review and validate auto-detected skills, trends, and data entries
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6">
                <ReviewTable initialReviews={reviews || []} />
            </div>
        </>
    );
}
