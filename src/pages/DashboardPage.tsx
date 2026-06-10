import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Star, LogOut, Film, ChevronLeft, ChevronRight,
  Play, Search, Menu, BookMarked, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthContext";
import { getTrending, getPopular } from "@/api/discover";
import { addToWatchlist } from "@/api/watchlist";
import { searchTitles } from "@/api/search";
import { APIError } from "@/api/client";
import { Button } from "@/components/ui/button";
import type { TitleResult } from "@/types/api";

// ─── SearchBar ────────────────────────────────────────────────────────────────

function SearchBar() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 400);
    return () => clearTimeout(id);
  }, [inputValue]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchTitles(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const showDropdown = focused && inputValue.trim().length >= 2;

  const handleSelect = (result: TitleResult) => {
    setInputValue("");
    setDebouncedQuery("");
    setFocused(false);
    navigate(`/title/${result.tmdb_id}?type=${result.media_type}`);
  };

  return (
    <div className="hidden md:flex flex-1 max-w-sm ml-auto relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search movies & shows…"
        className="w-full rounded-lg bg-secondary pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
          )}
          {isError && (
            <div className="px-4 py-3 text-sm text-destructive">Search failed</div>
          )}
          {!isLoading && !isError && data && data.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          )}
          {!isLoading && !isError && data && data.length > 0 && (
            <ul>
              {data.map((result) => (
                <li key={`${result.tmdb_id}-${result.media_type}`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(result)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-secondary transition-colors"
                  >
                    <div className="shrink-0 w-6 h-9 rounded overflow-hidden bg-secondary">
                      {result.poster_url ? (
                        <img
                          src={result.poster_url}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Film className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.year || "—"}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                      {result.media_type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

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

        <SearchBar />

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

// ─── Hero Carousel ────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  const filled = Math.round((value / 10) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
        />
      ))}
      <span className="ml-1.5 text-sm text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

function HeroCarousel({ movies }: { movies: TitleResult[] }) {
  const count = Math.min(movies.length, 5);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  const prev = () => setCurrent((c) => (c - 1 + count) % count);
  const next = () => setCurrent((c) => (c + 1) % count);

  const navigate = useNavigate();
  const movie = movies[current];
  const heroImage = movie.backdrop_url || movie.poster_url;

  const goToDetail = (m: TitleResult) =>
    navigate(`/title/${m.tmdb_id}?type=${m.media_type}`);

  const { mutate: addToList, isPending } = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      toast.success("Added to watchlist");
    },
    onError: (err) => {
      toast.error(err instanceof APIError ? err.message : "Failed to add to watchlist");
    },
  });

  return (
    <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-background">
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${heroImage})`, filter: "brightness(0.45)" }}
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden />

      <div className="absolute inset-0 flex items-end px-6 md:px-12 pb-12 md:pb-16">
        <div className="flex flex-col gap-3 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trending This Week</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">{movie.title}</h1>
          {movie.vote_average > 0 && <StarRating value={movie.vote_average} />}
          {movie.overview && (
            <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button size="lg" className="gap-2" onClick={() => goToDetail(movie)}>
              <Play className="h-4 w-4 fill-current" />
              View Details
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border/60 hover:bg-secondary"
              disabled={isPending}
              onClick={() =>
                addToList({ tmdb_id: movie.tmdb_id, media_type: movie.media_type, status: "plan_to_watch" })
              }
            >
              <BookMarked className="h-4 w-4" />
              {isPending ? "Adding…" : "Add to Watchlist"}
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 text-xs text-muted-foreground font-medium tabular-nums">
        {current + 1} / {count}
      </div>

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────

function MovieCard({ movie }: { movie: TitleResult }) {
  const navigate = useNavigate();

  return (
    <div
      className="group shrink-0 w-[160px] md:w-[200px] cursor-pointer"
      onClick={() => navigate(`/title/${movie.tmdb_id}?type=${movie.media_type}`)}
    >
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-secondary">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Film className="h-8 w-8" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="h-4 w-4 fill-current" />
          </div>
        </div>

        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{movie.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{movie.year || "—"}</p>
      </div>
    </div>
  );
}

// ─── Movie Section ────────────────────────────────────────────────────────────

function MovieSection({ title, movies }: { title: string; movies: TitleResult[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 640 : -640, behavior: "smooth" });
  };

  return (
    <section className="px-6 md:px-12 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-secondary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary"
      >
        {movies.map((m) => (
          <MovieCard key={m.tmdb_id} movie={m} />
        ))}
      </div>
    </section>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function HeroSkeleton() {
  return <div className="w-full h-[400px] md:h-[600px] bg-secondary animate-pulse" />;
}

function SectionSkeleton() {
  return (
    <section className="px-6 md:px-12 py-8">
      <div className="h-7 w-52 rounded bg-secondary animate-pulse mb-5" />
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[160px] md:w-[200px] animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-secondary" />
            <div className="mt-2 h-3.5 w-4/5 rounded bg-secondary" />
            <div className="mt-1.5 h-3 w-1/3 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending", "movie"],
    queryFn: () => getTrending("movie"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ["popular", "movie"],
    queryFn: () => getPopular("movie"),
    staleTime: 5 * 60 * 1000,
  });

  const featured = trending?.results?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {trendingLoading || featured.length === 0 ? (
        <HeroSkeleton />
      ) : (
        <HeroCarousel movies={featured} />
      )}

      <div className="max-w-screen-2xl mx-auto">
        {trendingLoading ? (
          <SectionSkeleton />
        ) : (
          <MovieSection title="Trending This Week" movies={trending?.results ?? []} />
        )}

        {popularLoading ? (
          <SectionSkeleton />
        ) : (
          <MovieSection title="Most Popular" movies={popular?.results ?? []} />
        )}
      </div>
    </div>
  );
}
