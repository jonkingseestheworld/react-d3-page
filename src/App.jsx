import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './App.css';

// Auto-discover all Plot*.jsx files in ./Plots — no manual imports needed
const plotModules = import.meta.glob('./Plots/Plot*.jsx', { eager: true });

const plots = Object.entries(plotModules)
  .map(([filePath, mod]) => {
    const name = filePath.replace('./Plots/', '').replace('.jsx', ''); // e.g. "Plot1"
    const number = name.replace('Plot', '');                           // e.g. "1"
    return {
      name,
      label: `Plot ${number}`,
      path: `/plot${number}`,
      Component: mod.default,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="wrapper">
        <nav className="site-nav">
          <Link to="/" className="header-home">Home</Link>

          <div className="hamburger-menu" ref={menuRef}>
            <div
              className={`ham-menu${open ? ' active' : ''}`}
              onClick={() => setOpen(o => !o)}
              role="button"
              tabIndex={0}
              aria-label="Navigation menu"
            >
              <span /><span /><span />
            </div>

            {open && (
              <ul className="hamburger-dropdown">
                {plots.map(p => (
                  <li key={p.path}>
                    <button onClick={() => { navigate(p.path); setOpen(false); }}>
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="sticky-top">
        <Header />
      </div>
      <div className="page-body">
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                {/* Put a D3.svg image here */}
                <img src="/D3.svg" alt="D3.js Logo" style={{ width: '100px', height: '100px' }} />
                <h1 style={{fontSize: "25px"}}>Working With D3 - Data Viz Gallery</h1>
                <ul className="home-nav-list">
                  {plots.map(p => (
                    <li key={p.path}><Link to={p.path}>{p.label}</Link></li>
                  ))}
                </ul>
              </div>
            } />
            {plots.map(({ path, Component }) => (
              <Route key={path} path={path} element={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                  <Component />
                </div>
              } />
            ))}
          </Routes>
        </div>
        <footer className="site-footer">
          <p>&copy;MMXXVI&nbsp;&nbsp;&nbsp;&nbsp;By Johnny K Lau</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;