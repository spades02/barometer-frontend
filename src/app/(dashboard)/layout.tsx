import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";

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
        .select("id, is_active")
        .eq("email", user.email!)
        .maybeSingle();

    const isAdmin = !!adminRecord?.is_active;

    return (
        <div className="min-h-screen bg-surface">
            <TopNav
                isAdmin={isAdmin}
                userEmail={user.email!}
                userName={user.user_metadata?.full_name}
            />
            <main>{children}</main>
        </div>
    );
}
