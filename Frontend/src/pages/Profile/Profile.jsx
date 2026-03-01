import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle, FaTrash, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null); 
  const [myPosts, setMyPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // --- SZERKESZTÉS ÁLLAPOTOK ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null); // ÚJ: Előnézet a Modalba
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    fetch('http://localhost:3000/api/my-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMyPosts(data); })
      .catch(err => console.error(err));

    fetch('http://localhost:3000/api/my-liked-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLikedPosts(data); })
      .catch(err => console.error(err));

    fetch(`http://localhost:3000/api/users/${parsedUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setFollowersCount(data.user.followers_count);
          setFollowingCount(data.user.following_count);
        }
      })
      .catch(err => console.error(err));
  }, [navigate]);

  // Modal megnyitása és adatok betöltése
  const openEditModal = () => {
    setEditFullName(user.full_name || '');
    setEditBio(user.bio || '');
    setEditLocation(user.location || '');
    setEditAvatarFile(null);
    setEditAvatarPreview(user.avatar_url || null); // Előző kép betöltése
    setIsEditModalOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('full_name', editFullName);
    formData.append('bio', editBio);
    formData.append('location', editLocation);
    if (editAvatarFile) {
      formData.append('avatar', editAvatarFile);
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user); 
        
        const oldStorage = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...oldStorage, avatar_url: data.user.avatar_url }));
        
        setIsEditModalOpen(false); 
      } else {
        alert("Hiba történt a frissítéskor.");
      }
    } catch (error) {
      console.error(error);
      alert("Szerver hiba.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a képet? Ezt nem lehet visszavonni!")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setMyPosts(myPosts.filter(post => post.id !== postId));
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

          <p className="profile-bio">{user.bio || "Még nem írtál bemutatkozást."}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            <span><FaMapMarkerAlt /> {user.location || "Ismeretlen hely"}</span>
            <span>{user.email}</span>
          </div>

          <button onClick={openEditModal} className="edit-profile-btn">
            <FaUserEdit /> Profil szerkesztése
          </button>

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

      {/* ========================================= */}
      {/* 🔥 PROFIL SZERKESZTÉSE MODAL 🔥          */}
      {/* ========================================= */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }}>
            <div className="edit-modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Profil Szerkesztése</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="close-modal-btn" style={{ color: 'white' }}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="edit-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Teljes Név</label>
                <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Pl: Kovács Anna" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Rövid Bemutatkozás (Bio)</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Írj magadról pár sort..." rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Helyszín</label>
                <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Pl: Budapest, Magyarország" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'white' }} />
              </div>

              {/* Ugyanaz a gyönyörű Profilkép Feltöltő */}
              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Új Profilkép (Opcionális)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FaUserCircle style={{ fontSize: '30px', color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <label style={{ color: '#00d2ff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <FaCloudUploadAlt /> Kép kiválasztása
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      style={{ display: 'none' }} 
                      onChange={e => {
                        const file = e.target.files[0];
                        setEditAvatarFile(file);
                        if(file) setEditAvatarPreview(URL.createObjectURL(file));
                      }} 
                    />
                  </label>
                </div>
              </div>

              <div className="edit-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Mégse</button>
                <button type="submit" disabled={isUpdating} style={{ backgroundColor: '#00d2ff', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: isUpdating ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                  {isUpdating ? 'Mentés...' : 'Mentés'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;