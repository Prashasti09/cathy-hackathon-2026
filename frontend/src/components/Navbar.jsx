// Owner: Prashasti (Prashasti09) - frontend UI
// Top menu from the mockup: Dashboard | Operations | Stock | Move History | Settings, profile on the right.
import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Menu({ label, active, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="nav-menu" ref={ref}>
      <button type="button" className={'nav-link' + (active ? ' active' : '')} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {label}
      </button>
      {open && (
        <div className="nav-dropdown">
          {items.map((it) => (
            <Link key={it.to} to={it.to}>{it.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">StockSense</Link>
      <nav className="nav-links">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <Menu
          label="Operations"
          active={pathname.startsWith('/operations')}
          items={[
            { to: '/operations/receipts', label: 'Receipts' },
            { to: '/operations/deliveries', label: 'Delivery' },
            { to: '/operations/transfers', label: 'Internal transfers' },
            { to: '/operations/adjustments', label: 'Adjustments' },
          ]}
        />
        <NavLink to="/stock" className="nav-link">Stock</NavLink>
        <NavLink to="/moves" className="nav-link">Move History</NavLink>
        <Menu
          label="Settings"
          active={pathname.startsWith('/settings')}
          items={[
            { to: '/settings/warehouses', label: 'Warehouse' },
            { to: '/settings/locations', label: 'Locations' },
          ]}
        />
      </nav>
      <Menu
        label={<span className="avatar" title={user?.loginId}>{(user?.loginId || '?')[0].toUpperCase()}</span>}
        active={pathname === '/profile'}
        items={[{ to: '/profile', label: 'My profile' }]}
      />
      <button type="button" className="btn-ghost small" onClick={() => { logout(); navigate('/login'); }}>
        Log out
      </button>
    </header>
  );
}
