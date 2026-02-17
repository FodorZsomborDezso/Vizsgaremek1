import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Itt tároljuk a belépett user adatait
  const [activeTab, setActiveTab] = useState('posts');

  // Amikor betölt az oldal, megnézzük, be van-e lépve valaki
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      // Ha nincs adat, irány a bejelentkezés!
      navigate('/login');
    } else {
      // Ha van, elmentjük az állapotba
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // KIJELENTKEZÉS FÜGGVÉNY
  const handleLogout = () => {
    localStorage.removeItem('token'); // Töröljük a kulcsot
    localStorage.removeItem('user');  // Töröljük az adatokat
    window.location.href = '/login';  // Újratöltjük az oldalt és átirányítunk
  };

  // Ha még tölti az adatokat, ne mutassunk semmit (vagy töltés ikont)
  if (!user) return null;

  // DUMMY ADATOK A STATISZTIKÁHOZ (Mert ezeket még nem számolja a backend)
  const stats = {
    postsCount: 0, // Később ezt is lekérhetjük
    followers: 0,
    following: 0
  };

  return (
    <div className="profile-container">
      
      {/* 1. PROFIL KÁRTYA */}
      <div className="profile-card">
        <div className="cover-photo">
          {/* Kijelentkezés gomb a jobb felső sarokban */}
          <button 
            onClick={handleLogout} 
            style={{
              position: 'absolute', top: '20px', right: '20px',
              backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
              border: 'none', padding: '8px 15px', borderRadius: '20px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            <FaSignOutAlt /> Kijelentkezés
          </button>
        </div>
        
        <div className="profile-content">
          {/* Avatar: Ha van URL, azt mutatja, ha nincs, akkor egy ikont */}
          {user.avatar_url && user.avatar_url.includes('http') ? (
            <img src={user.avatar_url} alt="Avatar" className="avatar" />
          ) : (
            <div className="avatar" style={{display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', color:'var(--text-secondary)'}}>
              <FaUserCircle />
            </div>
          )}
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.full_name || user.username}</h1>
            <p className="profile-username">
              @{user.username} 
              {/* Ha ADMIN, mutassuk a jelvényt */}
              {user.role === 'admin' && (
                <span style={{ 
                    backgroundColor: '#ff0055', color: 'white', padding: '2px 8px', 
                    borderRadius: '10px', fontSize: '0.7rem', marginLeft: '10px', verticalAlign: 'middle' 
                }}>ADMIN</span>
              )}
            </p>
          </div>

          <p className="profile-bio">{user.bio || "Még nincs bemutatkozás."}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {user.location || "Ismeretlen hely"}</span>
            <span style={{color: 'var(--text-secondary)'}}>{user.email}</span>
          </div>

          <button className="edit-profile-btn">
            <FaUserEdit /> Profil szerkesztése
          </button>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.postsCount}</span>
              <span className="stat-label">Poszt</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.followers}</span>
              <span className="stat-label">Követő</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.following}</span>
              <span className="stat-label">Követés</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABOK */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FaCamera /> Saját képek
        </button>
        <button 
          className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          <FaHeart /> Kedvelések
        </button>
      </div>

      {/* 3. GALÉRIA HELYE (Most még üres üzenet) */}
      <div className="gallery-grid">
        <div className="empty-state">
          Ide kerülnek majd a feltöltött képeid. <br/>
          (Jelenleg fejlesztés alatt...)
        </div>
      </div>

    </div>
  );
};

export default Profile;