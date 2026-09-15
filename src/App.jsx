import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './App.css';
import { plotLabels, plotConfig } from './Plots/plots.config';
import { staticGalleryConfig } from './StaticGallery/staticGallery.config';
import Lightbox from './StaticGallery/Lightbox';

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

function PlotNavigation({ currentPlotNumber }) {
  const navigate = useNavigate();
  const visiblePlots = plots.filter(p => !p.config?.hidden);
  const currentIndex = visiblePlots.findIndex(p => p.name === `Plot${currentPlotNumber}`);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < visiblePlots.length - 1;

  const handlePrev = () => {
    if (hasPrev) navigate(visiblePlots[currentIndex - 1].path);
  };

  const handleNext = () => {
    if (hasNext) navigate(visiblePlots[currentIndex + 1].path);
  };

  return (
    <div className="plot-navigation">
      <button
        className="plot-nav-button plot-nav-prev"
        onClick={handlePrev}
        disabled={!hasPrev}
        aria-label="Previous plot"
      >
        ❮
      </button>
      <span className="plot-nav-counter">{currentIndex + 1} / {visiblePlots.length}</span>
      <button
        className="plot-nav-button plot-nav-next"
        onClick={handleNext}
        disabled={!hasNext}
        aria-label="Next plot"
      >
        ❯
      </button>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const visiblePlots = plots.filter(p => !p.config?.hidden);

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
          <a href="https://johnny.kinglau.info/" className="site-title" target="_blank" rel="noopener noreferrer">
            <span className="site-title-name">JOHNNY KING </span>LAU
            <img className="king-character" src="/king_character.png" alt="King" />
          </a>

          <div className="nav-right">
            <Link to="/" className="nav-gallery">Back to GALLERY</Link>

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
                <li className="hamburger-gallery">
                  <button onClick={() => { navigate('/'); setOpen(false); }}>
                    GALLERY
                  </button>
                </li>
                <li className="hamburger-divider" />
                {visiblePlots.map(p => (
                  <li key={p.path}>
                    <button onClick={() => { navigate(p.path); setOpen(false); }}>
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [lightboxItem, setLightboxItem] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const handleOpenLightbox = (item) => {
    setLightboxItem(item);
    setLightboxIndex(staticGalleryConfig.findIndex(i => i.id === item.id));
  };

  const handleLightboxNext = () => {
    const nextIndex = (lightboxIndex + 1) % staticGalleryConfig.length;
    setLightboxIndex(nextIndex);
    setLightboxItem(staticGalleryConfig[nextIndex]);
  };

  const handleLightboxPrev = () => {
    const prevIndex = (lightboxIndex - 1 + staticGalleryConfig.length) % staticGalleryConfig.length;
    setLightboxIndex(prevIndex);
    setLightboxItem(staticGalleryConfig[prevIndex]);
  };

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
                  <h1 style={{marginTop: "5px", marginBottom: "5px"}}>GALLERY</h1>
                  <h2 style={{marginTop: "5px", marginBottom: "5px"}}><img src="/D3.svg" alt="D3" style={{height: "35px", width: "35px", verticalAlign: "middle", marginLeft: "8px"}} /> web charts</h2>
                  <hr style={{border: 'none', borderTop: '1px solid #333', margin: '23px 0', width: '100%'}} />
                </div>

                <div className="project-grid">
                  {plots.filter(p => !p.config?.hidden).map(p => {
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

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <h2 style={{marginTop: "5px", marginBottom: "5px"}}>Static Infographics</h2>
                  <hr style={{border: 'none', borderTop: '1px solid #333', margin: '23px 0', width: '100%'}} />
                </div>

                <div className="project-grid">
                  {staticGalleryConfig.map(item => (
                    <div key={item.id} className="project-card">
                      <button
                        type="button"
                        className="project-image-wrapper project-image-button"
                        onClick={() => handleOpenLightbox(item)}
                        aria-label={`View larger image: ${item.label}`}
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.label}
                          className="project-image project-image--contain"
                          style={{ backgroundColor: item.bgColor }}
                        />
                      </button>
                      <div className="project-content">
                        <h3 className="project-name">{item.label}</h3>
                        {item.description && <p className="project-description">{item.description}</p>}
                        {item.tags?.length > 0 && (
                          <div className="project-tags">
                            {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                          </div>
                        )}
                        <button
                          type="button"
                          className="project-link project-link-button"
                          onClick={() => handleOpenLightbox(item)}
                        >
                          View Image →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {lightboxItem && (
                  <Lightbox
                    src={lightboxItem.full}
                    alt={lightboxItem.label}
                    onClose={() => setLightboxItem(null)}
                    onNext={handleLightboxNext}
                    onPrev={handleLightboxPrev}
                    currentIndex={lightboxIndex}
                    total={staticGalleryConfig.length}
                  />
                )}
              </div>
            } />
            {plots.map(({ path, name, Component }) => {
              const plotNumber = name.replace('Plot', '');
              return (
                <Route key={path} path={path} element={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', position: 'relative' }}>
                    <Component />
                    <PlotNavigation currentPlotNumber={plotNumber} />
                  </div>
                } />
              );
            })}
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