import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Film, BookMarked, Trash2, Star, LogOut, Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthContext";
import { getWatchlist, removeFromWatchlist, updateWatchlistItem } from "@/api/watchlist";
import type { WatchlistItem, WatchlistStatus } from "@/types/api";

// ─── Header ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/dashboard" },
  { label: "My Watchlist", href: "/watchlist" },
];

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6 md:px-12">
        <div className="flex items-center gap-2 shrink-0">
          <Film className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Watchlist</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex flex-1 max-w-sm ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search movies & shows…"
            className="w-full rounded-lg bg-secondary pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-4">
          <span className="hidden sm:block text-sm text-muted-foreground">{user?.username}</span>
          <button
            onClick={() => void logout()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Log out</span>
          </button>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 py-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => { navigate(link.href); setMobileOpen(false); }}
              className="block w-full text-left px-6 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<WatchlistStatus, string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
};

const STATUS_BADGE_CLASS: Record<WatchlistStatus, string> = {
  watching: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border border-green-500/30",
  plan_to_watch: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  dropped: "bg-red-500/20 text-red-400 border border-red-500/30",
  on_hold: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
};

const ALL_STATUSES: WatchlistStatus[] = ["plan_to_watch", "watching", "completed", "on_hold", "dropped"];

// ─── Watchlist Item Card ──────────────────────────────────────────────────────

function WatchlistCard({ item }: { item: WatchlistItem }) {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: () => removeFromWatchlist(item.watch_list_id),
    onSuccess: () => {
      toast.success("Removed");
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (status: WatchlistStatus) =>
      updateWatchlistItem(item.watch_list_id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  return (
    <div className="group relative flex flex-col rounded-xl bg-secondary/50 border border-border/40 overflow-hidden hover:border-border/80 transition-colors">
      <div className="relative aspect-[2/3] bg-secondary overflow-hidden">
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.movie_title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Film className="h-10 w-10" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-foreground capitalize">
            {item.media_type === "movie" ? "Movie" : "Show"}
          </span>
        </div>

        <button
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
          aria-label="Remove from watchlist"
          className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-red-400 hover:bg-background/95 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {item.movie_title}
        </p>

        <span
          className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[item.status]}`}
        >
          {STATUS_LABELS[item.status]}
        </span>

        {item.rating !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating}/10</span>
          </div>
        )}

        <select
          value={item.status}
          disabled={updateMutation.isPending}
          onChange={(e) => updateMutation.mutate(e.target.value as WatchlistStatus)}
          className="mt-auto w-full rounded-md bg-background border border-border/60 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 cursor-pointer"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-secondary/50 border border-border/40 overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-secondary" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-4/5 rounded bg-secondary" />
        <div className="h-3 w-1/2 rounded bg-secondary" />
        <div className="h-7 w-full rounded bg-secondary mt-2" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-muted-foreground">
        <BookMarked className="h-7 w-7" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">No titles yet</p>
        <p className="text-sm text-muted-foreground">Start adding from the dashboard.</p>
      </div>
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

type FilterValue = "all" | WatchlistStatus;

const FILTER_TABS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Plan to Watch", value: "plan_to_watch" },
  { label: "Watching", value: "watching" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Dropped", value: "dropped" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function WatchlistPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist,
  });

  const filtered =
    activeFilter === "all"
      ? (items ?? [])
      : (items ?? []).filter((item) => item.status === activeFilter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Watchlist</h1>
          {!isLoading && items && (
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "title" : "titles"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {(error as Error).message || "Failed to load watchlist."}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <WatchlistCard key={item.watch_list_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
