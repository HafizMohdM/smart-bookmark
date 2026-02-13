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
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Ensure the new bookmark belongs to the user
                        const newBookmark = payload.new as Bookmark;
                        if (newBookmark.user_id === userId) {
                            setBookmarks((current) => [newBookmark, ...current]);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        // For DELETE, payload.old only contains the ID (usually), so we filter by ID
                        // This works regardless of user_id presence in payload.old
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        );
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedBookmark = payload.new as Bookmark;
                        if (updatedBookmark.user_id === userId) {
                            setBookmarks((current) =>
                                current.map((bookmark) =>
                                    bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
                                )
                            );
                        }
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
                <Card
                    key={bookmark.id}
                    className="group hover:shadow-md transition-all duration-200 border-gray-200 hover:border-indigo-200"
                >
                    <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-500 font-bold text-sm uppercase ring-1 ring-gray-100">
                                    {tryGetDomainInitial(bookmark.url)}
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        className="font-medium text-gray-900 leading-tight truncate custom-truncate"
                                        title={bookmark.title}
                                    >
                                        {bookmark.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(bookmark.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>

                        <div className="mt-auto pt-2 border-t border-gray-50">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center gap-1.5 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="truncate">{shortenUrl(bookmark.url)}</span>
                            </a>
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
