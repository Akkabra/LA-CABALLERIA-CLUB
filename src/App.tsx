import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EpicIntroOverlay } from './components/EpicIntroOverlay';
import { Hero } from './components/Hero';
import { BookingSection } from './components/BookingSection';
import { EditorialManifesto } from './components/EditorialManifesto';
import { EditorialPillars } from './components/EditorialPillars';
import { HorsesAndTeamSection } from './components/HorsesAndTeamSection';
import { EditorialGallery } from './components/EditorialGallery';
import { BlogSection } from './components/BlogSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FadeInSection } from './components/FadeInSection';
import { 
  HorseDetailModal, 
  LightboxModal, 
  PrivacyPolicyModal, 
  TermsModal 
} from './components/Modals';
import { AdminPreviewDrawer } from './components/AdminPreviewDrawer';
import { 
  INITIAL_ACTIVITIES, 
  INITIAL_HORSES, 
  GALLERY_PHOTOS 
} from './data/clubData';
import { HorseProfile, GalleryPhoto } from './types';
import { useRealtimeBookings } from './hooks/useRealtimeBookings';

export default function App() {
  // State for horses and gallery
  const [horses, setHorses] = useState<HorseProfile[]>(INITIAL_HORSES);
  const [gallery] = useState<GalleryPhoto[]>(GALLERY_PHOTOS);

  // Real-time appointments store (public: anonymized occupiedSlots; admin: full bookings)
  const {
    occupiedSlots,
    bookings,
    blogPosts,
    isLoadingBookings,
    isLoadingBlog,
    isAdminAuthenticated,
    adminEmail,
    isCheckingAuth,
    isConnected: isRealtimeConnected,
    pushStats,
    loginAdmin,
    logoutAdmin,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    sendTestEmail,
    fetchPushStats,
    broadcastPush,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
  } = useRealtimeBookings();

  // Booking engine pre-selections
  const [preselectedClassTypeId, setPreselectedClassTypeId] = useState<string>('iniciacion-infantil');
  const [preselectedInstructorId, setPreselectedInstructorId] = useState<string>('inst-cualquiera');

  // Modals state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  // Google Maps Demo Key quota state
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Detail modal
  const [selectedHorse, setSelectedHorse] = useState<HorseProfile | null>(null);

  // Lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Smooth scroll helpers
  const scrollToBooking = (classTypeId?: string, instructorId?: string) => {
    if (classTypeId) setPreselectedClassTypeId(classTypeId);
    if (instructorId) setPreselectedInstructorId(instructorId);
    const el = document.getElementById('agendar-cita');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToManifesto = () => {
    const el = document.getElementById('manifiesto');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contacto');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenLightbox = (photo: GalleryPhoto, index: number) => {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
  };

  const handleNextPhoto = () => {
    const nextIndex = (lightboxIndex + 1) % gallery.length;
    setLightboxIndex(nextIndex);
    setLightboxPhoto(gallery[nextIndex]);
  };

  const handlePrevPhoto = () => {
    const prevIndex = (lightboxIndex - 1 + gallery.length) % gallery.length;
    setLightboxIndex(prevIndex);
    setLightboxPhoto(gallery[prevIndex]);
  };

  // Administration actions for extensibility
  const handleAddHorse = (newHorse: HorseProfile) => {
    setHorses((prev) => [newHorse, ...prev]);
  };

  const handleResetData = () => {
    setHorses(INITIAL_HORSES);
  };

  return (
    <div className="min-h-screen bg-[#141416] text-white flex flex-col selection:bg-[#D21923] selection:text-white overflow-x-clip">
      <EpicIntroOverlay />
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. Header Fijo con Logotipo Oficial y Acceso Directo a Citas */}
      <Header onOpenBooking={() => scrollToBooking()} />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 2. Hero Section con fondo renovado, texto en blanco, descriptor cursivo en rojo y eslogan dinámico */}
        <Hero
          onBookNow={() => scrollToBooking()}
          onExplore={scrollToManifesto}
        />

        {/* 3. Sección Funcional de Agendamiento de Citas (sin exponer citas a visitantes) */}
        <FadeInSection>
          <BookingSection
            occupiedSlots={occupiedSlots}
            onCreateBooking={createBooking}
            preselectedClassTypeId={preselectedClassTypeId}
            preselectedInstructorId={preselectedInstructorId}
          />
        </FadeInSection>

        {/* 4. Esencia & Manifiesto con Fade-in suave */}
        <FadeInSection>
          <EditorialManifesto onGoToBooking={() => scrollToBooking()} />
        </FadeInSection>

        {/* 5. Muro Tipográfico de Impacto con Fade-in suave */}
        <FadeInSection>
          <EditorialPillars />
        </FadeInSection>

        {/* 6. Plantel Formativo: Caballos & Profesores con Fade-in suave */}
        <FadeInSection>
          <HorsesAndTeamSection
            horses={horses}
            onSelectHorse={(h) => setSelectedHorse(h)}
            onBookWithInstructor={(instId) => scrollToBooking(undefined, instId)}
            onOpenManagePrompt={() => setIsAdminDrawerOpen(true)}
          />
        </FadeInSection>

        {/* 7. Galería Cinematográfica con Fade-in suave */}
        <FadeInSection>
          <EditorialGallery
            photos={gallery}
            onOpenLightbox={handleOpenLightbox}
          />
        </FadeInSection>

        {/* 8. Blog del Club: Cuidado equino, consejos y noticias */}
        <FadeInSection>
          <BlogSection
            posts={blogPosts}
            isLoading={isLoadingBlog}
            onGoToBooking={() => scrollToBooking()}
          />
        </FadeInSection>

        {/* 9. Preguntas Frecuentes Clave para Padres con Fade-in suave */}
        <FadeInSection>
          <FaqSection onGoToContact={scrollToContact} />
        </FadeInSection>

        {/* 9. Contacto Directo con Fade-in suave */}
        <FadeInSection>
          <ContactSection
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          />
        </FadeInSection>
      </main>

      {/* 10. Footer */}
      <Footer
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        onOpenAdminDrawer={() => setIsAdminDrawerOpen(true)}
      />

      {/* --- Modales --- */}
      <HorseDetailModal
        horse={selectedHorse}
        onClose={() => setSelectedHorse(null)}
        onMeetHorse={(horseName) => {
          setSelectedHorse(null);
          scrollToBooking();
        }}
      />

      <LightboxModal
        photo={lightboxPhoto}
        photos={gallery}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxPhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <AdminPreviewDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        isAdminAuthenticated={isAdminAuthenticated}
        adminEmail={adminEmail}
        isCheckingAuth={isCheckingAuth}
        onLoginAdmin={loginAdmin}
        onLogoutAdmin={logoutAdmin}
        bookings={bookings}
        isLoadingBookings={isLoadingBookings}
        isRealtimeConnected={isRealtimeConnected}
        onUpdateBookingStatus={updateBookingStatus}
        onDeleteBooking={deleteBooking}
        onSendTestEmail={sendTestEmail}
        pushStats={pushStats}
        onRefreshPushStats={fetchPushStats}
        onBroadcastPush={broadcastPush}
        blogPosts={blogPosts}
        onCreateBlogPost={createBlogPost}
        onUpdateBlogPost={updateBlogPost}
        onDeleteBlogPost={deleteBlogPost}
        onAddHorse={handleAddHorse}
        onResetData={handleResetData}
        totalHorses={horses.length}
        totalActivities={INITIAL_ACTIVITIES.length}
      />
    </div>
  );
}
