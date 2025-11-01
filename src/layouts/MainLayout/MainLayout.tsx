import { Outlet } from 'react-router-dom';

import { AppHeader } from '../../components/AppHeader';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AppHeader />
        <main>
          <Outlet />
        </main>
        <footer className="mt-12 text-center text-xs text-slate-500">
          All processing happens locally in your browser. No uploads.
        </footer>
      </div>
    </div>
  );
}
