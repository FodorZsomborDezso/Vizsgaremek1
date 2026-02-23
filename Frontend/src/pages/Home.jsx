import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaPaintBrush } from 'react-icons/fa';
import './Home.css'; // Használjuk a meglévő stílusodat

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Legújabb posztok lekérése betöltéskor
  useEffect(() => {
    fetch('http://localhost:3000/api/latest-posts')
      .then(res => res.json())
      .then(data => {
        setLatestPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba a kiemelt képek betöltésekor:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      
      {/* HERO SZEKCIÓ (Ez a nagy üdvözlő rész felül) */}
      <section className="hero-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
          Üdvözöl az <span style={{ color: 'var(--accent-color)' }}>ArtisticEye</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 30px' }}>
          A hely, ahol az ötletek vizuális formát öltenek. Oszd meg az elképzeléseid, vagy valósítsd meg mások álmát!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/gallery" className="auth-btn" style={{ textDecoration: 'none', padding: '12px 25px' }}>
            Felfedezés <FaArrowRight />
          </Link>
          <Link to="/ideas" className="auth-btn" style={{ textDecoration: 'none', padding: '12px 25px', backgroundColor: 'transparent', border: '2px solid var(--accent-color)', color: 'var(--text-primary)' }}>
            Ötletbörze
          </Link>
        </div>
      </section>

      {/* DINAMIKUS KIEMELT ALKOTÁSOK SZEKCIÓ */}
      <section className="featured-section" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-primary)' }}>
          <FaPaintBrush style={{ marginRight: '10px', color: 'var(--accent-color)' }} /> 
          Legújabb Alkotások
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Képek betöltése...</p>
        ) : (
          <div className="gallery-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="gallery-item">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <div className="overlay">
                  <span className="img-title">{post.title}</span>
                  <span className="img-user">@{post.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;