import { useState, useEffect } from 'react';
import { FaHeart, FaDownload, FaShareAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Gallery.css';

const Gallery = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- ÚJ: KERESÉS ÉS SZŰRÉS ÁLLAPOTOK ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const categories = ['Természet', 'Város', 'Tech', 'Digitális Art', 'Design'];

  // Képek lekérése a szerverről
  const fetchPosts = async (pageNumber, reset = false) => {
    setLoading(true);
    try {
      // ÚJ: Hozzáadjuk a linkhez a keresőszót és a kategóriát is
      const res = await fetch(`http://localhost:3000/api/gallery?page=${pageNumber}&limit=9&search=${searchTerm}&category=${selectedCategory}`);
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        // Ha resetelünk (pl. új keresés indult), akkor felülírjuk a tömböt, amúgy hozzáfűzzük
        setPosts(prevPosts => reset ? data : [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error("Hiba:", error);
      toast.error("Hiba a képek betöltésekor!");
    } finally {
      setLoading(false);
    }
  };

  // ÚJ: Ha változik a keresőszó vagy a kategória, töröljük a listát, és kérjük a legelsőt!
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true); // A 'true' jelenti a resetet
  }, [searchTerm, selectedCategory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleDownload = async (postId, title) => {
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

  const handleShare = (image_url) => {
    navigator.clipboard.writeText(image_url);
    toast.info("Kép linkje másolva a vágólapra! 📋");
  };

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Felfedezés</h1>

      {/* --- ÚJ: KERESŐSÁV ÉS KATEGÓRIÁK --- */}
      <div className="gallery-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Keresés cím alapján..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-pills">
          <button 
            className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Összes
          </button>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MASONRY (Pinterest) RÁCS */}
      <div className="masonry-grid">
        {posts.map(post => (
          <div key={post.id} className="masonry-item">
            <img src={post.image_url} alt={post.title} loading="lazy" />
            
            <div className="masonry-overlay">
              <div className="overlay-top">
                <span className="category-badge">{post.category_name}</span>
                <div className="action-buttons">
                  <button onClick={() => handleShare(post.image_url)} title="Link másolása"><FaShareAlt /></button>
                  <button onClick={() => handleDownload(post.id, post.title)} title="Letöltés"><FaDownload /></button>
                </div>
              </div>
              
              <div className="overlay-bottom">
                <h3>{post.title}</h3>
                <div className="author-info">
                  <span className="author-name">@{post.username}</span>
                  <span className="like-count"><FaHeart /> {post.like_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="loading-spinner">Betöltés...</div>}
      
      {!loading && posts.length === 0 && (
        <div className="empty-state">Nem található a keresésnek megfelelő kép. 😢</div>
      )}
      
      {!loading && hasMore && posts.length > 0 && (
        <div className="load-more-container">
          <button onClick={loadMore} className="load-more-btn">Mutass többet</button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="end-message">Elértél a galéria végére! 🏁</div>
      )}
    </div>
  );
};

export default Gallery;