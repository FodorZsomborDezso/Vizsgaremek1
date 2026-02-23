import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle, FaTrash } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  
  // --- ÁLLAPOTOK ---
  const [user, setUser] = useState(null); 
  const [myPosts, setMyPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 

  // --- 1. ADATOK BETÖLTÉSE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Ha nincs bejelentkezve, kidobjuk a login oldalra
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    // A) Saját posztok lekérése
    fetch('http://localhost:3000/api/my-posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setMyPosts(data);
    })
    .catch(err => console.error("Hiba a saját posztoknál:", err));

    // B) Kedvelt posztok lekérése
    fetch('http://localhost:3000/api/my-liked-posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setLikedPosts(data);
    })
    .catch(err => console.error("Hiba a kedveléseknél:", err));

  }, [navigate]);

  // --- 2. KIJELENTKEZÉS ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  // --- 3. KÉP TÖRLÉSE ---
  const handleDeletePost = async (postId) => {
    // Biztonsági kérdés
    if (!window.confirm("Biztosan törölni szeretnéd ezt a képet? Ezt nem lehet visszavonni!")) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Ha sikeres a törlés a szerveren, a képernyőről is eltüntetjük
        setMyPosts(myPosts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || "Hiba a törléskor.");
      }
    } catch (error) {
      console.error("Hiba a törléskor:", error);
      alert("Nem sikerült elérni a szervert.");
    }
  };

  // Ha még tölt a user adat, ne mutassunk hibás UI-t
  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Betöltés...</div>;

  // --- STATISZTIKÁK KISZÁMÍTÁSA ---
  const stats = {
    postsCount: myPosts.length,
    likesCount: likedPosts.length, 
    followers: 0 // Ez egyelőre fix marad
  };

  return (
    <div className="profile-container">
      
      {/* ========================================= */}
      {/* 1. PROFIL KÁRTYA (FEJLÉC)                 */}
      {/* ========================================= */}
      <div className="profile-card">
        <div className="cover-photo">
          {/* Kijelentkezés Gomb */}
          <button 
            onClick={handleLogout} 
            style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FaSignOutAlt /> Kijelentkezés
          </button>
        </div>
        
        <div className="profile-content">
          {/* Avatar megjelenítése */}
          {user.avatar_url && user.avatar_url.includes('http') ? (
            <img src={user.avatar_url} alt="Avatar" className="avatar" />
          ) : (
            <div className="avatar" style={{display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', color:'var(--text-secondary)', background: 'var(--bg-secondary)'}}>
              <FaUserCircle />
            </div>
          )}
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.full_name || user.username}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>

          <p className="profile-bio">{user.bio || "Üdvözöllek a profilomon!"}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {user.location || "Magyarország"}</span>
            <span>{user.email}</span>
          </div>

          <button className="edit-profile-btn"><FaUserEdit /> Profil szerkesztése</button>

          {/* Statisztika Sáv */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.postsCount}</span>
              <span className="stat-label">Poszt</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.likesCount}</span>
              <span className="stat-label">Kedvelés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.followers}</span>
              <span className="stat-label">Követő</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. TABOK (FÜLEK)                          */}
      {/* ========================================= */}
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

      {/* ========================================= */}
      {/* 3. GALÉRIA RÁCS                           */}
      {/* ========================================= */}
      <div className="gallery-grid">
        
        {/* --- A) SAJÁT KÉPEK FÜL TARTALMA --- */}
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  
                  {/* TÖRLÉS GOMB (Kuka ikon) */}
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="delete-post-btn"
                    title="Kép törlése"
                  >
                    <FaTrash />
                  </button>

                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Még nem töltöttél fel képet.</div>
          )
        )}

        {/* --- B) KEDVELÉSEK FÜL TARTALMA --- */}
        {activeTab === 'likes' && (
          likedPosts.length > 0 ? (
            likedPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  {/* Megmutatjuk, kinek a képét kedveltük */}
                  <span className="img-user" style={{fontSize: '0.8rem', marginTop: '5px'}}>
                    Készítette: @{post.username}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Még nem kedveltél egyetlen alkotást sem.</div>
          )
        )}

      </div>

    </div>
  );
};

export default Profile;