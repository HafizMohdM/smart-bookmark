"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { Database } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

export function BookmarkList({ initialBookmarks, userId }: { initialBookmarks: Bookmark[], userId: string }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const supabase = createClient();

    useEffect(() => {
        // Set up realtime subscription
        const channel = supabase
            .channel('realtime-bookmarks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((current) => [payload.new as Bookmark, ...current]);
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        );
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
                            )
                        );
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // verified subscription
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, userId]);

    // Handle delete with optimistic update is tricky with realtime, 
    // relying on realtime event for valid confirmation is safer for consistency
    // but we can disable the button while deleting.
    const handleDelete = async (id: string) => {
        // Optimistic update for UI responsiveness
        const previousBookmarks = [...bookmarks];
        setBookmarks((current) => current.filter((b) => b.id !== id));

        try {
            const { error } = await supabase.from("bookmarks").delete().eq("id", id);
            if (error) {
                // Revert on error
                setBookmarks(previousBookmarks);
                console.error("Error deleting bookmark:", error);
                alert("Failed to delete bookmark");
            }
        } catch (error) {
            setBookmarks(previousBookmarks);
            console.error("Error deleting bookmark:", error);
        }
    };

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-muted-foreground">No bookmarks yet.</p>
                <p className="text-sm text-muted-foreground">Add one above to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookmarks.map((bookmark) => (
                <Card
                    key={bookmark.id}
                    className="overflow-hidden group hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-blue-200 cursor-pointer"
                >
                    <CardContent className="p-0">
                        <div className="flex flex-col h-full">
                            <div className="p-5 flex-1 relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(bookmark.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3 mb-3">
                                    <div className="mt-1 w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 text-xs font-bold uppercase select-none">
                                        {/* Simple favicon fallback: first letter of domain */}
                                        {tryGetDomainInitial(bookmark.url)}
                                    </div>
                                    <div className="min-w-0 flex-1 pr-6">
                                        <h3
                                            className="font-semibold text-slate-900 leading-tight mb-1 truncate"
                                            title={bookmark.title}
                                        >
                                            {bookmark.title}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-slate-500 hover:text-blue-600 truncate flex items-center gap-1.5 transition-colors group-hover:text-blue-600"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span className="truncate">{shortenUrl(bookmark.url)}</span>
                                </a>
                            </div>

                            {/* Decorative bottom bar on hover */}
                            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function tryGetDomainInitial(url: string) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '')[0];
    } catch {
        return '?';
    }
}

function shortenUrl(url: string) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + (urlObj.pathname.length > 1 ? urlObj.pathname : '');
    } catch {
        return url;
    }
}
