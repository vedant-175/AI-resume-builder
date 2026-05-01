import { NavLink, Outlet } from 'react-router-dom'

const linkBase =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'

const linkActive = 'bg-slate-100 text-slate-900'

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded-md bg-white px-3 py-2 shadow ring-1 ring-slate-200"
        href="#main"
      >
        Skip to content
      </a>

      <header
        data-app-header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white">
              <span className="text-sm font-semibold">AI</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                AI Resume Builder
              </div>
              <div className="text-xs text-slate-600">
                ATS-friendly drafts + domain-constrained AI
              </div>
            </div>
          </div>

          <nav aria-label="Primary" className="flex items-center gap-1">
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Start
            </NavLink>
            <NavLink
              to="/builder"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Builder
            </NavLink>
            <NavLink
              to="/preview"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Preview / PDF
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
