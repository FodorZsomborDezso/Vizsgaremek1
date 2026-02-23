import { useState, useEffect } from 'react';
import { FaSearch, FaHeart, FaComment, FaTimes } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
  // --- ÁLLAPOTOK (STATE) ---
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mind');
  
  const [selectedImage, setSelectedImage] = useState(null); // Lightboxhoz
  const [myLikedPosts, setMyLikedPosts] = useState([]);     // Lájkokhoz
  
  const [comments, setComments] = useState([]);             // A megnyitott kép kommentjei
  const [newComment, setNewComment] = useState('');         // Új komment beviteli mező

  // 1. KÉPEK ÉS SAJÁT LÁJKOK LETÖLTÉSE (Csak egyszer, betöltéskor)
  useEffect(() => {
    // Képek letöltése
    fetch('http://localhost:3000/api/gallery')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba:", err);
        setLoading(false);
      });

    // Saját lájkok letöltése (ha be van lépve)
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/my-likes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyLikedPosts(data);
      })
      .catch(err => console.error("Hiba a lájkoknál:", err));
    }
  }, []);

  // 2. KOMMENTEK LETÖLTÉSE (Ha megnyitunk egy képet a Lightboxban)
  useEffect(() => {
    if (selectedImage) {
      fetch(`http://localhost:3000/api/posts/${selectedImage.id}/comments`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error("Hiba a kommentek lekérésekor:", err));
    } else {
      setComments([]); // Ha bezárjuk a képet, ürítjük a listát
    }
  }, [selectedImage]);

  // --- LÁJKOLÁS FÜGGVÉNY ---
  const handleLike = async (e, postId) => {
    e.stopPropagation(); // MEGGÁTOLJA, HOGY MEGNYÍLJON A KÉP!
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Kérlek, jelentkezz be a kedveléshez!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        // Frissítjük a piros szívet a képernyőn
        if (data.liked) {
          setMyLikedPosts([...myLikedPosts, postId]);
        } else {
          setMyLikedPosts(myLikedPosts.filter(id => id !== postId));
        }

        // Frissítjük a lájkok számát is
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              like_count: data.liked ? post.like_count + 1 : post.like_count - 1
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error("Hiba a kedveléskor:", error);
    }
  };

  // --- KOMMENTKÜLDÉS FÜGGVÉNY ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Kérlek, jelentkezz be a kommenteléshez!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${selectedImage.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment(''); // Beviteli mező ürítése
        
        // Kommentek újra-lekérése, hogy lássuk az újat azonnal
        const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedImage.id}/comments`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Hiba a komment beküldésekor:", error);
    }
  };

  // --- SZŰRŐ ÉS KERESŐ LOGIKA ---
  const categories = ['Mind', 'Természet', 'Város', 'Tech', 'Digitális Art', 'Design'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Mind' || post.category_name === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gallery-container">
      
      {/* KERESŐ ÉS SZŰRŐ SÁV */}
      <div className="gallery-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Keresés cím alapján..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{textAlign:'center'}}>Képek betöltése...</p>}

      {/* GALÉRIA RÁCS */}
      <div className="gallery-grid">
        {!loading && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isLiked = myLikedPosts.includes(post.id);

            return (
              <div key={post.id} className="gallery-item" onClick={() => setSelectedImage(post)}>
                <img src={post.image_url} alt={post.title} loading="lazy" />
                
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <span className="img-user">@{post.username}</span>
                  
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    {/* LÁJK GOMB */}
                    <button 
                      onClick={(e) => handleLike(e, post.id)}
                      style={{ 
                        background: 'none', border: 'none', color: isLiked ? '#ff4d4d' : 'white', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '0.9rem', transition: 'transform 0.2s', padding: 0
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <FaHeart /> {post.like_count || 0}
                    </button>
                    
                    {/* KOMMENT IKON */}
                    <span style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaComment /> Szólj hozzá!
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          !loading && <div className="no-results">Nincs találat.</div>
        )}
      </div>
      
      {/* ========================================= */}
      {/* LIGHTBOX (KÉPNÉZEGETŐ ÉS KOMMENTEK MODAL) */}
      {/* ========================================= */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close"><FaTimes /></button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Kép bal oldalon / felül */}
            <img src={selectedImage.image_url} alt={selectedImage.title} className="lightbox-img" />
            
            {/* Információk és Kommentek jobb oldalon / alul */}
            <div className="lightbox-info" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px', overflowY: 'auto' }}>
              <h2>{selectedImage.title}</h2>
              <div className="lightbox-author">
                <img src={selectedImage.avatar_url} alt="avatar" style={{width: '30px', height: '30px', borderRadius: '50%'}} />
                <span style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>@{selectedImage.username}</span>
              </div>
              <p style={{marginBottom: '20px'}}>{selectedImage.description}</p>
              
              {/* KOMMENTEK SZEKCIÓ */}
              <div className="comments-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{marginBottom: '10px'}}>Kommentek ({comments.length})</h3>
                
                {/* Kommentek listája */}
                <div className="comments-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', marginBottom: '15px', paddingRight: '5px' }}>
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <img src={comment.avatar_url} alt="avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div className="comment-content" style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '0 12px 12px 12px', width: '100%' }}>
                          <strong style={{ color: 'var(--accent-color)', fontSize: '0.85rem', display: 'block', marginBottom: '3px' }}>{comment.username}</strong>
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Légy te az első, aki hozzászól!</p>
                  )}
                </div>

                {/* Új komment űrlap */}
                <form onSubmit={handleCommentSubmit} className="comment-form" style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <input 
                    type="text" 
                    placeholder="Írd le a véleményed..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Küldés
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