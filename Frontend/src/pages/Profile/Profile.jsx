import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle, FaTrash } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null); 
  const [myPosts, setMyPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 
  
  // ÚJ: Állapotok a követők számának
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 1. Saját posztok
    fetch('http://localhost:3000/api/my-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMyPosts(data); })
      .catch(err => console.error(err));

    // 2. Kedvelt posztok
    fetch('http://localhost:3000/api/my-liked-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLikedPosts(data); })
      .catch(err => console.error(err));

    // 3. ÚJ: Saját statisztikák (követők) lekérése a publikus végpontunkról!
    fetch(`http://localhost:3000/api/users/${parsedUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFollowersCount(data.user.followers_count);
          setFollowingCount(data.user.following_count);
        }
      })
      .catch(err => console.error(err));

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a képet? Ezt nem lehet visszavonni!")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyPosts(myPosts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || "Hiba a törléskor.");
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Betöltés...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="cover-photo">
          <button onClick={handleLogout} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaSignOutAlt /> Kijelentkezés
          </button>
        </div>
        
        <div className="profile-content">
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
            <span><FaMapMarkerAlt /> {user.location || "Ismeretlen hely"}</span>
            <span>{user.email}</span>
          </div>

          <button className="edit-profile-btn"><FaUserEdit /> Profil szerkesztése</button>

          {/* 🔥 STATISZTIKÁK (MÁR ÉLŐ ADATOKKAL) 🔥 */}
          <div className="profile-stats">
            <div className="stat-item"><span className="stat-value">{myPosts.length}</span><span className="stat-label">Poszt</span></div>
            <div className="stat-item"><span className="stat-value">{followersCount}</span><span className="stat-label">Követő</span></div>
            <div className="stat-item"><span className="stat-value">{followingCount}</span><span className="stat-label">Követett</span></div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}><FaCamera /> Saját képek</button>
        <button className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}><FaHeart /> Kedvelések</button>
      </div>

      <div className="gallery-grid">
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <button onClick={() => handleDeletePost(post.id)} className="delete-post-btn" title="Kép törlése"><FaTrash /></button>
                </div>
              </div>
            ))
          ) : ( <div className="empty-state">Még nem töltöttél fel képet.</div> )
        )}

        {activeTab === 'likes' && (
          likedPosts.length > 0 ? (
            likedPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <span className="img-user" style={{fontSize: '0.8rem', marginTop: '5px'}}>Készítette: @{post.username}</span>
                </div>
              </div>
            ))
          ) : ( <div className="empty-state">Még nem kedveltél egyetlen alkotást sem.</div> )
        )}
      </div>
    </div>
  );
};

export default Profile;