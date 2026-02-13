import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Smart Bookmark App</CardTitle>
                    <CardDescription>
                        Secure, real-time bookmark manager for professionals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Please sign in to continue.
                        </p>
                        <AuthButton user={user} />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
