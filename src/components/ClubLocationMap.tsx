import React, { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
  ColorScheme,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Plus,
  Minus,
  Crosshair,
  Layers,
  Navigation,
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __MAPS_API_KEY__ !== 'undefined' ? __MAPS_API_KEY__ : '');

// Referential center (editable once official club coordinates are confirmed)
const DEFAULT_CLUB_CENTER: { lat: number; lng: number } = {
  lat: 40.416775,
  lng: -3.70379,
};

interface MapStyleControlsProps {
  mapType: 'roadmap' | 'hybrid';
  onChangeMapType: (type: 'roadmap' | 'hybrid') => void;
}

const MapStyleControls: React.FC<MapStyleControlsProps> = ({ mapType, onChangeMapType }) => (
  <div className="absolute top-3 left-3 z-10 flex items-center bg-[#141416]/95 backdrop-blur-md border border-white/15 p-1 shadow-xl">
    <button
      type="button"
      onClick={() => onChangeMapType('roadmap')}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
        mapType === 'roadmap'
          ? 'bg-[#D21923] text-white'
          : 'text-zinc-300 hover:text-white'
      }`}
    >
      <Layers className="w-3.5 h-3.5" />
      <span>Oscuro</span>
    </button>
    <button
      type="button"
      onClick={() => onChangeMapType('hybrid')}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
        mapType === 'hybrid'
          ? 'bg-[#D21923] text-white'
          : 'text-zinc-300 hover:text-white'
      }`}
    >
      <span>Satélite</span>
    </button>
  </div>
);

interface KeylessInteractiveMapProps {
  mapType: 'roadmap' | 'hybrid';
  onChangeMapType: (type: 'roadmap' | 'hybrid') => void;
}

const KeylessInteractiveMap: React.FC<KeylessInteractiveMapProps> = ({
  mapType,
  onChangeMapType,
}) => {
  const [zoomLevel, setZoomLevel] = useState(14);
  const [recenterNonce, setRecenterNonce] = useState(0);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  const embedMode = mapType === 'hybrid' ? 'h' : 'm';
  const embedSrc = `https://maps.google.com/maps?q=${DEFAULT_CLUB_CENTER.lat},${DEFAULT_CLUB_CENTER.lng}&hl=es&z=${zoomLevel}&t=${embedMode}&output=embed&center_nonce=${recenterNonce}`;

  useEffect(() => {
    setIsFrameLoaded(false);
  }, [embedSrc]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 4));
  const handleRecenter = () => {
    setZoomLevel(14);
    setRecenterNonce((n) => n + 1);
  };

  return (
    <div className="relative w-full h-full bg-[#141416] overflow-hidden">
      {!isFrameLoaded && (
        <div className="absolute inset-0 z-20 bg-[#141416] flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-8 h-8 border-2 border-white/15 border-t-[#D21923] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            Cargando mapa del club...
          </span>
        </div>
      )}

      <iframe
        title="Mapa interactivo de La Caballería"
        src={embedSrc}
        onLoad={() => setIsFrameLoaded(true)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full border-0 transition-[filter] duration-300"
        style={
          mapType === 'roadmap'
            ? { filter: 'invert(90%) hue-rotate(180deg) contrast(95%) grayscale(15%)' }
            : undefined
        }
        allowFullScreen
      />

      <MapStyleControls mapType={mapType} onChangeMapType={onChangeMapType} />

      {/* Top-Right Zoom & Recenter Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer"
          aria-label="Acercar mapa"
          title="Acercar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer"
          aria-label="Alejar mapa"
          title="Alejar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer group"
          aria-label="Centrar en el club"
          title="Centrar ubicación del club"
        >
          <Crosshair className="w-4 h-4 text-[#D21923] group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Bottom-Left Club Reference Card */}
      <div className="hidden sm:block absolute bottom-3 left-3 z-10 max-w-[260px] bg-[#141416]/95 backdrop-blur-md border border-white/15 p-3 shadow-2xl">
        <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-white/10">
          <span className="w-2 h-2 bg-[#D21923] inline-block shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {CLUB_INFO.name}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-[#D21923] mb-1">
          {CLUB_INFO.descriptor}
        </p>
        <p className="text-[11px] text-zinc-400 leading-snug mb-2">
          Zona referencial del club. Dirección exacta confirmada al agendar tu cita.
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${DEFAULT_CLUB_CENTER.lat},${DEFAULT_CLUB_CENTER.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#D21923] transition-colors"
        >
          <Navigation className="w-3 h-3 text-[#D21923]" />
          <span>Cómo llegar</span>
        </a>
      </div>
    </div>
  );
};

interface MapCanvasProps {
  mapType: 'roadmap' | 'hybrid';
  onChangeMapType: (type: 'roadmap' | 'hybrid') => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ mapType, onChangeMapType }) => {
  const map = useMap();
  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(14);

  const handleZoomIn = useCallback(() => {
    if (!map) return;
    const current = map.getZoom() ?? zoomLevel;
    const next = Math.min(current + 1, 20);
    map.setZoom(next);
    setZoomLevel(next);
  }, [map, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (!map) return;
    const current = map.getZoom() ?? zoomLevel;
    const next = Math.max(current - 1, 4);
    map.setZoom(next);
    setZoomLevel(next);
  }, [map, zoomLevel]);

  const handleRecenter = useCallback(() => {
    if (!map) return;
    map.panTo(DEFAULT_CLUB_CENTER);
    map.setZoom(14);
    setZoomLevel(14);
    setInfoOpen(true);
  }, [map]);

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <KeylessInteractiveMap mapType={mapType} onChangeMapType={onChangeMapType} />;
  }

  return (
    <div className="relative w-full h-full bg-[#141416]">
      {!isLoaded && (
        <div className="absolute inset-0 z-20 bg-[#141416] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-white/15 border-t-[#D21923] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            Cargando mapa del club...
          </span>
        </div>
      )}

      <GoogleMap
        defaultCenter={DEFAULT_CLUB_CENTER}
        defaultZoom={14}
        mapId="DEMO_MAP_ID"
        colorScheme={ColorScheme.DARK}
        mapTypeId={mapType}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        onZoomChanged={(ev) => {
          const z = ev.detail.zoom;
          if (typeof z === 'number') setZoomLevel(Math.round(z));
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <AdvancedMarker
          ref={markerRef}
          position={DEFAULT_CLUB_CENTER}
          onClick={() => setInfoOpen((prev) => !prev)}
          title="La Caballería - Club de Equitación"
        >
          <div className="relative flex flex-col items-center cursor-pointer group">
            {/* Pulsing crimson halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#D21923]/30 animate-ping motion-reduce:animate-none pointer-events-none" />

            {/* Marker pin badge */}
            <div className="relative w-10 h-10 bg-[#141416] border-2 border-[#D21923] shadow-[0_6px_20px_rgba(210,25,35,0.65)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <MapPin className="w-5 h-5 text-[#D21923]" />
            </div>

            {/* Pin pointer triangle */}
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#D21923]" />

            {/* Compact label */}
            <div className="mt-1 px-2 py-0.5 bg-[#141416]/95 border border-white/20 text-[10px] font-bold tracking-widest uppercase text-white whitespace-nowrap shadow-lg">
              LA CABALLERÍA
            </div>
          </div>
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={230}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="p-1 text-[#141416] font-sans">
              <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-zinc-200">
                <span className="w-2 h-2 bg-[#D21923] inline-block" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#141416]">
                  {CLUB_INFO.name}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#D21923] mb-1">
                {CLUB_INFO.descriptor}
              </p>
              <p className="text-[11px] text-zinc-600 italic mb-2">
                "{CLUB_INFO.slogan}"
              </p>
              <p className="text-[11px] text-zinc-700 leading-snug mb-2">
                Ubicación referencial. Dirección oficial por confirmar por el club.
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${DEFAULT_CLUB_CENTER.lat},${DEFAULT_CLUB_CENTER.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#D21923] hover:underline"
              >
                <Navigation className="w-3 h-3" />
                <span>Cómo llegar</span>
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Custom Top-Left Controls: Map Style Mode */}
      <MapStyleControls mapType={mapType} onChangeMapType={onChangeMapType} />

      {/* Custom Top-Right Controls: Zoom & Recenter */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer"
          aria-label="Acercar mapa"
          title="Acercar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer"
          aria-label="Alejar mapa"
          title="Alejar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 bg-[#141416]/95 hover:bg-[#D21923] text-white border border-white/15 hover:border-[#D21923] flex items-center justify-center transition-colors shadow-xl cursor-pointer group"
          aria-label="Centrar en el club"
          title="Centrar ubicación del club"
        >
          <Crosshair className="w-4 h-4 text-[#D21923] group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};

export const ClubLocationMap: React.FC = () => {
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');

  return (
    <div className="bg-[#1B1B1E] border border-white/10 shadow-2xl overflow-hidden">
      {/* Top Institutional Header Bar */}
      <div className="h-[2px] bg-gradient-to-r from-[#D21923] via-[#D21923]/60 to-transparent" />

      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141416]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 bg-[#D21923]/15 border border-[#D21923]/40 flex items-center justify-center text-[#D21923] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white">
              Ubicación del Club
            </h3>
            <p className="text-xs text-zinc-400">
              Mapa interactivo · Zona referencial por confirmar por La Caballería
            </p>
          </div>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${DEFAULT_CLUB_CENTER.lat},${DEFAULT_CLUB_CENTER.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shrink-0"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Cómo llegar</span>
        </a>
      </div>

      {/* Explicit Sized Map Container (CF2: avoids 0x0 collapse) */}
      <div className="relative w-full h-[290px] sm:h-[390px] lg:h-[440px]">
        {MAPS_API_KEY ? (
          <APIProvider
            apiKey={MAPS_API_KEY}
            language="es"
            region="ES"
            libraries={['marker']}
          >
            <MapCanvas mapType={mapType} onChangeMapType={setMapType} />
          </APIProvider>
        ) : (
          <KeylessInteractiveMap mapType={mapType} onChangeMapType={setMapType} />
        )}
      </div>

      {/* Bottom Institutional Reference Strip */}
      <div className="px-5 py-3.5 sm:px-6 bg-[#141416] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
        <span>
          <strong className="text-white">Acceso y estacionamiento:</strong>{' '}
          Detalles de acceso y dirección exacta serán confirmados al agendar tu cita.
        </span>
        <span className="font-mono text-[11px] text-zinc-500">
          {CLUB_INFO.website}
        </span>
      </div>
    </div>
  );
};
