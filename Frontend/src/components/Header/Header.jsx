import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEye, FaSun, FaMoon, 
  FaLightbulb, FaImages, FaUpload, 
  FaHome, FaUserCircle, FaShieldAlt,
  FaShare,
  FaBell,
  FaInfoCircle,
  FaEnvelope
} from 'react-icons/fa';
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); 

  // --- ÉRTESÍTÉSEK ÁLLAPOTAI ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 1. Amikor betölt a Header, megnézzük a LocalStorage-ot
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkAuthStatus(); // Lefut az oldal betöltésekor

    // 🔥 A VARÁZSLAT: Figyeljük, ha bárhol az oldalon be/kijelentkezés történik!
    window.addEventListener('authChange', checkAuthStatus);

    // Takarítás, ha a komponens megszűnik
    return () => window.removeEventListener('authChange', checkAuthStatus);
  }, []);

  // 2. Értesítések lekérése, ha a felhasználó be van lépve
  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await fetch('http://localhost:3000/api/notifications', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          });
          if (res.ok) setNotifications(await res.json());
        } catch(e) {
          console.error("Hiba az értesítések lekérésekor:", e);
        }
      };
      
      fetchNotifs(); // Azonnali lekérés
      const interval = setInterval(fetchNotifs, 5000); // 5 másodpercenkénti frissítés
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Olvasatlan értesítések száma
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Harang ikonra kattintás (Megnyitja az ablakot és olvasottá teszi őket)
  const handleNotifClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    
    // Csak akkor küldünk kérést a szervernek, ha vannak olvasatlanok és épp most nyitjuk ki
    if (!isNotifOpen && unreadCount > 0) {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/notifications/read', { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      // Frissítjük a felületet is, hogy eltűnjön a piros pötty
      setNotifications(notifications.map(n => ({...n, is_read: true})));
    }
  };

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

            <li className="nav-item">
              <Link to="/about" className="nav-link" onClick={closeMobileMenu}>
                <FaInfoCircle style={{marginRight:'5px'}}/> Rólunk
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/feedback" className="nav-link" onClick={closeMobileMenu}>
                <FaShare style={{marginRight:'5px'}}/> Visszajelzés
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

            {/* 3. ADMIN MENÜ (CSAK ADMINOKNAK) */}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className="nav-link" 
                  onClick={closeMobileMenu}
                  style={{ color: '#ffcc00', fontWeight: 'bold' }}
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

            {/* 5. DINAMIKUS RÉSZ: LOGIN VAGY PROFIL + ÉRTESÍTÉSEK + ÜZENETEK */}
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
              <>
                {/* 🔥 ÚJ: ÉRTESÍTÉSEK (HARANG) 🔥 */}
                <li className="nav-item notif-container">
                  <button className="nav-link notif-btn" onClick={handleNotifClick} style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', fontSize:'1.3rem', position:'relative', color:'var(--text-primary)'}}>
                    <FaBell />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {/* Legördülő ablak */}
                  {isNotifOpen && (
                    <div className="notif-dropdown">
                      <h4>Értesítések</h4>
                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <p className="no-notifs">Nincsenek új értesítéseid.</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                              <img src={n.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="avatar" />
                              <div className="notif-text">
                                <strong>@{n.username}</strong> 
                                {n.type === 'like' && ' kedvelte a posztodat. ❤️'}
                                {n.type === 'comment' && ' kommentált a képedhez. 💬'}
                                {n.type === 'follow' && ' elkezdett követni téged. 👤'}
                                {n.type === 'message' && ' üzenetet küldött neked. ✉️'}
                                {n.type === 'implementation' && ' megvalósította az ötletedet! 💡'}
                                <span className="notif-time">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </li>

                {/* ÜZENETEK IKON */}
                <li className="nav-item">
                  <Link to="/messages" className="nav-link" onClick={closeMobileMenu} title="Üzenetek" style={{display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: '#00d2ff'}}>
                    <FaEnvelope />
                  </Link>
                </li>

                {/* PROFIL IKON */}
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
              </>
            )}

          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;