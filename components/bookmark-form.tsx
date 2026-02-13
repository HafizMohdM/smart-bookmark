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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add New Bookmark
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="title" className="sr-only">Title</label>
                        <Input
                            id="title"
                            placeholder="Bookmark Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-[2]">
                        <label htmlFor="url" className="sr-only">URL</label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add
                    </Button>
                </div>
                {errorMsg && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        {errorMsg}
                    </div>
                )}
            </form>
        </div>
    );
}
