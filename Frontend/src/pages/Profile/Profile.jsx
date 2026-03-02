import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle, FaTrash, FaTimes, FaCloudUploadAlt, FaPen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null); 
  const [myPosts, setMyPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // --- PROFIL SZERKESZTÉS ÁLLAPOTOK ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- POSZT SZERKESZTÉS ÁLLAPOTOK ---
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostDescription, setEditPostDescription] = useState('');
  const [isPostUpdating, setIsPostUpdating] = useState(false);

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

  // --- PROFIL SZERKESZTÉSE ---
  const openEditModal = () => {
    setEditFullName(user.full_name || '');
    setEditBio(user.bio || '');
    setEditLocation(user.location || '');
    setEditAvatarFile(null);
    setEditAvatarPreview(user.avatar_url || null);
    setIsEditModalOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('full_name', editFullName);
    formData.append('bio', editBio);
    formData.append('location', editLocation);
    if (editAvatarFile) formData.append('avatar', editAvatarFile);

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
        toast.success("Profil sikeresen frissítve! 👤");
        setIsEditModalOpen(false); 
      } else {
        toast.error("Hiba történt a frissítéskor.");
      }
    } catch (error) {
      toast.error("Szerver hiba.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- POSZT SZERKESZTÉSE ---
  const openEditPostModal = (post) => {
    setCurrentEditPost(post);
    setEditPostTitle(post.title);
    setEditPostDescription(post.description || '');
    setIsEditPostModalOpen(true);
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    setIsPostUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${currentEditPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: editPostTitle, description: editPostDescription })
      });

      if (response.ok) {
        toast.success("Poszt sikeresen frissítve! ✏️");
        setMyPosts(myPosts.map(p => p.id === currentEditPost.id ? { ...p, title: editPostTitle, description: editPostDescription } : p));
        setIsEditPostModalOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Hiba a frissítéskor.");
      }
    } catch (error) {
      toast.error("Szerver hiba.");
    } finally {
      setIsPostUpdating(false);
    }
  };

  // --- EGYÉB ---
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
      if (response.ok) {
        setMyPosts(myPosts.filter(post => post.id !== postId));
        toast.success("Poszt törölve! 🗑️");
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  if (!user) return <div className="loading-spinner">Profil betöltése...</div>;

  return (
    <div className="profile-container">
      
      {/* --- PROFIL KÁRTYA --- */}
      <div className="profile-card">
        <div className="cover-photo">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Kijelentkezés
          </button>
        </div>
        
        <div className="profile-content">
          <div className="avatar-wrapper">
            {user.avatar_url && user.avatar_url.includes('http') ? (
              <img src={user.avatar_url} alt="Avatar" className="avatar" />
            ) : (
              <div className="avatar avatar-placeholder"><FaUserCircle /></div>
            )}
          </div>
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.full_name || user.username}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>

          <p className="profile-bio">{user.bio || "Még nem írtál bemutatkozást."}</p>
          
          <div className="profile-info-row">
            <span><FaMapMarkerAlt /> {user.location || "Ismeretlen hely"}</span>
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

      {/* --- FÜLEK --- */}
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}><FaCamera /> Saját képek</button>
        <button className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}><FaHeart /> Kedvelések</button>
      </div>

      {/* --- GALÉRIA RÁCS --- */}
      <div className="profile-gallery-grid">
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} className="profile-gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <div className="post-actions-wrapper">
                    <button onClick={() => openEditPostModal(post)} className="action-btn edit-btn" title="Szerkesztés"><FaPen /></button>
                    <button onClick={() => handleDeletePost(post.id)} className="action-btn delete-btn" title="Törlés"><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))
          ) : ( <div className="empty-state">Még nem töltöttél fel képet.</div> )
        )}

        {activeTab === 'likes' && (
          likedPosts.length > 0 ? (
            likedPosts.map(post => (
              <div key={post.id} className="profile-gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <span className="img-user">@{post.username}</span>
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
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Profil Szerkesztése</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="close-modal-btn"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="edit-modal-form">
              <div className="form-group">
                <label>Teljes Név</label>
                <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Pl: Kovács Anna" className="modern-input" />
              </div>

              <div className="form-group">
                <label>Rövid Bemutatkozás (Bio)</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Írj magadról pár sort..." rows="3" className="modern-input"></textarea>
              </div>

              <div className="form-group">
                <label>Helyszín</label>
                <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Pl: Budapest, Magyarország" className="modern-input" />
              </div>

              <div className="form-group">
                <label>Új Profilkép</label>
                <div className="avatar-upload-row">
                  <div className="avatar-preview-box">
                    {editAvatarPreview ? <img src={editAvatarPreview} alt="Preview" /> : <FaUserCircle className="avatar-placeholder-icon" />}
                  </div>
                  <label className="avatar-upload-label">
                    <FaCloudUploadAlt /> Kép kiválasztása
                    <input type="file" accept="image/*" style={{display: 'none'}} onChange={e => {
                      const file = e.target.files[0];
                      setEditAvatarFile(file);
                      if(file) setEditAvatarPreview(URL.createObjectURL(file));
                    }} />
                  </label>
                </div>
              </div>

              <div className="edit-modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-cancel">Mégse</button>
                <button type="submit" disabled={isUpdating} className="btn-save">{isUpdating ? 'Mentés...' : 'Mentés'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🔥 POSZT SZERKESZTÉSE MODAL 🔥            */}
      {/* ========================================= */}
      {isEditPostModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsEditPostModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Poszt Szerkesztése</h2>
              <button type="button" onClick={() => setIsEditPostModalOpen(false)} className="close-modal-btn"><FaTimes /></button>
            </div>
            
            <form onSubmit={handlePostUpdate} className="edit-modal-form">
              <div className="form-group">
                <label>Alkotás címe *</label>
                <input type="text" value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} required className="modern-input" />
              </div>

              <div className="form-group">
                <label>Leírás</label>
                <textarea value={editPostDescription} onChange={e => setEditPostDescription(e.target.value)} rows="4" className="modern-input"></textarea>
              </div>

              <div className="edit-modal-actions">
                <button type="button" onClick={() => setIsEditPostModalOpen(false)} className="btn-cancel">Mégse</button>
                <button type="submit" disabled={isPostUpdating || !editPostTitle} className="btn-save">{isPostUpdating ? 'Mentés...' : 'Mentés'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;