"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    // Link admin_users record if exists
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
        await supabase
            .from("admin_users")
            .update({ user_id: userData.user.id })
            .eq("email", userData.user.email!)
            .is("user_id", null);
    }

    revalidatePath("/", "layout");
    redirect("/");
}
