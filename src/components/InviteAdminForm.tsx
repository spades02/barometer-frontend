"use client";

import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function InviteAdminForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);

        try {
            const supabase = createClient();

            // Insert into admin_users
            const { error: insertError } = await supabase
                .from("admin_users")
                .insert({ email: email.trim() });

            if (insertError) {
                toast.error(
                    insertError.message.includes("duplicate")
                        ? "This email is already an admin."
                        : insertError.message
                );
                setLoading(false);
                return;
            }

            toast.success(`Invitation sent to ${email}. They can now register and will have admin access.`);
            setEmail("");
        } catch {
            toast.error("Failed to send invitation.");
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
                        size={18}
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email to invite as admin"
                        required
                        className="w-full h-[44px] pl-11 pr-4 rounded-lg border text-[14px] outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                        style={{ borderColor: "#e2e8f0", borderWidth: "1.5px" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 h-[44px] rounded-lg gradient-primary text-white text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-60 shrink-0"
                >
                    <UserPlus size={16} />
                    <span>{loading ? "Inviting..." : "Invite Admin"}</span>
                </button>
            </div>
        </form>
    );
}
