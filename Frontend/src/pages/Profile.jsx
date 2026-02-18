import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // A belépett user adatai
  const [myPosts, setMyPosts] = useState([]); // A user saját posztjai (Backendről)
  const [activeTab, setActiveTab] = useState('posts'); // Melyik fül aktív?

  // 1. BEJELENTKEZÉS ELLENŐRZÉSE ÉS POSZTOK LEKÉRÉSE
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Ha nincs bejelentkezve, irány a Login oldal
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    // Ha be van lépve, elmentjük a usert
    setUser(JSON.parse(storedUser));

    // LEKÉRJÜK A SAJÁT POSZTOKAT A BACKENDRŐL
    fetch('http://localhost:3000/api/my-posts', {
      headers: {
        'Authorization': `Bearer ${token}` // FONTOS: Küldjük a tokent!
      }
    })
    .then(res => res.json())
    .then(data => {
      // Ha tömböt kaptunk, beállítjuk (ha hiba van, üres marad)
      if (Array.isArray(data)) {
        setMyPosts(data);
      }
    })
    .catch(err => console.error("Hiba a posztok lekérésekor:", err));

  }, [navigate]);

  // 2. KIJELENTKEZÉS FÜGGVÉNY
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Teljes újratöltés a tisztább állapotért
  };

  // Amíg töltünk, ne mutassunk hibás UI-t
  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Betöltés...</div>;

  // Statisztika számítása a valós adatokból
  const stats = {
    postsCount: myPosts.length, // Valós posztok száma
    followers: 0, // Ez még dummy
    following: 0  // Ez még dummy
  };

  return (
    <div className="profile-container">
      
      {/* 1. PROFIL KÁRTYA */}
      <div className="profile-card">
        <div className="cover-photo">
          {/* Kijelentkezés gomb */}
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
          {/* Avatar kezelés: Ha van URL, azt mutatjuk, ha nincs, ikont */}
          {user.avatar_url && user.avatar_url.includes('http') ? (
            <img src={user.avatar_url} alt="Avatar" className="avatar" />
          ) : (
            <div className="avatar" style={{display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', color:'var(--text-secondary)', background: 'var(--bg-secondary)'}}>
              <FaUserCircle />
            </div>
          )}
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.full_name || user.username}</h1>
            <p className="profile-username">
              @{user.username} 
              {user.role === 'admin' && (
                <span style={{ backgroundColor: '#ff0055', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: '10px', verticalAlign: 'middle' }}>ADMIN</span>
              )}
            </p>
          </div>

          <p className="profile-bio">{user.bio || "Üdvözöllek a profilomon!"}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {user.location || "Magyarország"}</span>
            <span>{user.email}</span>
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

      {/* 2. TABOK (Fülek) */}
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

      {/* 3. GALÉRIA RÁCS */}
      <div className="gallery-grid">
        {activeTab === 'posts' ? (
          // SAJÁT POSZTOK LISTÁZÁSA
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Még nem töltöttél fel képet.</div>
          )
        ) : (
          // KEDVELÉSEK (Ez még statikus/fejlesztés alatt)
          <div className="empty-state">A kedvelések funkció hamarosan érkezik!</div>
        )}
      </div>

    </div>
  );
};

export default Profile;