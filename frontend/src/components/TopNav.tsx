import { NavLink, useLocation } from 'react-router-dom';
import { trackNavigationClick } from '../services/statsig';

const links = [
  { to: '/', label: 'Home' },
  { to: '/collection', label: 'Collection' },
];

export function TopNav() {
  const location = useLocation();

  const handleNavClick = (to: string, label: string) => {
    const currentPage = location.pathname === '/' ? 'landing' : location.pathname.slice(1);
    const targetPage = to === '/' ? 'landing' : to.slice(1);
    trackNavigationClick(currentPage, targetPage);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <button
          type="button"
          className="flex flex-col justify-between gap-1 text-white/70 hover:text-white focus:outline-none border border-white p-2 bg-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] transition-all"
          aria-label="Open menu"
        >
          <span className="h-[2px] w-6 bg-current" />
          <span className="h-[2px] w-6 bg-current" />
          <span className="h-[2px] w-6 bg-current" />
        </button>

        <NavLink to="/" className="text-[40px] leading-none tracking-[0.08em] text-white">
          collectify
        </NavLink>

        <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.35em] text-white/60 sm:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => handleNavClick(link.to, link.label)}
              className={({ isActive }) => 
                `px-3 py-2 border border-white bg-black font-light transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <span className="sm:hidden text-[11px] uppercase tracking-[0.35em] text-white/60 font-light">Explore</span>
      </div>
    </header>
  );
}
