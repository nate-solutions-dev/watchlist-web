import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Clock, Tv, BookMarked, Film } from "lucide-react";
import { getTitleDetail } from "@/api/titles";
import { Button } from "@/components/ui/button";
import type { MediaType } from "@/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-[360px] bg-secondary" />
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 flex gap-8">
        <div className="shrink-0 w-48 h-72 rounded-xl bg-secondary" />
        <div className="flex-1 space-y-4 pt-2">
          <div className="h-8 w-64 rounded bg-secondary" />
          <div className="h-4 w-40 rounded bg-secondary" />
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-5/6 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TitleDetailPage() {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mediaType = (searchParams.get("type") ?? "movie") as MediaType;
  const id = Number(tmdbId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["title", id, mediaType],
    queryFn: () => getTitleDetail(id, mediaType),
    enabled: !!id && id > 0,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground">
        <Film className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Could not load title details.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const heroImage = data.backdrop_url || data.poster_url;
  const isShow = data.media_type === "show";
  const credit = isShow ? data.creators : data.directors;
  const creditLabel = isShow ? "Created by" : "Directed by";

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Backdrop hero ── */}
      <section className="relative h-[360px] md:h-[480px] overflow-hidden bg-secondary">
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})`, filter: "brightness(0.45)" }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 md:left-10 flex items-center gap-1.5 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur-sm px-3 py-2 text-sm text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">

        {/* Poster + info row — poster floats up to overlap the backdrop */}
        <div className="flex flex-col sm:flex-row gap-8 -mt-24 md:-mt-32 relative z-10">

          {/* Poster */}
          {data.poster_url && (
            <div className="shrink-0 w-44 md:w-56 self-start rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src={data.poster_url}
                alt={data.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-3 pt-28 sm:pt-0 sm:mt-auto sm:pb-2">
            {/* Title + year */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {data.year && <span>{data.year}</span>}
                {data.vote_average > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {data.vote_average.toFixed(1)}
                  </span>
                )}
                {data.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRuntime(data.runtime)}
                  </span>
                )}
                {isShow && data.seasons > 0 && (
                  <span className="flex items-center gap-1">
                    <Tv className="h-3.5 w-3.5" />
                    {data.seasons} {data.seasons === 1 ? "season" : "seasons"}
                  </span>
                )}
                {data.status && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs">
                    {data.status}
                  </span>
                )}
              </div>
            </div>

            {/* Genres */}
            {data.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mt-1">
              <Button className="gap-2">
                <BookMarked className="h-4 w-4" />
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>

        {/* ── Synopsis ── */}
        {data.overview && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{data.overview}</p>
          </section>
        )}

        {/* ── Director / Creators ── */}
        {credit.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-1">{creditLabel}</h2>
            <p className="text-muted-foreground">{credit.join(", ")}</p>
          </section>
        )}

        {/* ── Cast ── */}
        {data.cast.length > 0 && (
          <section className="mt-10 mb-16">
            <h2 className="text-lg font-semibold mb-5">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {data.cast.map((member) => (
                <div key={`${member.name}-${member.character}`} className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-secondary ring-1 ring-border shrink-0">
                    {member.profile_url ? (
                      <img
                        src={member.profile_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Film className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{member.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{member.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
