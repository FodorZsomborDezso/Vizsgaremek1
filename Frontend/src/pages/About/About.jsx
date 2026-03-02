import React from 'react';
import { FaRocket, FaHeart, FaPaintBrush, FaCode } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Fejléc */}
      <div className="about-hero">
        <h1>Rólunk <span>& A Projektről</span></h1>
        <p>Egy hely, ahol a kreativitás és a közösség találkozik.</p>
      </div>

      {/* Misszió szekció */}
      <div className="about-mission">
        <div className="mission-card">
          <FaPaintBrush className="mission-icon" />
          <h3>Inspiráció</h3>
          <p>Célunk, hogy a művészek, designerek és kreatív elmék egy helyen találják meg a következő nagy ötletüket, és osszák meg vizuális elképzeléseiket a világgal.</p>
        </div>
        <div className="mission-card">
          <FaRocket className="mission-icon" />
          <h3>Megvalósítás</h3>
          <p>Nem csak egy galéria vagyunk! Az "Ötletbörze" segítségével a gondolatokból valóság lesz. Alkosd meg, amit mások elképzeltek, vagy inspirálj másokat!</p>
        </div>
        <div className="mission-card">
          <FaHeart className="mission-icon" />
          <h3>Közösség</h3>
          <p>Hisszük, hogy a legjobb dolgok közösen születnek. Építs kapcsolatokat, értékelj, kommentelj és támogasd a hozzád hasonló alkotókat!</p>
        </div>
      </div>

      {/* A Fejlesztő szekció */}
      <div className="about-developer">
        <h2>A Fejlesztőről <FaCode style={{ color: '#00d2ff' }} /></h2>
        <div className="dev-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=00d2ff&color=fff&size=150" alt="Fejlesztő" className="dev-avatar" />
          <div className="dev-info">
            <h3>Üdv, a nevem [Ide írd a neved] 👋</h3>
            <p>
              Ez a projekt a vizsgaremekemként / portfóliómként készült. Célom az volt, hogy egy teljes értékű, modern, Pinterest-jellegű közösségi platformot építsek fel az alapoktól a backendig.
            </p>
            <p>
              Technológiák: <strong>React, Node.js, Express, MySQL, JWT, CSS Flexbox & Grid.</strong>
            </p>
          </div>
        </div>
        <br hei></br>
        <h2>A Fejlesztőről <FaCode style={{ color: '#00d2ff' }} /></h2>
        <div className="dev-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=00d2ff&color=fff&size=150" alt="Fejlesztő" className="dev-avatar" />
          <div className="dev-info">
            <h3>Üdv, a nevem [Ide írd a neved] 👋</h3>
            <p>
              Ez a projekt a vizsgaremekemként / portfóliómként készült. Célom az volt, hogy egy teljes értékű, modern, Pinterest-jellegű közösségi platformot építsek fel az alapoktól a backendig.
            </p>
            <p>
              Technológiák: <strong>React, Node.js, Express, MySQL, JWT, CSS Flexbox & Grid.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;