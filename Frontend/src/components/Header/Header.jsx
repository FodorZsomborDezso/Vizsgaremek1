import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSun, FaMoon, FaUpload, FaImages } from 'react-icons/fa'; // Új ikonok
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header-container">
      <div className="header-content">
        
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <FaEye className="logo-icon" />
          <span className="logo-text">Artistic<span className="logo-highlight">Eye</span></span>
        </Link>

        <div 
          className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
        </div>

        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Főoldal</Link>
            </li>
            
            {/* ÚJ: Galéria Böngészése */}
            <li className="nav-item">
              <Link to="/gallery" className="nav-link" onClick={closeMobileMenu}>
                 Galéria
              </Link>
            </li>

            {/* ÚJ: Feltöltés */}
            <li className="nav-item">
              <Link to="/upload" className="nav-link" onClick={closeMobileMenu}>
                 Feltöltés
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profilom</Link>
            </li>

            {/* Téma váltó */}
            <li className="nav-item theme-toggle-item">
              <button 
                onClick={toggleTheme} 
                className="theme-toggle-btn" 
                title="Téma váltás"
              >
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