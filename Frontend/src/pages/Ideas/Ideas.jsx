import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaLightbulb, FaUserCircle, FaPlus, FaTimes, FaHeart, FaPaperPlane, FaFlag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Ideas.css'; 

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest'); 

  // --- SAJÁT LÁJKOK ---
  const [myLikedPosts, setMyLikedPosts] = useState([]);

  // --- ÖTLET MODAL ÁLLAPOTAI ---
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [implementations, setImplementations] = useState([]);
  const [isImplLoading, setIsImplLoading] = useState(false);

  // --- ÚJ ÖTLET LÉTREHOZÁSA (MODAL) ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category_id: '1' });

  // --- KÉP LIGHTBOX (NAGYÍTÁS ÉS KOMMENTEK) ---
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newPostComment, setNewPostComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const categories = ['Természet', 'Város', 'Tech', 'Digitális Art', 'Design'];
  // Adatbázisban a kategóriák id-jai (feltételezve, hogy sorban vannak)
  const categoryMap = { 'Természet': 1, 'Város': 2, 'Tech': 3, 'Digitális Art': 4, 'Design': 5 };

  const navigate = useNavigate();

  // ALAPADATOK LETÖLTÉSE (Ötletek + Lájkok)
  useEffect(() => {
    fetch('http://localhost:3000/api/ideas')
      .then(res => res.json())
      .then(data => { setIdeas(data); setLoading(false); })
      .catch(err => { console.error(err); toast.error("Hiba az ötletek betöltésekor!"); setLoading(false); });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/my-likes', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setMyLikedPosts(data); })
        .catch(err => console.error(err));
    }
  }, []);

  const filteredIdeas = ideas
    .filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || idea.category_name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // --- 1. ÖTLET LÉTREHOZÁSA ---
  const handleCreateIdeaSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return toast.info("Az ötleteléshez be kell jelentkezned!");

    try {
      const res = await fetch('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newIdea)
      });
      if (res.ok) {
        toast.success("Ötlet sikeresen közzétéve!");
        setIsCreateModalOpen(false);
        setNewIdea({ title: '', description: '', category_id: '1' });
        // Frissítjük a listát
        const refresh = await fetch('http://localhost:3000/api/ideas');
        setIdeas(await refresh.json());
      } else {
        toast.error("Hiba az ötlet létrehozásakor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    }
  };

  // --- 2. ÖTLET MEGNYITÁSA (Megvalósítások letöltése) ---
  const openIdeaModal = async (idea) => {
    setSelectedIdea(idea);
    setIsImplLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/ideas/${idea.id}/implementations`);
      const data = await res.json();
      setImplementations(data);
    } catch (err) {
      toast.error("Hiba a megvalósítások betöltésekor.");
    } finally {
      setIsImplLoading(false);
    }
  };

  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setImplementations([]);
  };

  // --- 3. LÁJKOLÁS (A megvalósítások rácsában) ---
  const handleLike = async (e, postId) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    if (!token) return toast.info("Kérlek, jelentkezz be a kedveléshez!");

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        if (data.liked) setMyLikedPosts([...myLikedPosts, postId]);
        else setMyLikedPosts(myLikedPosts.filter(id => id !== postId));

        // Frissítjük az épp nyitva lévő megvalósítások számát is!
        setImplementations(implementations.map(impl => 
          impl.id === postId ? { ...impl, like_count: data.liked ? impl.like_count + 1 : impl.like_count - 1 } : impl
        ));
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // --- 4. KÉP LIGHTBOX (Nagyítás és kommentelés) ---
  const openPostLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      setPostComments(await res.json());
    } catch (err) { console.error(err); }
  };

  const closePostLightbox = () => {
    setSelectedPost(null);
    setPostComments([]);
    setNewPostComment('');
  };

  const handlePostCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newPostComment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return toast.warning("A kommenteléshez be kell jelentkezned!");

    setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newPostComment })
      });

      if (res.ok) {
        setNewPostComment('');
        const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`);
        setPostComments(await commentsRes.json());
      } else {
        toast.error("Hiba a komment elküldésekor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setIsCommentLoading(false);
    }
  };

  return (
    <div className="ideas-page-layout">
      
      {/* BAL OLDALI SÁV (SIDEBAR) */}
      <aside className="ideas-sidebar">
        <div className="sidebar-sticky-content">
          <h2 className="sidebar-title"><FaFilter /> Szűrők</h2>
          <div className="filter-group">
            <label>Keresés</label>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Ötlet vagy leírás..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <label><FaSortAmountDown /> Rendezés</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="styled-select">
              <option value="latest">Legújabbak elöl</option>
              <option value="oldest">Legrégebbiek elöl</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Kategóriák</label>
            <div className="category-list">
              <button className={`category-list-item ${selectedCategory === '' ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>Minden kategória</button>
              {categories.map(cat => (
                <button key={cat} className={`category-list-item ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* JOBB OLDALI TARTALOM (ÖTLETEK) */}
      <main className="ideas-main">
        <div className="ideas-header-row">
          <h1 className="ideas-title">Ötletbörze <FaLightbulb style={{ color: '#f1c40f' }}/></h1>
          {/* Új ötlet gomb - Most felugró ablakot nyit! */}
          <button onClick={() => setIsCreateModalOpen(true)} className="new-idea-btn" style={{border: 'none', cursor: 'pointer'}}>
            <FaPlus style={{ marginRight: '8px' }} /> Új Ötlet
          </button>
        </div>

        {loading ? <div className="loading-spinner">Ötletek betöltése...</div> : filteredIdeas.length === 0 ? (
          <div className="empty-state">Nincs a szűrőknek megfelelő ötlet. 💡</div>
        ) : (
          <div className="ideas-grid">
            {filteredIdeas.map(idea => (
              <div key={idea.id} className="idea-card" onClick={() => openIdeaModal(idea)}>
                <div className="idea-card-header">
                  <span className="idea-badge">{idea.category_name}</span>
                  <span className="idea-date">{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                <div className="idea-card-body">
                  <h3 className="idea-card-title">{idea.title}</h3>
                  <p className="idea-card-desc">{idea.description}</p>
                </div>
                <div className="idea-card-footer">
                  <Link to={`/user/${idea.username}`} className="idea-author" onClick={e => e.stopPropagation()}>
                    {idea.avatar_url && idea.avatar_url.includes('http') ? <img src={idea.avatar_url} alt="avatar" className="author-avatar" /> : <FaUserCircle className="author-placeholder" />}
                    <span>@{idea.username}</span>
                  </Link>
                  <button className="implement-btn" onClick={(e) => { e.stopPropagation(); navigate(`/upload?idea_id=${idea.id}`); }}>
                    Megvalósítom!
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================= */}
      {/* 🔥 ÚJ ÖTLET LÉTREHOZÁSA (MODAL) 🔥        */}
      {/* ========================================= */}
      {isCreateModalOpen && (
        <div className="lightbox-overlay" onClick={() => setIsCreateModalOpen(false)} style={{ zIndex: 4000 }}>
          <div className="create-idea-modal" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setIsCreateModalOpen(false)}><FaTimes /></button>
            <h2>Oszd meg az ötleted! 💡</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Inspirálj másokat egy jó koncepcióval, és nézd meg, hogyan valósítják meg!</p>
            
            <form onSubmit={handleCreateIdeaSubmit} className="create-idea-form">
              <label>Kategória</label>
              <select value={newIdea.category_id} onChange={(e) => setNewIdea({...newIdea, category_id: e.target.value})}>
                {categories.map(cat => (
                  <option key={cat} value={categoryMap[cat]}>{cat}</option>
                ))}
              </select>

              <label>Ötlet címe</label>
              <input type="text" placeholder="Pl. Cyberpunk esős utca..." required value={newIdea.title} onChange={(e) => setNewIdea({...newIdea, title: e.target.value})} />

              <label>Leírás és részletek</label>
              <textarea placeholder="Írd le részletesen, milyen hangulatot, színeket, formákat képzelsz el..." required rows="5" value={newIdea.description} onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}></textarea>

              <button type="submit" className="new-idea-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>Közzététel</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🔥 ÖTLET RÉSZLETEI ÉS MEGVALÓSÍTÁSOK 🔥   */}
      {/* ========================================= */}
      {selectedIdea && !selectedPost && (
        <div className="lightbox-overlay" onClick={closeIdeaModal}>
          <div className="idea-modal-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeIdeaModal}><FaTimes /></button>
            
            <div className="idea-modal-header-section">
              <span className="idea-badge">{selectedIdea.category_name}</span>
              <h2>{selectedIdea.title}</h2>
              <p>{selectedIdea.description}</p>
              <div className="idea-modal-author">
                Ötletgazda: <strong>@{selectedIdea.username}</strong>
              </div>
            </div>

            <div className="implementations-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Közösségi megvalósítások ({implementations.length})</h3>
                <button className="implement-btn" onClick={() => navigate(`/upload?idea_id=${selectedIdea.id}`)}>
                  Én is megvalósítom!
                </button>
              </div>

              {isImplLoading ? (
                <div className="loading-spinner">Képek betöltése...</div>
              ) : implementations.length === 0 ? (
                <div className="empty-state">Még senki sem valósította meg ezt az ötletet. Légy te az első! 🎨</div>
              ) : (
                <div className="impl-grid">
                  {implementations.map(impl => {
                    const isLiked = myLikedPosts.includes(impl.id);
                    return (
                      // KATTINTÁSRA MEGNYÍLIK A GALÉRIA-STÍLUSÚ LIGHTBOX
                      <div key={impl.id} className="impl-card" onClick={() => openPostLightbox(impl)} style={{ cursor: 'pointer' }}>
                        <div className="impl-image-wrapper">
                          <img src={impl.image_url} alt={impl.title} />
                        </div>
                        <div className="impl-info">
                          <span className="impl-author">@{impl.username}</span>
                          <span 
                            className="impl-likes" 
                            onClick={(e) => handleLike(e, impl.id)}
                            style={{ cursor: 'pointer', color: isLiked ? '#ff4757' : 'var(--text-secondary)', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <FaHeart /> {impl.like_count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🔥 KÉP LIGHTBOX (Ugyanolyan mint a Galéria) */}
      {/* ========================================= */}
      {selectedPost && (
        <div className="lightbox-overlay" onClick={closePostLightbox} style={{ zIndex: 5000 }}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closePostLightbox}><FaTimes /></button>
            
            <div className="lightbox-left">
              <img src={selectedPost.image_url} alt={selectedPost.title} />
            </div>

            <div className="lightbox-right">
              <div className="lightbox-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <Link to={`/user/${selectedPost.username}`} onClick={closePostLightbox} className="lightbox-author" style={{ textDecoration: 'none', margin: 0 }}>
                    {selectedPost.avatar_url && selectedPost.avatar_url.includes('http') ? (
                      <img src={selectedPost.avatar_url} alt="avatar" className="author-avatar" />
                    ) : (
                      <FaUserCircle className="author-placeholder" />
                    )}
                    <div>
                      <span className="author-name">@{selectedPost.username}</span>
                      <span className="post-date">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </div>
                <h2 className="lightbox-title">{selectedPost.title}</h2>
                {selectedPost.description && <p className="lightbox-description">{selectedPost.description}</p>}
              </div>

              <div className="lightbox-comments">
                {postComments.length === 0 ? (
                  <div className="no-comments">Legyél te az első, aki hozzászól! ✨</div>
                ) : (
                  postComments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-user">@{comment.username}</div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-time">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="lightbox-footer">
                <form onSubmit={handlePostCommentSubmit} className="comment-form">
                  <input type="text" placeholder="Írj egy kommentet..." value={newPostComment} onChange={(e) => setNewPostComment(e.target.value)} />
                  <button type="submit" disabled={!newPostComment.trim() || isCommentLoading}><FaPaperPlane /></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ideas;