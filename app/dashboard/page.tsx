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
        <div className="min-h-screen bg-slate-50 relative">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                            SB
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Smart Bookmarks
                        </h1>
                    </div>
                    <AuthButton user={user} />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid gap-8">
                    <section>
                        <BookmarkForm />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Your Bookmarks</h2>
                            <span className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
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
