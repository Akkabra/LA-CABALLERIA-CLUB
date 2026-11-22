import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  User,
  ArrowRight,
  X,
  CalendarCheck,
  Sparkles,
  HeartHandshake,
  Newspaper,
} from 'lucide-react';
import type { BlogCategory, BlogPost } from '../types';
import { ScrollReveal } from './FadeInSection';

interface BlogSectionProps {
  posts: BlogPost[];
  isLoading?: boolean;
  onGoToBooking: () => void;
}

const CATEGORY_META: Record<
  BlogCategory,
  { label: string; shortLabel: string; icon: React.ReactNode }
> = {
  'cuidado-equino': {
    label: 'Cuidado Equino',
    shortLabel: 'Cuidado Equino',
    icon: <HeartHandshake className="w-3.5 h-3.5 text-[#D21923]" />,
  },
  'consejos-principiantes': {
    label: 'Consejos para Principiantes',
    shortLabel: 'Principiantes',
    icon: <Sparkles className="w-3.5 h-3.5 text-[#D21923]" />,
  },
  'noticias-club': {
    label: 'Noticias del Club',
    shortLabel: 'Noticias',
    icon: <Newspaper className="w-3.5 h-3.5 text-[#D21923]" />,
  },
};

function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  isLoading = false,
  onGoToBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todas' | BlogCategory>('todas');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.published),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'todas') return publishedPosts;
    return publishedPosts.filter((p) => p.category === selectedCategory);
  }, [publishedPosts, selectedCategory]);

  return (
    <section
      id="blog"
      className="py-16 sm:py-24 lg:py-32 bg-[#141416] relative border-b border-white/10 overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D21923]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal variant="up" className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-[#D21923] font-bold">
              <BookOpen className="w-4 h-4 text-[#D21923]" />
              <span>Bitácora Ecuestre · Diario del Club</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              CRÓNICAS Y <span className="italic font-normal text-[#D21923]">CONSEJOS DE PISTA</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 mt-3 max-w-2xl leading-relaxed">
              Artículos redactados por nuestros instructores sobre bienestar equino, preparación para primeras clases y novedades de la vida diaria en La Caballería.
            </p>
          </div>

          {/* Category Filter Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1B1B1E] border border-white/10 p-1.5 w-full lg:w-auto overflow-x-auto self-start lg:self-end">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`px-3.5 py-2.5 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'todas'
                  ? 'bg-[#D21923] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({publishedPosts.length})
            </button>
            {(['cuidado-equino', 'consejos-principiantes', 'noticias-club'] as BlogCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2.5 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#D21923] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {CATEGORY_META[cat].shortLabel}
                </button>
              )
            )}
          </div>
        </ScrollReveal>

        {/* Articles Grid */}
        {isLoading && publishedPosts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 bg-[#1A1A1D] border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[#1A1A1D] border border-white/10 p-10 text-center text-xs text-zinc-400">
            No hay artículos publicados en esta categoría por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredPosts.map((post, idx) => {
              const catInfo = CATEGORY_META[post.category] || CATEGORY_META['noticias-club'];
              return (
                <ScrollReveal key={post.id} variant="up" delay={(idx % 3) * 90} className="h-full">
                  <article
                    className="h-full group bg-[#1A1A1D] border border-white/10 hover:border-[#D21923]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
                  >
                  <div>
                    {/* Cover Image */}
                    <div className="relative h-52 overflow-hidden bg-black">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1D] via-transparent to-transparent opacity-80" />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141416]/90 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white">
                        {catInfo.icon}
                        <span>{catInfo.label}</span>
                      </span>
                    </div>

                    {/* Article Copy */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mb-3">
                        <span>{formatPostDate(post.createdAt)}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#D21923]" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-snug mb-3 group-hover:text-zinc-100">
                        {post.title}
                      </h3>

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="px-6 pb-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-zinc-400 inline-flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                      <span className="truncate">{post.authorName}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setActivePost(post)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D21923] hover:text-white transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Leer artículo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setActivePost(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92dvh] bg-[#141416] border border-white/15 rounded-xl shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePost(null)}
              className="sticky top-3 float-right mr-3 mt-3 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#141416]/90 hover:bg-[#D21923] text-white border border-white/15 rounded-lg transition-colors"
              aria-label="Cerrar artículo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-56 sm:h-72 w-full bg-black relative overflow-hidden">
              <img
                src={activePost.coverImageUrl}
                alt={activePost.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/35 to-transparent" />
            </div>

            <div className="p-6 sm:p-10 -mt-10 relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D21923] text-white text-[10px] font-mono uppercase tracking-widest font-bold">
                  {(CATEGORY_META[activePost.category] || CATEGORY_META['noticias-club']).label}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {formatPostDate(activePost.createdAt)}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs font-mono text-zinc-400 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D21923]" />
                  {activePost.readTime} de lectura
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight mb-3">
                {activePost.title}
              </h3>

              <p className="text-xs text-zinc-400 pb-6 mb-6 border-b border-white/10 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#D21923]" />
                <span>Escrito por <strong className="text-white">{activePost.authorName}</strong></span>
              </p>

              <p className="text-sm sm:text-base font-serif italic text-zinc-200 leading-relaxed mb-6 border-l-2 border-[#D21923] pl-4">
                {activePost.excerpt}
              </p>

              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                {activePost.content
                  .split(/\n\s*\n/)
                  .map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActivePost(null)}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 border border-white/10 transition-colors w-full sm:w-auto"
                >
                  Volver a artículos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePost(null);
                    onGoToBooking();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors w-full sm:w-auto"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Agendar una clase en pista</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
