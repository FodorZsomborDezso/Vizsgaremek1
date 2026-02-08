import { Link } from 'react-router-dom';
import { FaEye, FaGithub, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* 1. Oszlop: Brand */}
        <div className="footer-section brand-section">
          <h2 className="footer-logo">
            <FaEye style={{ marginRight: '10px' }} />
            Artistic<span className="highlight">Eye</span>
          </h2>
          <p className="footer-desc">
            Egy modern közösségi platform, ahol a kreativitás találkozik a technológiával.
            Lásd meg a szépséget a részletekben!
          </p>
        </div>

        {/* 2. Oszlop: Bővített Linkek */}
        <div className="footer-section links-section">
          <h3>Felfedezés</h3>
          <ul className="footer-links">
            <li><Link to="/">Főoldal</Link></li>
            <li><Link to="/gallery">Galéria Böngészése</Link></li>
            <li><Link to="/upload">Új kép feltöltése</Link></li>
            <li><Link to="/profile">Saját Profil</Link></li>
            <li><Link to="/login">Bejelentkezés</Link></li>
          </ul>
        </div>

        {/* 3. Oszlop: Kapcsolat */}
        <div className="footer-section contact-section">
          <h3>Fejlesztők</h3>
          <p>Készítette: Fodor Zsombor & Gerencsér Ákos</p>
          <div className="contact-info">
            <p><FaEnvelope style={{ marginRight: '5px' }} /> info@artisticeye.hu</p>
            <p><FaMapMarkerAlt style={{ marginRight: '5px' }} /> Magyarország</p>
          </div>
          
          <div className="social-links">
            <a href="https://github.com/FodorZsomborDezso" target="_blank" rel="noreferrer" className="social-icon"><FaGithub /> GitHub(Ákos)</a>
            <a href="https://github.com/akos060316" target="_blank" rel="noreferrer" className="social-icon"><FaGithub /> Github(Zsombor)</a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ArtisticEye Projekt. Minden jog fenntartva.</p>
      </div>
    </footer>
  );
};

export default Footer;