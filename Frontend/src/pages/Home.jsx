import { Link } from 'react-router-dom';
// IMPORTÁLJUK AZ IKONOKAT
import { FaCameraRetro, FaHeart, FaUserEdit, FaArrowRight } from 'react-icons/fa'; 
import './Home.css';

const Home = () => {
  // IDEIGLENES ADATOK (Dummy Data)
  const trendingImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=400&q=80', title: 'Portréfotózás', user: 'Zsombor' },
    { id: 2, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', title: 'Neon Város', user: 'Ákos' },
    { id: 3, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', title: 'Absztrakt', user: 'DesignPro' },
    { id: 4, url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=80', title: 'Természet', user: 'NatureLover' },
  ];

  return (
    <div className="home-wrapper">
      
      {/* 1. HERO SZEKCIÓ */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Oszd meg a <span className="highlight-text">világodat</span></h1>
          <p>
            A Vizsgaremek egy interaktív galéria és közösségi platform. 
            Töltsd fel alkotásaidat, inspirálódj mások munkáiból és légy része a kreatív közösségnek.
          </p>
          <div className="hero-buttons">
            <Link to="./register" className="btn btn-primary">Csatlakozom</Link>
            <Link to="./gallery" className="btn btn-outline">Galéria Böngészése</Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURE KÁRTYÁK (IKONOKKAL) */}
      <section className="features-section">
        <h2>Fedezd fel a lehetőségeket</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            {/* Emoji helyett ikon komponens */}
            <div className="icon-container">
                <FaCameraRetro className="feature-icon" />
            </div>
            <h3>Oszd meg</h3>
            <p>Töltsd fel legjobb fotóidat és illusztrációidat egyszerűen.</p>
            <Link to="/upload" className="text-link">Feltöltés indítása <FaArrowRight style={{marginLeft: '5px'}} /></Link>
          </div>

          <div className="feature-card">
            <div className="icon-container">
                <FaHeart className="feature-icon" />
            </div>
            <h3>Közösség</h3>
            <p>Lájkolj, kommentelj és kövesd a kedvenc alkotóidat.</p>
            <Link to="/community" className="text-link">Közösség megtekintése <FaArrowRight style={{marginLeft: '5px'}} /></Link>
          </div>

          <div className="feature-card">
            <div className="icon-container">
                <FaUserEdit className="feature-icon" />
            </div>
            <h3>Profilépítés</h3>
            <p>Szerkeszd profilodat és építsd fel a saját portfóliódat.</p>
            <Link to="/profile" className="text-link">Profilom kezelése <FaArrowRight style={{marginLeft: '5px'}} /></Link>
          </div>

        </div>
      </section>

      {/* 3. TRENDING GALÉRIA */}
      <section className="trending-section">
        <div className="section-header">
          <h2>Népszerű a héten</h2>
          <p>A közösség által legjobbra értékelt alkotások</p>
        </div>
        
        <div className="gallery-grid">
          {trendingImages.map((img) => (
            <div key={img.id} className="gallery-item">
              <img src={img.url} alt={img.title} />
              <div className="overlay">
                <span className="img-title">{img.title}</span>
                <span className="img-user">@{img.user}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="center-btn">
          <Link to="/gallery" className="btn btn-secondary">Összes kép megtekintése</Link>
        </div>
      </section>

    </div>
  );
};

export default Home;