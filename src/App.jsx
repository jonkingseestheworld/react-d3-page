import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './App.css';
import Plot1 from './Plots/Plot1';
import Plot2 from './Plots/Plot2';
import Plot3 from './Plots/Plot3';
import Plot4 from './Plots/Plot4';
import Plot0 from './Plots/Plot0';

const plots = [
  { label: 'Plot 0', path: '/plot0' },
  { label: 'Plot 1', path: '/plot1' },
  { label: 'Plot 2', path: '/plot2' },
  { label: 'Plot 3', path: '/plot3' },
  { label: 'Plot 4', path: '/plot4' },
];

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
              <div>
                <h1>Welcome to the D3 Viz</h1>
                <ul className="home-nav-list">
                  <li><Link to="/plot1">Plot 1</Link></li>
                  <li><Link to="/plot2">Plot 2</Link></li>
                  <li><Link to="/plot3">Plot 3</Link></li>
                  <li><Link to="/plot4">Plot 4</Link></li>
                  <li><Link to="/plot0">Plot 0</Link></li>
                </ul>
              </div>
            } />
            {/* Define routes for the plots */}
            <Route path="/plot1" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Plot1 /></div>} />
            <Route path="/plot2" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Plot2 /></div>} />
            <Route path="/plot3" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Plot3 /></div>} />
            <Route path="/plot4" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Plot4 /></div>} />
            <Route path="/plot0" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Plot0 /></div>} />
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