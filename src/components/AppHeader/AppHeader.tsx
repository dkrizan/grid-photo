import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Link, NavLink, useLocation } from 'react-router-dom';

const linkBaseClass =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800/60 hover:text-slate-100';

const linkActiveClass = 'bg-violet-600 text-white hover:bg-violet-600';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/builder', label: 'Builder' },
  { to: '/about', label: 'About' },
];

export function AppHeader() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="mb-8 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo-dark.svg"
              alt="GridPhoto"
              className="h-12 sm:h-14"
            />
          </Link>
          <nav className="flex flex-1 flex-wrap justify-end gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkBaseClass} ${
                    isActive ? linkActiveClass : 'text-slate-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
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
        <div className="max-w-2xl space-y-4">
          {isLanding ? (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl sm:leading-tight">
                <span className="block text-2xl font-medium text-slate-300 sm:text-3xl">
                  Create browser-based photo grid layouts in seconds
                </span>
              </h1>
              <p className="text-sm text-slate-300 sm:text-base">
                Arrange photo grids in seconds. Upload your shots, adjust the
                layout, and export high-resolution images without leaving the
                browser.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-300 sm:text-base">
              Build responsive photo grids directly in your browser with live
              previews and instant exports.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
