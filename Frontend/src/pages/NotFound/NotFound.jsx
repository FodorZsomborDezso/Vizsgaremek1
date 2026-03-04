import { Link } from 'react-router-dom';
import { FaCompass, FaHome } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon-wrapper">
          <FaCompass className="notfound-icon" />
        </div>
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Hoppá! Eltévedtél a galériában?</h2>
        <p className="notfound-text">
          Úgy tűnik, ez az oldal jelenleg egy üres vászon. A keresett tartalom nem létezik, esetleg megváltozott a címe, vagy már törölték.
        </p>
        <Link to="/" className="notfound-btn">
          <FaHome style={{ marginRight: '10px' }} /> Vissza a biztonságba
        </Link>
      </div>
    </div>
  );
};

export default NotFound;