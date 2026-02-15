import { useState } from 'react';
import { Link } from 'react-router-dom';
// FaHome importálása a főoldalhoz
import { FaEye, FaSun, FaMoon, FaLightbulb, FaImages, FaUpload, FaHome } from 'react-icons/fa'; 
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="header-container">
      <div className="header-content">
        
        {/* LOGÓ (Ez is a főoldalra visz) */}
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <FaEye className="logo-icon" />
          <span className="logo-text">Artistic<span className="logo-highlight">Eye</span></span>
        </Link>

        {/* HAMBURGER MENÜ (Mobil) */}
        <div className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
        </div>

        {/* NAVIGÁCIÓ */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            
            {/* 1. FŐOLDAL (ÚJ, ITT KÉRTED) */}
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                <FaHome style={{marginRight:'5px'}}/> Főoldal
              </Link>
            </li>

            {/* 2. GALÉRIA */}
            <li className="nav-item">
              <Link to="/gallery" className="nav-link" onClick={closeMobileMenu}>
                <FaImages style={{marginRight:'5px'}}/> Galéria
              </Link>
            </li>

            {/* 3. ÖTLETBÖRZE */}
            <li className="nav-item">
              <Link to="/ideas" className="nav-link" onClick={closeMobileMenu}>
                <FaLightbulb style={{marginRight:'5px'}}/> Ötletbörze
              </Link>
            </li>

            {/* 4. FELTÖLTÉS */}
            <li className="nav-item">
              <Link to="/upload" className="nav-link" onClick={closeMobileMenu}>
                <FaUpload style={{marginRight:'5px'}}/> Feltöltés
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profilom</Link>
            </li>

            {/* TÉMA VÁLTÓ */}
            <li className="nav-item theme-toggle-item">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === 'dark' ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
              </button>
            </li>

            <li className="nav-item desktop-only-separator">|</li>

            <li className="nav-item">
              <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>Belépés</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-cta-button" onClick={closeMobileMenu}>Regisztráció</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;