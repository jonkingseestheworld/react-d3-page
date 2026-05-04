import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './App.css';
import { plotLabels, plotConfig } from './Plots/plots.config';

// Auto-discover all Plot*.jsx files in ./Plots — no manual imports needed
const plotModules = import.meta.glob('./Plots/Plot*.jsx', { eager: true });

const plots = Object.entries(plotModules)
  .map(([filePath, mod]) => {
    const name = filePath.replace('./Plots/', '').replace('.jsx', ''); // e.g. "Plot1"
    const number = name.replace('Plot', '');                           // e.g. "1"
    return {
      name,
      label: plotLabels[name] ?? `P${number}`,
      config: plotConfig[name] ?? null,
      path: `/plot${number}`,
      Component: mod.default,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

function RedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && redirect !== '/') {
      const path = redirect.startsWith('/') ? redirect : '/' + redirect;
      navigate(path, { replace: true });
    }
  }, [navigate]);
  return null;
}

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
      <RedirectHandler />
      <div className="sticky-top">
        <Header />
      </div>
      <div className="page-body">
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                {/* Put a D3.svg image here */}
                {/* <img src="/D3.svg" alt="D3.js Logo" style={{ width: '100px', height: '100px' }} />. */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {/* Replace D3 text below with the D3.js Logo image */}
                  <h1 style={{fontSize: "35px", marginTop: "5px", marginBottom: "5px"}}>Working With <img src="/D3.svg" alt="D3" style={{height: "35px", width: "35px", verticalAlign: "middle", marginLeft: "8px"}} /></h1>
                  <h2 style={{fontSize: "25px", marginTop: "5px", marginBottom: "5px"}}>Data Viz Gallery</h2>
                  <hr style={{border: 'none', borderTop: '1px solid #333', margin: '23px 0', width: '100%'}} />
                </div>

                <div className="project-grid">
                  {plots.map(p => {
                    const cfg = p.config;
                    return (
                      <div key={p.path} className="project-card">
                        <Link to={p.path} className="project-image-wrapper">
                          {cfg?.thumbnail
                            ? <img src={cfg.thumbnail} alt={p.label} className="project-image" />
                            : <div className="project-image-placeholder" />}
                        </Link>
                        <div className="project-content">
                          <h3 className="project-name">{p.label}</h3>
                          {cfg?.description && <p className="project-description">{cfg.description}</p>}
                          {cfg?.tags?.length > 0 && (
                            <div className="project-tags">
                              {cfg.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                            </div>
                          )}
                          <Link to={p.path} className="project-link">View Project →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
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