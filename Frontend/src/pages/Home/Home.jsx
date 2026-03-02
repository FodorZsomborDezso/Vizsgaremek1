import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaPalette, FaLightbulb, FaUsers } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // A legújabb 3 poszt lekérése a dinamikus dizájnhoz
  useEffect(() => {
    fetch('http://localhost:3000/api/latest-posts')
      .then(res => res.json())
      .then(data => {
        setLatestPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba a legújabb posztok betöltésekor:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      
      {/* ========================================= */}
      {/* HERO SZEKCIÓ (Fő banner)                    */}
      {/* ========================================= */}
      <section className="home-hero">
        <div className="hero-text-content">
          <h1 className="hero-title">Oszd meg a <span>vizuális</span> világod.</h1>
          <p className="hero-subtitle">
            Fedezz fel inspiráló alkotásokat, töltsd fel a sajátjaidat, és valósítsd meg a közösség legjobb ötleteit! Egy hely, ahol a kreativitás életre kel.
          </p>
          <div className="hero-buttons">
            <Link to="/gallery" className="btn-primary">
              Felfedezés <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/upload" className="btn-secondary">
              Új kép feltöltése
            </Link>
          </div>
        </div>

        {/* DINAMIKUS FOTÓKOLLÁZS (Az oldalra feltöltött képekből) */}
        <div className="hero-image-collage">
          {loading ? (
            <div className="collage-loading">Képek betöltése...</div>
          ) : latestPosts.length >= 3 ? (
            <>
              <div className="collage-img img-main">
                <img src={latestPosts[0].image_url} alt="Legújabb poszt 1" />
                <div className="img-credit">@{latestPosts[0].username}</div>
              </div>
              <div className="collage-img img-sub-top">
                <img src={latestPosts[1].image_url} alt="Legújabb poszt 2" />
                <div className="img-credit">@{latestPosts[1].username}</div>
              </div>
              <div className="collage-img img-sub-bottom">
                <img src={latestPosts[2].image_url} alt="Legújabb poszt 3" />
                <div className="img-credit">@{latestPosts[2].username}</div>
              </div>
            </>
          ) : (
            <div className="collage-empty">
              <h3>Üdv a platformon!</h3>
              <p>Tölts fel legalább 3 képet a Galériába, hogy itt megjelenjen a dinamikus kollázs!</p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================= */}
      {/* JELLEMZŐK SZEKCIÓ (Oldalak bemutatása)      */}
      {/* ========================================= */}
      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ color: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.1)' }}>
            <FaPalette />
          </div>
          <h3>Galéria</h3>
          <p>Böngéssz lenyűgöző képek, festmények és digitális művek között. Találd meg a stílusodhoz illő inspirációt, és mentsd el a kedvenceidet.</p>
          <Link to="/gallery" className="feature-link">Ugrás a Galériába <FaArrowRight /></Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ color: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.1)' }}>
            <FaLightbulb />
          </div>
          <h3>Ötletbörze</h3>
          <p>Van egy jó koncepciód, de nincs időd megcsinálni? Írd meg szövegesen, és nézd meg, ahogy a közösség tehetségei életre keltik!</p>
          <Link to="/ideas" className="feature-link" style={{ color: '#f1c40f' }}>Ötletek felfedezése <FaArrowRight /></Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ color: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)' }}>
            <FaUsers />
          </div>
          <h3>Közösség</h3>
          <p>Lájkold a legjobb alkotásokat, szólj hozzá a posztokhoz, kövess más alkotókat, és építsd a saját portfóliódat a platformon.</p>
          <Link to="/about" className="feature-link" style={{ color: '#2ecc71' }}>Tudj meg többet rólunk <FaArrowRight /></Link>
        </div>
      </section>

    </div>
  );
};

export default Home;