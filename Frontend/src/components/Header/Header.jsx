import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEye, FaSun, FaMoon, 
  FaLightbulb, FaImages, FaUpload, 
  FaHome, FaUserCircle, FaShieldAlt // <--- 1. ÚJ IKON IMPORTÁLVA
} from 'react-icons/fa';
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Itt tároljuk, hogy be van-e lépve valaki

  // 1. Amikor betölt a Header, megnézzük a LocalStorage-ot
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="header-container">
      <div className="header-content">
        
        {/* --- LOGÓ --- */}
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <FaEye className="logo-icon" />
          <span className="logo-text">Artistic<span className="logo-highlight">Eye</span></span>
        </Link>

        {/* --- HAMBURGER MENÜ (Mobil) --- */}
        <div className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
        </div>

        {/* --- NAVIGÁCIÓ --- */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            
            {/* 1. MINDENKI LÁTJA EZEKET: */}
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                <FaHome style={{marginRight:'5px'}}/> Főoldal
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/gallery" className="nav-link" onClick={closeMobileMenu}>
                <FaImages style={{marginRight:'5px'}}/> Galéria
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/ideas" className="nav-link" onClick={closeMobileMenu}>
                <FaLightbulb style={{marginRight:'5px'}}/> Ötletbörze
              </Link>
            </li>

            {/* 2. CSAK AKKOR LÁTSZIK, HA BE VAGY LÉPVE */}
            {user && (
              <li className="nav-item">
                <Link to="/upload" className="nav-link" onClick={closeMobileMenu}>
                  <FaUpload style={{marginRight:'5px'}}/> Feltöltés
                </Link>
              </li>
            )}

            {/* ========================================= */}
            {/* 🔥 3. ADMIN MENÜ (CSAK ADMINOKNAK) 🔥   */}
            {/* ========================================= */}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className="nav-link" 
                  onClick={closeMobileMenu}
                  style={{ color: '#ffcc00', fontWeight: 'bold' }} // Kiemeljük sárgával
                >
                  <FaShieldAlt style={{marginRight:'5px'}}/> Admin
                </Link>
              </li>
            )}

            {/* 4. TÉMA VÁLTÓ (Mindenki látja) */}
            <li className="nav-item theme-toggle-item">
              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Témaváltás">
                {theme === 'dark' ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
              </button>
            </li>

            {/* ELVÁLASZTÓ VONAL */}
            <li className="nav-item desktop-only-separator">|</li>

            {/* 5. DINAMIKUS RÉSZ: LOGIN VAGY PROFIL */}
            {!user ? (
              // HA NINCS BELÉPVE:
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>Belépés</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-cta-button" onClick={closeMobileMenu}>Regisztráció</Link>
                </li>
              </>
            ) : (
              // HA BE VAN LÉPVE:
              <li className="nav-item user-profile-link">
                <Link to="/profile" className="nav-link" onClick={closeMobileMenu} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  {user.avatar_url && user.avatar_url.includes('http') ? (
                    <img src={user.avatar_url} alt="Avatar" style={{width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover'}} />
                  ) : (
                    <FaUserCircle style={{fontSize:'1.5rem'}} />
                  )}
                  <span>{user.username}</span>
                </Link>
              </li>
            )}

          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;