import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookmarkForm } from "@/components/bookmark-form";
import { BookmarkList } from "@/components/bookmark-list";
import { AuthButton } from "@/components/auth-button";
import { Database } from "@/types/database.types";

export default async function Dashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    // Fetch initial bookmarks
    const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            SB
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            Smart Bookmarks
                        </h1>
                    </div>
                    <AuthButton user={user} />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid gap-8">
                    <section>
                        <BookmarkForm />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <h2 className="text-xl font-semibold text-gray-900">Your Bookmarks</h2>
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {bookmarks?.length || 0} items
                            </span>
                        </div>
                        <BookmarkList
                            initialBookmarks={(bookmarks as Database['public']['Tables']['bookmarks']['Row'][]) || []}
                            userId={user.id}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}
