import fs from 'fs';
import path from 'path';
import type { BlogCategory, BlogPost } from '../src/types';
import { getWritableDataDir } from './storageDir';

const DATA_DIR = getWritableDataDir();
const BLOG_FILE = path.join(DATA_DIR, 'blog-posts.json');

const SEED_POSTS: BlogPost[] = [
  {
    id: 'blog-cepillado-vinculo',
    title: 'El ritual del cepillado: por qué el vínculo empieza antes de montar',
    slug: 'el-ritual-del-cepillado-vinculo-antes-de-montar',
    category: 'cuidado-equino',
    excerpt:
      'Cepillar, limpiar cascos y observar el lenguaje corporal del caballo transforma la primera clase en una experiencia serena y segura.',
    content:
      'En La Caballería creemos que la verdadera equitación comienza pie a tierra, mucho antes de colocar el pie en el estribo. Dedicar diez minutos al cepillado consciente permite que el alumno y el caballo se reconozcan, bajen pulsaciones y construyan confianza mutua.\n\nDurante la limpieza previa revisamos el pelaje con bruza suave, desenredamos crin y cola sin tirones y verificamos con el limpiacascos que no existan piedras ni molestias en las ranillas. Este gesto no solo cuida la salud física del animal, también entrena la observación atenta del jinete.\n\nPara niños y principiantes, escuchar la respiración del caballo mientras siente el contacto tranquilo del cepillo elimina temores iniciales y enseña una lección esencial: el respeto siempre precede a la técnica.',
    authorName: 'Prof. Andrea Salcedo',
    coverImageUrl:
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min',
    published: true,
    createdAt: '2026-11-05T10:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
  },
  {
    id: 'blog-primera-clase-guia',
    title: 'Tu primera clase de equitación: indumentaria, postura y calma en pista',
    slug: 'primera-clase-equitacion-indumentaria-postura-calma',
    category: 'consejos-principiantes',
    excerpt:
      'Todo lo que padres y alumnos debutantes necesitan saber antes de su primer encuentro en pista: ropa recomendada, respiración y seguridad.',
    content:
      'Dar el primer paso hacia el mundo ecuestre despierta ilusión y algunas dudas lógicas. La buena noticia es que no necesitas adquirir equipo costoso para tu sesión inicial: basta un pantalón largo flexible (como mallas deportivas o vaqueros cómodos sin costuras gruesas) y calzado cerrado con suela firme y tacón bajo.\n\nEl club proporciona en cada clase casco homologado y chaleco protector ajustado a la talla del alumno. Al llegar, te recomendamos hacerlo con 15 minutos de anticipación para saludar con calma al caballo asignado y familiarizarte con el entorno.\n\nUna vez sobre la montura, recuerda tres claves sencillas: mantén la mirada al frente (no hacia el cuello del caballo), respira profundo para acompañar el movimiento natural del paso y deja caer suavemente los talones. Nuestros instructores te guiarán en todo momento.',
    authorName: 'Prof. Carlos Mendoza',
    coverImageUrl:
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min',
    published: true,
    createdAt: '2026-11-09T11:30:00.000Z',
    updatedAt: '2026-11-09T11:30:00.000Z',
  },
  {
    id: 'blog-temporada-horarios-club',
    title: 'Nuevas jornadas familiares de fin de semana y ampliación de horarios',
    slug: 'nuevas-jornadas-familiares-ampliacion-horarios',
    category: 'noticias-club',
    excerpt:
      'Incorporamos nuevas franjas matutinas de sábado y domingo junto a talleres compartidos para padres e hijos en pista.',
    content:
      'Atendiendo la creciente participación de familias de la comunidad, La Caballería inaugura nuevas franjas horarias de mañana los sábados y domingos orientadas a sesiones de Iniciación Infantil y Experiencia Ecuestre Familiar.\n\nAdemás, hemos renovado la arena de nuestra pista principal para optimizar la amortiguación y el confort de nuestros caballos durante las transiciones de trote y galope.\n\nRecuerda que puedes activar las notificaciones Web Push al final del sitio web para enterarte al instante cuando se liberen cupos en pista o anunciemos nuestras próximas exhibiciones de puertas abiertas.',
    authorName: 'Dirección La Caballería',
    coverImageUrl:
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 min',
    published: true,
    createdAt: '2026-11-12T09:00:00.000Z',
    updatedAt: '2026-11-12T09:00:00.000Z',
  },
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Fallback to in-memory store if directory cannot be created
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isValidCategory(cat: unknown): cat is BlogCategory {
  return (
    cat === 'cuidado-equino' ||
    cat === 'consejos-principiantes' ||
    cat === 'noticias-club'
  );
}

function loadBlogPosts(): BlogPost[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(BLOG_FILE)) {
      try {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(SEED_POSTS, null, 2), 'utf-8');
      } catch {
        // Ignore write failures in constrained environments
      }
      return [...SEED_POSTS];
    }
    const raw = fs.readFileSync(BLOG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BlogPost[];
    }
    return [...SEED_POSTS];
  } catch (err) {
    console.error('Error reading blog posts store:', err);
    return [...SEED_POSTS];
  }
}

function saveBlogPosts(posts: BlogPost[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing blog posts store:', err);
  }
}

let blogPostsStore: BlogPost[] = loadBlogPosts();

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPostsStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPublishedBlogPosts(): BlogPost[] {
  return getAllBlogPosts().filter((p) => p.published);
}

export function createBlogPost(input: {
  title: string;
  category: BlogCategory;
  excerpt: string;
  content: string;
  authorName?: string;
  coverImageUrl?: string;
  readTime?: string;
  published?: boolean;
}): BlogPost {
  const now = new Date().toISOString();
  const cleanTitle = input.title.trim();
  const baseSlug = slugify(cleanTitle) || `articulo-${Date.now()}`;
  const slugExists = blogPostsStore.some((p) => p.slug === baseSlug);

  const created: BlogPost = {
    id: `blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    slug: slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug,
    category: isValidCategory(input.category) ? input.category : 'noticias-club',
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    authorName: input.authorName?.trim() || 'Equipo Formativo La Caballería',
    coverImageUrl:
      input.coverImageUrl?.trim() ||
      'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80',
    readTime: input.readTime?.trim() || '4 min',
    published: input.published !== undefined ? Boolean(input.published) : true,
    createdAt: now,
    updatedAt: now,
  };

  blogPostsStore = [created, ...blogPostsStore];
  saveBlogPosts(blogPostsStore);
  return created;
}

export function updateBlogPost(
  id: string,
  patch: Partial<{
    title: string;
    category: BlogCategory;
    excerpt: string;
    content: string;
    authorName: string;
    coverImageUrl: string;
    readTime: string;
    published: boolean;
  }>
): BlogPost | null {
  const idx = blogPostsStore.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const existing = blogPostsStore[idx];
  const nextTitle = typeof patch.title === 'string' && patch.title.trim()
    ? patch.title.trim()
    : existing.title;

  const updated: BlogPost = {
    ...existing,
    title: nextTitle,
    slug:
      nextTitle !== existing.title
        ? slugify(nextTitle) || existing.slug
        : existing.slug,
    category: isValidCategory(patch.category) ? patch.category : existing.category,
    excerpt:
      typeof patch.excerpt === 'string' && patch.excerpt.trim()
        ? patch.excerpt.trim()
        : existing.excerpt,
    content:
      typeof patch.content === 'string' && patch.content.trim()
        ? patch.content.trim()
        : existing.content,
    authorName:
      typeof patch.authorName === 'string' && patch.authorName.trim()
        ? patch.authorName.trim()
        : existing.authorName,
    coverImageUrl:
      typeof patch.coverImageUrl === 'string' && patch.coverImageUrl.trim()
        ? patch.coverImageUrl.trim()
        : existing.coverImageUrl,
    readTime:
      typeof patch.readTime === 'string' && patch.readTime.trim()
        ? patch.readTime.trim()
        : existing.readTime,
    published:
      typeof patch.published === 'boolean' ? patch.published : existing.published,
    updatedAt: new Date().toISOString(),
  };

  blogPostsStore = [
    ...blogPostsStore.slice(0, idx),
    updated,
    ...blogPostsStore.slice(idx + 1),
  ];
  saveBlogPosts(blogPostsStore);
  return updated;
}

export function deleteBlogPost(id: string): boolean {
  const before = blogPostsStore.length;
  blogPostsStore = blogPostsStore.filter((p) => p.id !== id);
  if (blogPostsStore.length !== before) {
    saveBlogPosts(blogPostsStore);
    return true;
  }
  return false;
}
