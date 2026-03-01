import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaMapMarkerAlt, FaUserCircle, FaEnvelope } from 'react-icons/fa';
import './Profile.css';

const PublicProfile = () => {
  const { username } = useParams(); 
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Csak azt nézzük meg, be van-e lépve valaki (gomb megjelenítéséhez)
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    // 1. Megnézzük, ki van belépve (Csak a useEffect-en BELÜL, így nincs végtelen ciklus!)
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Ha a saját nevedre kattintasz, vigyen a saját profilodra!
    if (currentUser && currentUser.username === username) {
      navigate('/profile');
      return;
    }

    setLoading(true);
    
    // 2. Profil adatainak betöltése
    fetch(`http://localhost:3000/api/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error("Felhasználó nem található");
        return res.json();
      })
      .then(data => {
        setProfileData(data.user);
        setPosts(data.posts);
        
        // Ha be vagyunk lépve, megnézzük, követjük-e
        const token = localStorage.getItem('token');
        if (token && currentUser) {
          fetch(`http://localhost:3000/api/users/${data.user.id}/is-following`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(followData => setIsFollowing(followData.isFollowing))
          .catch(err => console.error(err));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProfileData(null);
        setLoading(false);
      });
  }, [username, navigate]); // <--- INNEN KIVETTÜK A FOLYAMATOS FIGYELÉST!

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Be kell jelentkezned a követéshez!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/users/${profileData.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsFollowing(data.followed);
        setProfileData({
          ...profileData,
          followers_count: data.followed ? profileData.followers_count + 1 : profileData.followers_count - 1
        });
      }
    } catch (error) {
      console.error("Hiba a követésnél:", error);
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-primary)'}}>Betöltés...</div>;
  if (!profileData) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-primary)'}}><h2>Ez a felhasználó nem létezik.</h2></div>;

  return (
    <div className="profile-container">
      {/* PROFIL FEJLÉC */}
      <div className="profile-card">
        <div className="cover-photo"></div>
        <div className="profile-content">
          {profileData.avatar_url ? (
            <img src={profileData.avatar_url} alt="Avatar" className="avatar" />
          ) : (
            <div className="avatar" style={{display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
              <FaUserCircle />
            </div>
          )}
          
          <div className="profile-name-section">
            <h1 className="profile-name">{profileData.full_name || profileData.username}</h1>
            <p className="profile-username">@{profileData.username}</p>
          </div>

          <p className="profile-bio">{profileData.bio || "Még nem írt bemutatkozást."}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {profileData.location || "Ismeretlen hely"}</span>
            <span>Csatlakozott: {new Date(profileData.created_at).toLocaleDateString()}</span>
          </div>

          
          {isLoggedIn && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              <button 
                onClick={handleFollowToggle}
                style={{ backgroundColor: isFollowing ? 'var(--bg-secondary)' : 'var(--accent-color)', color: isFollowing ? 'var(--text-primary)' : 'white', border: isFollowing ? '1px solid var(--border-color)' : 'none', padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
              >
                {isFollowing ? <><FaUserCheck /> Követed</> : <><FaUserPlus /> Követés</>}
              </button>

              {/* ÚJ: ÜZENETKÜLDÉS GOMB */}
              <button 
                onClick={() => navigate(`/chat/${profileData.id}`, { state: { username: profileData.username, avatar: profileData.avatar_url } })}
                style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
              >
                <FaEnvelope /> Üzenet
              </button>
            </div>
          )}

          <div className="profile-stats">
            <div className="stat-item"><span className="stat-value">{posts.length}</span><span className="stat-label">Poszt</span></div>
            <div className="stat-item"><span className="stat-value">{profileData.followers_count || 0}</span><span className="stat-label">Követő</span></div>
            <div className="stat-item"><span className="stat-value">{profileData.following_count || 0}</span><span className="stat-label">Követett</span></div>
          </div>
        </div>
      </div>

      {/* GALÉRIA RÁCS */}
      <h3 style={{textAlign: 'center', margin: '30px 0 15px', color: 'var(--text-primary)'}}>@{profileData.username} alkotásai</h3>
      <div className="gallery-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="gallery-item">
              <img src={post.image_url} alt={post.title} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
            </div>
          ))
        ) : (
          <div className="empty-state">Még nem töltött fel képet.</div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;