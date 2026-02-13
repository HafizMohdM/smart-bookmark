"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";

export function BookmarkForm() {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!title.trim() || !url.trim()) {
            setErrorMsg("Title and URL are required.");
            return;
        }

        try {
            new URL(url);
        } catch {
            setErrorMsg("Please enter a valid URL.");
            return;
        }

        setIsLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setErrorMsg("You must be logged in to add bookmarks.");
                return;
            }

            const { error: insertError } = await supabase.from("bookmarks").insert({
                title: title.trim(),
                url: url.trim(),
                user_id: user.id,
            });

            if (insertError) {
                console.error("Error adding bookmark:", insertError);
                setErrorMsg(insertError.message);
            } else {
                setTitle("");
                setUrl("");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setErrorMsg("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Plus className="w-24 h-24 rotate-12" />
            </div>

            <div className="relative">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                        <Plus className="w-4 h-4" />
                    </div>
                    Add New Bookmark
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="grid gap-2 flex-1 w-full">
                            <Input
                                placeholder="Title (e.g., Supabase Docs)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-2 flex-[2] w-full">
                            <Input
                                type="url"
                                placeholder="URL (e.g., https://supabase.com/docs)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-10 font-mono text-sm"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="h-10 px-6 shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm text-white">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add
                        </Button>
                    </div>
                    {errorMsg && (
                        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {errorMsg}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
