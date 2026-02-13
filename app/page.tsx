import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { redirect } from "next/navigation";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Smart Bookmark App
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Secure, real-time bookmark manager for professionals.
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow rounded-lg border border-gray-100">
                    <div className="space-y-6">
                        <p className="text-sm text-center text-gray-500">
                            Sign in to access your bookmarks
                        </p>
                        <AuthButton user={user} />
                    </div>
                </div>
            </div>
        </main>
    );
}
