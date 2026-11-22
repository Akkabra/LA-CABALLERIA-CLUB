import React, { useRef, useState } from 'react';
import {
  Plus,
  Check,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  BookOpen,
  PenLine,
  ArrowLeft,
} from 'lucide-react';
import type { BlogCategory, BlogPost } from '../../types';
import type { BlogPostPayload } from '../../hooks/useRealtimeBookings';

interface AdminBlogTabProps {
  blogPosts: BlogPost[];
  onCreateBlogPost: (payload: BlogPostPayload) => Promise<BlogPost>;
  onUpdateBlogPost: (id: string, payload: Partial<BlogPostPayload>) => Promise<BlogPost>;
  onDeleteBlogPost: (id: string) => Promise<void>;
}

const BLOG_COVER_PRESETS = [
  {
    label: 'Cuidado y cepillado',
    url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Pista y técnica',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Familia y club',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Caballo tordo',
    url: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AdminBlogTab: React.FC<AdminBlogTabProps> = ({
  blogPosts,
  onCreateBlogPost,
  onUpdateBlogPost,
  onDeleteBlogPost,
}) => {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const [subView, setSubView] = useState<'list' | 'editor'>('list');

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<BlogCategory>('cuidado-equino');
  const [blogAuthor, setBlogAuthor] = useState('Equipo Formativo La Caballería');
  const [blogReadTime, setBlogReadTime] = useState('4 min');
  const [blogCoverUrl, setBlogCoverUrl] = useState(BLOG_COVER_PRESETS[0].url);
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogPublished, setBlogPublished] = useState(true);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [busyBlogId, setBusyBlogId] = useState<string | null>(null);
  const [confirmDeleteBlogId, setConfirmDeleteBlogId] = useState<string | null>(null);
  const [blogFeedback, setBlogFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetBlogForm = () => {
    setEditingPostId(null);
    setBlogTitle('');
    setBlogCategory('cuidado-equino');
    setBlogAuthor('Equipo Formativo La Caballería');
    setBlogReadTime('4 min');
    setBlogCoverUrl(BLOG_COVER_PRESETS[0].url);
    setBlogExcerpt('');
    setBlogContent('');
    setBlogPublished(true);
  };

  const handleOpenNewEditor = () => {
    resetBlogForm();
    setBlogFeedback(null);
    setSubView('editor');
    scrollToTop();
  };

  const handleStartEditBlogPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setBlogTitle(post.title);
    setBlogCategory(post.category);
    setBlogAuthor(post.authorName);
    setBlogReadTime(post.readTime);
    setBlogCoverUrl(post.coverImageUrl);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogPublished(post.published);
    setBlogFeedback(null);
    setSubView('editor');
    scrollToTop();
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogFeedback(null);
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      setBlogFeedback({
        type: 'error',
        message: 'Completa el título, el resumen y el contenido del artículo.',
      });
      return;
    }

    setIsSavingBlog(true);
    try {
      const payload: BlogPostPayload = {
        title: blogTitle.trim(),
        category: blogCategory,
        authorName: blogAuthor.trim() || 'Equipo Formativo La Caballería',
        readTime: blogReadTime.trim() || '4 min',
        coverImageUrl: blogCoverUrl.trim() || BLOG_COVER_PRESETS[0].url,
        excerpt: blogExcerpt.trim(),
        content: blogContent.trim(),
        published: blogPublished,
      };

      if (editingPostId) {
        await onUpdateBlogPost(editingPostId, payload);
        setBlogFeedback({
          type: 'success',
          message: 'Artículo actualizado y sincronizado en el blog público.',
        });
      } else {
        await onCreateBlogPost(payload);
        setBlogFeedback({
          type: 'success',
          message: 'Nuevo artículo publicado en la sección de blog.',
        });
      }
      resetBlogForm();
      setSubView('list');
      scrollToTop();
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo guardar el artículo.',
      });
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleToggleBlogPublished = async (post: BlogPost) => {
    setBusyBlogId(post.id);
    setBlogFeedback(null);
    try {
      await onUpdateBlogPost(post.id, { published: !post.published });
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'No se pudo cambiar la visibilidad.',
      });
    } finally {
      setBusyBlogId(null);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setBusyBlogId(id);
    setBlogFeedback(null);
    try {
      await onDeleteBlogPost(id);
      setConfirmDeleteBlogId(null);
      if (editingPostId === id) {
        resetBlogForm();
      }
      setBlogFeedback({
        type: 'success',
        message: 'Artículo eliminado del blog.',
      });
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo eliminar el artículo.',
      });
    } finally {
      setBusyBlogId(null);
    }
  };

  const publishedCount = blogPosts.filter((p) => p.published).length;

  return (
    <section
      ref={scrollContainerRef}
      role="tabpanel"
      id="admin-tabpanel-blog"
      aria-labelledby="admin-tab-blog"
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 py-4 sm:py-5"
    >
      <div className="space-y-4 pb-2">
        {/* Sub-view switcher keeps Blog list and Editor cleanly separated to prevent mobile overflow */}
        <div className="bg-[#1A1A1D] border border-white/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto bg-[#141416] border border-white/10 p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setSubView('list');
                scrollToTop();
              }}
              className={`justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                subView === 'list'
                  ? 'bg-[#D21923] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Artículos</span>
              <span className="font-mono tabular-nums text-[10px] opacity-90">
                ({blogPosts.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSubView('editor');
                scrollToTop();
              }}
              className={`justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                subView === 'editor'
                  ? 'bg-[#D21923] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PenLine className="w-3.5 h-3.5 shrink-0" />
              <span>{editingPostId ? 'Editando' : 'Nuevo Artículo'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-zinc-400 px-1">
            <span>
              Publicados:{' '}
              <strong className="font-mono tabular-nums text-white">
                {publishedCount}
              </strong>
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              Borradores:{' '}
              <strong className="font-mono tabular-nums text-zinc-200">
                {blogPosts.length - publishedCount}
              </strong>
            </span>
          </div>
        </div>

        {blogFeedback && (
          <div
            className={`p-3 border text-xs flex items-center gap-2 ${
              blogFeedback.type === 'success'
                ? 'bg-[#1A1A1D] border-white/20 text-white'
                : 'bg-[#D21923]/15 border-[#D21923] text-white'
            }`}
          >
            {blogFeedback.type === 'success' ? (
              <Check className="w-4 h-4 text-[#D21923] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
            )}
            <span>{blogFeedback.message}</span>
          </div>
        )}

        {subView === 'list' ? (
          <div className="bg-[#1A1A1D] border border-white/10 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
                  Artículos Registrados ({blogPosts.length})
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Administra visibilidad, edita contenido o crea nuevas notas ecuestres.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewEditor}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Redactar</span>
              </button>
            </div>

            {blogPosts.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs text-zinc-400">
                  Aún no hay artículos en el blog. Crea tu primer artículo editorial para compartir con las familias.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewEditor}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primer Artículo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {blogPosts.map((post) => {
                  const isBusy = busyBlogId === post.id;
                  const isEditingThis = editingPostId === post.id;
                  return (
                    <div
                      key={post.id}
                      className={`p-3.5 bg-[#141416] border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        isEditingThis ? 'border-[#D21923]' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-14 object-cover border border-white/10 shrink-0 bg-[#1A1A1D]"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                            <span className="text-[#D21923] font-semibold uppercase tracking-wider text-[10px]">
                              {post.category === 'cuidado-equino'
                                ? 'Cuidado Equino'
                                : post.category === 'consejos-principiantes'
                                ? 'Principiantes'
                                : 'Noticias'}
                            </span>
                            <span aria-hidden="true" className="text-zinc-600">
                              ·
                            </span>
                            <span
                              className={
                                post.published
                                  ? 'text-emerald-400 font-medium'
                                  : 'text-zinc-500'
                              }
                            >
                              {post.published ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                          <h5 className="text-xs sm:text-sm font-serif font-bold text-white truncate">
                            {post.title}
                          </h5>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {post.authorName} · {post.readTime}
                          </p>
                        </div>
                      </div>

                      {confirmDeleteBlogId === post.id ? (
                        <div className="w-full sm:w-auto flex items-center justify-between gap-2 bg-[#D21923]/10 border border-[#D21923]/40 p-2 shrink-0">
                          <span className="text-[11px] text-white">¿Eliminar?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteBlog(post.id)}
                              className="px-3 py-1.5 min-h-[38px] text-[11px] font-bold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setConfirmDeleteBlogId(null)}
                              className="px-3 py-1.5 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-zinc-200 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleStartEditBlogPost(post)}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D21923] text-zinc-200 transition-colors whitespace-nowrap"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleBlogPublished(post)}
                            className="inline-flex items-center justify-center px-2.5 py-2 min-h-[42px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {post.published ? 'Ocultar' : 'Publicar'}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteBlogId(post.id)}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 min-h-[42px] text-[11px] font-semibold uppercase tracking-wider bg-white/[0.03] hover:bg-[#D21923]/15 border border-white/10 hover:border-[#D21923]/50 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                            aria-label={`Eliminar artículo ${post.title}`}
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="sm:hidden">Borrar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleBlogSubmit}
            className="bg-[#1A1A1D] border border-white/10 p-4 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block">
                  Gestión Editorial · Bitácora Ecuestre
                </span>
                <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                  {editingPostId ? 'Editar Artículo Existente' : 'Publicar Nuevo Artículo'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {editingPostId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetBlogForm();
                      setSubView('list');
                    }}
                    className="px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors whitespace-nowrap"
                  >
                    Cancelar edición
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSubView('list')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>Volver</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                  Título del artículo *
                </label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="Ej. Cómo cuidar los cascos tras la lluvia"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                  Categoría
                </label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value as BlogCategory)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                >
                  <option value="cuidado-equino">Cuidado Equino</option>
                  <option value="consejos-principiantes">
                    Consejos para Principiantes
                  </option>
                  <option value="noticias-club">Noticias del Club</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                  Autor
                </label>
                <input
                  type="text"
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                  Tiempo de lectura
                </label>
                <input
                  type="text"
                  value={blogReadTime}
                  onChange={(e) => setBlogReadTime(e.target.value)}
                  placeholder="4 min"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                  Estado
                </label>
                <label className="flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogPublished}
                    onChange={(e) => setBlogPublished(e.target.checked)}
                    className="w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                  />
                  <span>Publicado en el sitio</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                Imagen de portada (URL o galería rápida)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BLOG_COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBlogCoverUrl(preset.url)}
                    className={`px-2.5 py-2 min-h-[40px] text-[11px] border transition-colors text-center truncate ${
                      blogCoverUrl === preset.url
                        ? 'bg-[#D21923]/20 border-[#D21923] text-white font-semibold'
                        : 'bg-[#141416] border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={blogCoverUrl}
                onChange={(e) => setBlogCoverUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                Resumen / Extracto *
              </label>
              <textarea
                rows={2}
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Breve introducción que aparecerá en la tarjeta del artículo..."
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                Contenido completo *{' '}
                <span className="text-zinc-500 font-normal normal-case">
                  (separa párrafos con una línea en blanco)
                </span>
              </label>
              <textarea
                rows={5}
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Redacta aquí el artículo completo sobre cuidado equino, consejos para principiantes o noticias del club..."
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/15 text-white text-base sm:text-xs leading-relaxed focus:outline-none focus:border-[#D21923]"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isSavingBlog}
                className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isSavingBlog ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingPostId ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>
                  {isSavingBlog
                    ? 'Guardando...'
                    : editingPostId
                    ? 'Guardar Cambios'
                    : 'Publicar Artículo'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
