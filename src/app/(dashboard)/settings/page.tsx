import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InviteAdminForm from "@/components/InviteAdminForm";

export default async function SettingsPage() {
    const supabase = await createClient();

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

    // Fetch admin list
    const { data: admins } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: true });

    return (
        <>
            <div className="bg-white border-b px-6 lg:px-8 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-[20px] font-bold text-heading mb-1">Settings</h2>
                <p className="text-[13px] text-muted">
                    Manage administrators and platform configuration
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6 max-w-3xl">
                {/* Admin Management */}
                <div
                    className="bg-white rounded-xl border p-6 mb-6"
                    style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                    <h3 className="text-[16px] font-bold text-heading mb-4">
                        Admin Management
                    </h3>

                    {/* Invite form */}
                    <InviteAdminForm />

                    {/* Admin list */}
                    <div className="mt-6">
                        <h4 className="text-[13px] font-semibold text-heading mb-3 uppercase tracking-wide">
                            Current Admins
                        </h4>
                        <div className="space-y-2">
                            {admins?.map((admin: {
                                id: string;
                                email: string;
                                is_active: boolean;
                                created_at: string;
                            }) => (
                                <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors"
                                >
                                    <div>
                                        <p className="text-[14px] font-medium text-heading">
                                            {admin.email}
                                        </p>
                                        <p className="text-[11px] text-subtle">
                                            Added{" "}
                                            {new Date(admin.created_at).toLocaleDateString("en-GB", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                            style={{
                                                backgroundColor: admin.is_active ? "#d1fae5" : "#fee2e2",
                                                color: admin.is_active ? "#065f46" : "#991b1b",
                                            }}
                                        >
                                            {admin.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Platform Settings placeholder */}
                <div
                    className="bg-white rounded-xl border p-6"
                    style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                    <h3 className="text-[16px] font-bold text-heading mb-2">
                        Platform Settings
                    </h3>
                    <p className="text-[13px] text-muted">
                        Additional platform configuration options coming soon.
                    </p>
                </div>
            </div>
        </>
    );
}
