import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUserPlus, FaUserCheck, FaEnvelope, FaUserCircle, FaHeart, FaTimes, FaPaperPlane, FaLock, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './PublicProfile.css';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // KÖVETÉS ÉS BARÁTSÁG ÁLLAPOTOK
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingMe, setIsFollowingMe] = useState(false); // ÚJ: Ő követ-e engem?
  const [followersCount, setFollowersCount] = useState(0);

  // Üzenetküldés (Modal) állapotok
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Kép nagyítása (Lightbox)
  const [selectedPost, setSelectedPost] = useState(null);

  const loggedInUserStr = localStorage.getItem('user');
  const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;

  // 🔥 A varázslat: Akkor vagytok ismerősök, ha mindkettő igaz!
  const isFriend = isFollowing && isFollowingMe;

  useEffect(() => {
    if (loggedInUser && loggedInUser.username === username) {
      navigate('/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!res.ok) {
          toast.error("Felhasználó nem található!");
          navigate('/');
          return;
        }
        const data = await res.json();
        setProfileUser(data.user);
        setPosts(data.posts);
        setFollowersCount(data.user.followers_count);

        const token = localStorage.getItem('token');
        if (token && data.user) {
          const followRes = await fetch(`http://localhost:3000/api/users/${data.user.id}/is-following`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (followRes.ok) {
            const followData = await followRes.json();
            setIsFollowing(followData.isFollowing);
            setIsFollowingMe(followData.isFollowingMe); // ÚJ
          }
        }
      } catch (err) {
        console.error("Hiba a profil betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate, loggedInUser]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A követéshez be kell jelentkezned!");

    try {
      const res = await fetch(`http://localhost:3000/api/users/${profileUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.followed);
        setFollowersCount(prev => data.followed ? prev + 1 : prev - 1);
        
        if (data.followed && isFollowingMe) {
          toast.success(`Szuper! Mostantól ismerősök vagytok @${profileUser.username}-val! 🤝`);
        } else {
          toast.success(data.followed ? `Követed őt: @${profileUser.username}!` : "Követés leállítva.");
        }
      }
    } catch (err) {
      toast.error("Szerver hiba a követésnél.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return toast.info("Üzenetküldéshez be kell jelentkezned!");

    setIsSending(true);
    try {
      const res = await fetch(`http://localhost:3000/api/messages/${profileUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: messageContent })
      });

      if (res.ok) {
        toast.success("Üzenet sikeresen elküldve! ✉️");
        setIsMessageModalOpen(false);
        setMessageContent('');
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Hiba az üzenet küldésekor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="loading-spinner">Profil betöltése...</div>;
  if (!profileUser) return <div className="empty-state">Felhasználó nem található.</div>;

  return (
    <div className="public-profile-container">
      
      <div className="public-profile-card">
        <div className="public-cover-photo"></div>
        
        <div className="public-profile-content">
          <div className="public-avatar-wrapper">
            {profileUser.avatar_url && profileUser.avatar_url.includes('http') ? (
              <img src={profileUser.avatar_url} alt="Avatar" className="public-avatar" />
            ) : (
              <div className="public-avatar avatar-placeholder"><FaUserCircle /></div>
            )}
          </div>
          
          <div className="public-name-section">
            <h1 className="public-name">{profileUser.full_name || profileUser.username}</h1>
            <p className="public-username">@{profileUser.username}</p>
            
            {/* Visszajelzés, ha ő is követ engem */}
            {isFollowingMe && !isFollowing && (
              <div className="follows-you-badge">Visszaigazolásra vár (Követ téged)</div>
            )}
            {isFriend && (
              <div className="friends-badge"><FaUserFriends /> Ismerősök vagytok</div>
            )}
          </div>

          <p className="public-bio">{profileUser.bio || "Ez a felhasználó még nem írt magáról."}</p>
          
          <div className="public-info-row">
            <span><FaMapMarkerAlt /> {profileUser.location || "Ismeretlen hely"}</span>
          </div>

          <div className="public-action-buttons">
            <button onClick={handleFollowToggle} className={`follow-btn ${isFollowing ? 'following' : ''}`}>
              {isFollowing ? <><FaUserCheck /> Követed</> : <><FaUserPlus /> Követés</>}
            </button>
            
            {/* 🔥 ÚJ: ZÁROLT / NYITOTT ÜZENET GOMB 🔥 */}
            {isFriend ? (
            // Most már egyenesen a Chat oldalra visz!
              <button onClick={() => navigate(`/chat/${profileUser.id}/${profileUser.username}`)} className="message-btn">
                <FaEnvelope /> Üzenet
              </button>
            ) : (
              <button className="message-btn locked" title="Csak ismerősöknek küldhetsz üzenetet!" disabled>
                <FaLock /> Üzenet
              </button>
            )}
          </div>

          <div className="public-stats">
            <div className="stat-item"><span className="stat-value">{posts.length}</span><span className="stat-label">Poszt</span></div>
            <div className="stat-item"><span className="stat-value">{followersCount}</span><span className="stat-label">Követő</span></div>
            <div className="stat-item"><span className="stat-value">{profileUser.following_count}</span><span className="stat-label">Követett</span></div>
          </div>
        </div>
      </div>

      {/* Galéria Rács (Változatlan) */}
      <h3 className="public-gallery-title">@{profileUser.username} alkotásai</h3>
      <div className="public-gallery-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="public-gallery-item" onClick={() => setSelectedPost(post)}>
              <img src={post.image_url} alt={post.title} loading="lazy" />
              <div className="overlay">
                <span className="img-title">{post.title}</span>
                <span className="img-likes"><FaHeart style={{color: '#ff4757', marginRight: '5px'}}/> {post.like_count || 0}</span>
              </div>
            </div>
          ))
        ) : ( <div className="empty-state">Még nem töltött fel képet.</div> )}
      </div>

      {/* Modalok (Változatlanok) ... */}
      {isMessageModalOpen && (
        <div className="public-modal-overlay" onClick={() => setIsMessageModalOpen(false)}>
          <div className="public-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Üzenet küldése</h2>
              <button onClick={() => setIsMessageModalOpen(false)} className="close-btn"><FaTimes /></button>
            </div>
            <div style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Címzett: <strong style={{color: 'var(--text-primary)'}}>@{profileUser.username}</strong>
            </div>
            <form onSubmit={handleSendMessage}>
              <textarea rows="5" placeholder="Írd meg az üzeneted..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} required className="modern-textarea"></textarea>
              <button type="submit" disabled={isSending || !messageContent.trim()} className="send-message-submit-btn">
                {isSending ? 'Küldés...' : <><FaPaperPlane style={{marginRight: '8px'}}/> Küldés</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="public-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="lightbox-image-only-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn absolute-close" onClick={() => setSelectedPost(null)}><FaTimes /></button>
            <img src={selectedPost.image_url} alt={selectedPost.title} className="lightbox-large-img" />
            <div className="lightbox-image-info">
              <h2>{selectedPost.title}</h2>
              {selectedPost.description && <p>{selectedPost.description}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicProfile;