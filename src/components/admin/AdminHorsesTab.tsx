import React, { useState } from 'react';
import { Plus, RotateCcw, Check } from 'lucide-react';
import type { HorseProfile } from '../../types';

interface AdminHorsesTabProps {
  totalHorses: number;
  totalActivities: number;
  onAddHorse: (horse: HorseProfile) => void;
  onResetData: () => void;
}

export const AdminHorsesTab: React.FC<AdminHorsesTabProps> = ({
  totalHorses,
  totalActivities,
  onAddHorse,
  onResetData,
}) => {
  const [newHorseName, setNewHorseName] = useState('');
  const [newHorseBreed, setNewHorseBreed] = useState('Español Cruzado');
  const [newHorseTemperament, setNewHorseTemperament] = useState(
    'Dócil, cariñoso y de paso suave'
  );
  const [newHorseDescription, setNewHorseDescription] = useState(
    'Nuevo ejemplar incorporado a las actividades formativas del club.'
  );
  const [newHorseCuriosity] = useState('Muy atento a los ejercicios de pista.');
  const [level, setLevel] = useState<
    'Iniciación' | 'Todos los niveles' | 'Jóvenes y Niños'
  >('Jóvenes y Niños');
  const [successNotice, setSuccessNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState(false);

  const handleCreateHorse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorseName.trim()) return;

    const newHorse: HorseProfile = {
      id: `caballo-${Date.now()}`,
      name: newHorseName.trim(),
      breed: newHorseBreed,
      temperament: newHorseTemperament,
      role: 'Formación y convivencia ecuestre',
      description: newHorseDescription,
      curiosities: [newHorseCuriosity],
      imageUrl:
        'https://images.unsplash.com/photo-1598974357801-cbca100e6571?auto=format&fit=crop&w=1200&q=80',
      imageAlt: `Caballo ${newHorseName} de La Caballería`,
      levelSuitability: level,
    };

    onAddHorse(newHorse);
    setNewHorseName('');
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 2500);
  };

  const handleConfirmReset = () => {
    onResetData();
    setConfirmReset(false);
    setResetDoneNotice(true);
    setTimeout(() => setResetDoneNotice(false), 2500);
  };

  return (
    <section
      role="tabpanel"
      id="admin-tabpanel-plantel"
      aria-labelledby="admin-tab-plantel"
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 py-4 sm:py-5"
    >
      <div className="space-y-5 pb-2">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[#1A1A1D] border border-white/10">
            <span className="text-zinc-400 block">Caballos activos</span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              {totalHorses}
            </span>
          </div>
          <div className="p-3.5 bg-[#1A1A1D] border border-white/10">
            <span className="text-zinc-400 block">Actividades</span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              {totalActivities}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleCreateHorse}
          className="space-y-4 bg-[#1A1A1D] border border-white/10 p-4 sm:p-5"
        >
          <h4 className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
            Incorporar Nuevo Perfil de Caballo
          </h4>

          <div>
            <label className="block text-xs text-zinc-300 mb-1">
              Nombre del ejemplar
            </label>
            <input
              type="text"
              value={newHorseName}
              onChange={(e) => setNewHorseName(e.target.value)}
              placeholder="Ej. Vendaval, Lucero, Gitana"
              required
              className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-300 mb-1">
                Raza o estirpe
              </label>
              <input
                type="text"
                value={newHorseBreed}
                onChange={(e) => setNewHorseBreed(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-300 mb-1">
                Enfoque formativo
              </label>
              <select
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value as
                      | 'Iniciación'
                      | 'Todos los niveles'
                      | 'Jóvenes y Niños'
                  )
                }
                className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
              >
                <option value="Jóvenes y Niños">Jóvenes y Niños</option>
                <option value="Iniciación">Iniciación</option>
                <option value="Todos los niveles">Todos los niveles</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-300 mb-1">Temperamento</label>
            <input
              type="text"
              value={newHorseTemperament}
              onChange={(e) => setNewHorseTemperament(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-300 mb-1">
              Descripción breve
            </label>
            <textarea
              rows={2}
              value={newHorseDescription}
              onChange={(e) => setNewHorseDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Añadir a la galería pública</span>
          </button>

          {successNotice && (
            <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 pt-1">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Perfil incorporado exitosamente a la sección!</span>
            </p>
          )}
        </form>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {confirmReset ? (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#D21923]/10 border border-[#D21923]/40">
              <span className="text-xs text-white">
                ¿Restablecer el plantel de caballos a los valores iniciales?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-2 min-h-[40px] text-xs font-bold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors whitespace-nowrap"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3.5 py-2 min-h-[40px] text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-zinc-200 transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs text-zinc-300 hover:text-white bg-white/5 border border-white/10 hover:border-white/25 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restablecer datos del plantel</span>
            </button>
          )}

          {resetDoneNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>Plantel restablecido</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
