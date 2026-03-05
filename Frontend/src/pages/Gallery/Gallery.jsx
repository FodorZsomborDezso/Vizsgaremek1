import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 🔥 useNavigate behozva
import { FaHeart, FaDownload, FaShareAlt, FaSearch, FaFilter, FaSortAmountDown, FaTimes, FaPaperPlane, FaUserCircle, FaFlag, FaCloudUploadAlt, FaBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- SZŰRŐ ÁLLAPOTOK ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // --- LIGHTBOX, LÁJK ÉS KOMMENT ÁLLAPOTOK ---
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [myLikedPosts, setMyLikedPosts] = useState([]); // SAJÁT LÁJKOK

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [myCollections, setMyCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');

  // AZ ÚJ KATEGÓRIÁK LISTÁJA (a szűrő menühöz)
  const categories = [
    'Természet', 'Város / Építészet', 'Portré', 'Makró Fotózás', 'Éjszakai Fotózás',
    'Általános Digitális Art', '3D Render', 'Illusztráció', 'Koncepciórajz', 'AI Művészet',
    'Festmény', 'Rajz / Grafika', 'Szobrászat',
    'Általános Design', 'Web / UI Design', 'Logó / Arculat', 'Tipográfia', 'Tech'
  ];

  // 1. SAJÁT LÁJKOK LETÖLTÉSE (Első betöltéskor)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/my-likes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyLikedPosts(data);
      })
      .catch(err => console.error(err));
    }
  }, []);

  // 2. POSZTOK LETÖLTÉSE (Lapozás és szűrők)
  const fetchPosts = async (pageNumber, reset = false) => {
    setLoading(true);
    try {
      // 🔥 A search végpont módosítva, hogy a címkékben (tags) is keressen!
      const res = await fetch(`http://localhost:3000/api/gallery?page=${pageNumber}&limit=12&search=${searchTerm}&category=${selectedCategory}&sort=${sortBy}`);
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => reset ? data : [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error("Hiba:", error);
      toast.error("Hiba a képek betöltésekor!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [searchTerm, selectedCategory, sortBy]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  // --- LÁJKOLÁS FÜGGVÉNY (Egyaránt működik a hover gombról és a kártyáról) ---
  const handleLike = async (e, postId) => {
    e.stopPropagation(); // Ez megakadályozza, hogy a Lightbox is megnyíljon
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

        setPosts(posts.map(post => 
          post.id === postId ? { ...post, like_count: data.liked ? post.like_count + 1 : post.like_count - 1 } : post
        ));
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // --- MENTÉS (GYŰJTEMÉNYEK) LOGIKA ---
  const openSaveModal = async (e, post) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A mentéshez be kell jelentkezned!");

    setPostToSave(post);
    setShowSaveModal(true);

    try {
      const res = await fetch('http://localhost:3000/api/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMyCollections(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:3000/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCollectionName })
      });
      if (res.ok) {
        const newCol = await res.json();
        setMyCollections([newCol, ...myCollections]); // Bekerül a lista tetejére
        setNewCollectionName('');
        toast.success("Új mappa létrehozva!");
      }
    } catch (err) { toast.error("Hiba történt."); }
  };

  const saveToCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${collectionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postId: postToSave.id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Kép elmentve a mappába! 📌`);
        setShowSaveModal(false);
      } else {
        toast.error(data.error || "Hiba a mentéskor.");
      }
    } catch (err) { toast.error("Hiba a mentéskor."); }
  };

  // --- JELENTÉS BEKÜLDÉSE ---
  const handleReport = async (type, id) => {
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A jelentéshez be kell jelentkezned!");

    const reason = window.prompt("Kérlek indokold meg a jelentést (pl. spam, sértő tartalom):");
    if (!reason || reason.trim() === '') return;

    try {
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ target_type: type, target_id: id, reason })
      });
      if (response.ok) toast.success("Köszönjük! A jelentést továbbítottuk az adminisztrátoroknak.");
    } catch (error) { console.error(error); }
  };

  // --- KÉP KEZELÉSE ---
  const handleDownload = async (e, postId, title) => {
    e.stopPropagation(); 
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/image`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'alkotas'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Kép letöltve! 💾");
    } catch (error) {
      toast.error("Hiba a letöltés során.");
    }
  };

  const handleShare = (e, image_url) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image_url);
    toast.info("Kép linkje másolva a vágólapra! 📋");
  };

  // --- CÍMKE (HASHTAG) KATTINTÁS ---
  const handleTagClick = (tag) => {
    setSearchTerm(tag); // Beállítja a keresőbe a címkét
    closeLightbox(); // Bezárja a Lightboxot
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Felgörget a tetejére
  };

  // --- LIGHTBOX ÉS KOMMENTEK ---
  const openLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeLightbox = () => {
    setSelectedPost(null);
    setComments([]);
    setNewComment('');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return toast.warning("A kommenteléshez be kell jelentkezned!");

    setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        setNewComment('');
        const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
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
    <div className="gallery-page-layout">
      
      {/* BAL OLDALI SÁV (SIDEBAR) */}
      <aside className="gallery-sidebar">
        <div className="sidebar-sticky-content">
          <h2 className="sidebar-title"><FaFilter /> Szűrők</h2>

          <div className="filter-group">
            <label>Keresés</label>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Cím vagy #címke..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="filter-group">
            <label><FaSortAmountDown /> Rendezés</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="styled-select">
              <option value="latest">Legújabbak elöl</option>
              <option value="popular">Legnépszerűbbek (Lájkok)</option>
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

      {/* JOBB OLDALI TARTALOM (GALÉRIA RÁCS) */}
      <main className="gallery-main">
        <div className="gallery-header-row">
          <h1 className="gallery-title" style={{ marginBottom: 0 }}>Felfedezés</h1>
          
          <Link to="/upload" className="upload-action-btn">
            <FaCloudUploadAlt style={{ marginRight: '8px', fontSize: '1.2rem' }} /> 
            Új kép feltöltése
          </Link>
        </div>

        <div className="masonry-grid">
          {posts.map(post => {
            const isLiked = myLikedPosts.includes(post.id);

            return (
              <div key={post.id} className="gallery-card" onClick={() => openLightbox(post)}>
                <div className="card-image-wrapper">
                  <span className="card-badge">{post.category_name}</span>
                  <img src={post.image_url} alt={post.title} loading="lazy" />
                  
                  {/* 🔥 ÚJ: A két gombot egy közös dobozba zártuk a jobb felső sarokban! */}
                  <div className="quick-actions-container">
                    <button 
                      className="quick-save-btn"
                      onClick={(e) => openSaveModal(e, post)}
                      title="Mentés gyűjteménybe"
                    >
                      <FaBookmark />
                    </button>
                    
                    <button 
                      className={`quick-like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => handleLike(e, post.id)}
                      title={isLiked ? "Nincs már a kedvencek közt" : "Kedvelés"}
                    >
                      <FaHeart />
                    </button>
                  </div>
                </div>

                

                <div className="card-content">
                  <h3 className="card-title" title={post.title}>{post.title}</h3>
                  
                  <p className="card-author">
                    Készítette: <Link to={`/user/${post.username}`} onClick={e => e.stopPropagation()} style={{color: 'inherit', textDecoration: 'underline'}}>@{post.username}</Link>
                  </p>
                  
                  <div className="card-footer">
                    <span 
                      className="card-likes" 
                      onClick={(e) => handleLike(e, post.id)} 
                      style={{ cursor: 'pointer', color: isLiked ? '#ff4757' : 'var(--text-secondary)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <FaHeart /> {post.like_count}
                    </span>
                    
                    <div className="card-actions">
                      <button onClick={(e) => handleShare(e, post.image_url)} title="Link másolása"><FaShareAlt /></button>
                      <button onClick={(e) => handleDownload(e, post.id, post.title)} title="Letöltés"><FaDownload /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading && <div className="loading-spinner">Betöltés...</div>}
        {!loading && posts.length === 0 && <div className="empty-state">Nincs a szűrőknek megfelelő kép. 😢</div>}
        {!loading && hasMore && posts.length > 0 && (
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-btn">Mutass többet</button>
          </div>
        )}
        {!hasMore && posts.length > 0 && <div className="end-message">Elértél a galéria végére! 🏁</div>}
      </main>

      {/* ========================================= */}
      {/* 🔥 MENTÉS / GYŰJTEMÉNY MODAL 🔥           */}
      {/* ========================================= */}
      {showSaveModal && postToSave && (
        <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal-content" onClick={e => e.stopPropagation()}>
            <div className="save-modal-header">
              <h3>Mentés ide:</h3>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}><FaTimes /></button>
            </div>
            
            <div className="save-modal-body">
              <img src={postToSave.image_url} alt="Kép" className="save-preview-img" />
              
              <div className="collections-list">
                {myCollections.length === 0 ? (
                  <p className="no-collections">Még nincs egyetlen mappád sem.</p>
                ) : (
                  myCollections.map(col => (
                    <button key={col.id} className="collection-item-btn" onClick={() => saveToCollection(col.id)}>
                      <FaBookmark style={{ color: '#00d2ff', marginRight: '10px' }} />
                      {col.name}
                    </button>
                  ))
                )}
              </div>

              <form className="create-collection-form" onSubmit={handleCreateCollection}>
                <input 
                  type="text" 
                  placeholder="Új mappa neve..." 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button type="submit" disabled={!newCollectionName.trim()}>Létrehozás</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OSZTOTT KÉPERNYŐS LIGHTBOX (MODAL) */}
      {selectedPost && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeLightbox}><FaTimes /></button>
            
            <div className="lightbox-left">
              <img src={selectedPost.image_url} alt={selectedPost.title} />
            </div>

            <div className="lightbox-right">
              
              <div className="lightbox-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <Link to={`/user/${selectedPost.username}`} onClick={closeLightbox} className="lightbox-author" style={{ textDecoration: 'none', margin: 0 }}>
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
                  
                  <button onClick={() => handleReport('post', selectedPost.id)} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'}}>
                    <FaFlag style={{marginRight: '5px'}}/> Jelentés
                  </button>
                </div>
                
                <h2 className="lightbox-title">{selectedPost.title}</h2>
                {selectedPost.description && <p className="lightbox-description">{selectedPost.description}</p>}

                {/* 🔥 ÚJ: CÍMKÉK (HASHTAGEK) MEGJELENÍTÉSE */}
                {selectedPost.tags && (
                  <div className="lightbox-tags">
                    {selectedPost.tags.split(',').map(tag => (
                      <span key={tag} className="lightbox-tag" onClick={() => handleTagClick(tag)}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              <div className="lightbox-comments">
                {comments.length === 0 ? (
                  <div className="no-comments">Legyél te az első, aki hozzászól! ✨</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <Link to={`/user/${comment.username}`} onClick={closeLightbox} className="comment-user" style={{ textDecoration: 'none', margin: 0 }}>
                          @{comment.username}
                        </Link>
                        <button onClick={() => handleReport('comment', comment.id)} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem'}}>
                          Jelentés
                        </button>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-time">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="lightbox-footer">
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <input 
                    type="text" 
                    placeholder="Írj egy kommentet..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" disabled={!newComment.trim() || isCommentLoading}>
                    <FaPaperPlane />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;