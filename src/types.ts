export interface ClassType {
  id: string;
  name: string;
  duration: string;
  targetAudience: string;
  description: string;
  focus: string;
  recommendedAge: string;
  badge: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  availableDays: string[];
  focusPillars: string[];
}

export interface AppointmentBooking {
  id: string;
  bookingCode: string;
  classTypeId: string;
  classTypeName: string;
  instructorId: string;
  instructorName: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  timeSlot: string;
  slotId?: string;
  studentName: string;
  studentAge: string;
  guardianName: string;
  phone: string;
  email: string;
  experienceLevel: 'Sin experiencia (Primera vez)' | 'Poco conocimiento' | 'Nivel intermedio' | 'Avanzado';
  notes: string;
  createdAt: string;
  status: 'confirmada' | 'solicitada' | 'cancelada';
}

export interface OccupiedSlot {
  date: string;
  timeSlot: string;
  instructorId: string;
}

export interface Activity {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string;
  duration?: string;
  imageUrl: string;
  imageAlt: string;
  status: 'confirmado' | 'por_confirmar';
}

export interface HorseProfile {
  id: string;
  name: string;
  breed?: string;
  temperament: string;
  role: string;
  description: string;
  curiosities: string[];
  imageUrl: string;
  imageAlt: string;
  levelSuitability: 'Iniciación' | 'Todos los niveles' | 'Jóvenes y Niños' | 'Avanzado';
  favoriteActivity?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'alumnos' | 'vinculo' | 'familiar' | 'tecnica';
  imageUrl: string;
  caption: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlight: string;
}

export interface ContactFormData {
  studentName: string;
  guardianName: string;
  email: string;
  phone: string;
  inquiryReason: string;
  message: string;
  dataConsent: boolean;
}

export type BlogCategory = 'cuidado-equino' | 'consejos-principiantes' | 'noticias-club';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  content: string;
  authorName: string;
  coverImageUrl: string;
  readTime: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

