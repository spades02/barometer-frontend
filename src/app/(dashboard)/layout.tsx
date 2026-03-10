import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { SavedItemsProvider } from "@/lib/saved-items-context";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is admin
    const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("id, is_active, user_id")
        .eq("email", user.email!)
        .maybeSingle();

    // Link admin user_id if needed
    if (adminRecord && !adminRecord.user_id) {
        await supabase
            .from("admin_users")
            .update({ user_id: user.id })
            .eq("email", user.email!);
    }

    const isAdmin = !!adminRecord?.is_active;

    return (
        <SavedItemsProvider>
            <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
                <DashboardHeader
                    isAdmin={isAdmin}
                    userName={user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                    userEmail={user.email || ""}
                />
                <main>{children}</main>
            </div>
        </SavedItemsProvider>
    );
}
