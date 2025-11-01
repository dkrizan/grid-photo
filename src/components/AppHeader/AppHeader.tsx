import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { NavLink } from 'react-router-dom';

const linkBaseClass =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800/60 hover:text-slate-100';

const linkActiveClass = 'bg-violet-600 text-white hover:bg-violet-600';

export function AppHeader() {
  return (
    <header className="mb-8 space-y-6">
      <div className="flex gap-4 flex-row md:items-top md:justify-between">
        <div className="max-w-2xl space-y-4">
          <img src="/logo-dark.svg" alt="GridPhoto" className="h-16" />
          <p className="text-sm text-slate-300 sm:text-base">
            Arrange photo grids in seconds. Upload your shots, adjust the
            layout, and export high-resolution sheets without leaving the
            browser.
          </p>
        </div>
        <div className="flex justify-center align-top">
          <a
            href="https://github.com/dkrizan/grid-photo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-violet-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/70 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="View GridPhoto on GitHub"
          >
            <GitHubLogoIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
      <nav className="flex gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkBaseClass} ${isActive ? linkActiveClass : 'text-slate-300'}`
          }
          end
        >
          Builder
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `${linkBaseClass} ${isActive ? linkActiveClass : 'text-slate-300'}`
          }
        >
          About
        </NavLink>
      </nav>
    </header>
  );
}
