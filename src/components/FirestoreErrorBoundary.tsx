import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class FirestoreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message:
        error?.message || 'Ha ocurrido un error inesperado al sincronizar con la nube.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141416] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1B1B1E] border border-white/10 p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#D21923]/15 border border-[#D21923]/50 flex items-center justify-center text-[#D21923]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">
              Error de conexión con la base de datos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              No pudimos completar la operación solicitada. Recarga la página para restablecer la conexión.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
