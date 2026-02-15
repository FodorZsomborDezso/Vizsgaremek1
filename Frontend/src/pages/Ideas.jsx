import { useState } from 'react';
import { FaLightbulb, FaPenFancy, FaCommentDots, FaPalette } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Ideas.css';

const Ideas = () => {
  // DUMMY ADATOK: Ötletek, amiket felhasználók írtak ki
  const [ideas, setIdeas] = useState([
    {
      id: 1,
      user: "SciFiFan_99",
      avatar: "https://ui-avatars.com/api/?name=SciFi&background=random",
      title: "Futurisztikus Budapest könyvborító",
      description: "Egy sci-fi regényt írok, ami 2080-ban játszódik Budapesten. Szükségem lenne egy borítótervre, amin a Lánchíd neon fényekben úszik, és repülő autók vannak felette.",
      category: "Digitális Art",
      responses: 3,
      date: "2 órája"
    },
    {
      id: 2,
      user: "CoffeeLover",
      avatar: "https://ui-avatars.com/api/?name=Coffee&background=random",
      title: "Logó egy új kávézónak",
      description: "Nyitok egy kis kézműves kávézót 'Reggeli Harmat' néven. Szeretnék egy minimalista, vonalas logót, amiben van egy kávéscsésze és egy levél.",
      category: "Grafika",
      responses: 12,
      date: "1 napja"
    },
    {
      id: 3,
      user: "GamerBoy",
      avatar: "https://ui-avatars.com/api/?name=Gamer&background=random",
      title: "Karakterterv RPG játékhoz",
      description: "Keresek valakit, aki le tud rajzolni egy középkori harcost, akinek az egyik karja robotikus. Sötét, komor hangulatot képzelek el.",
      category: "Karakter Design",
      responses: 0,
      date: "3 napja"
    }
  ]);

  return (
    <div className="ideas-container">
      
      {/* FEJLÉC */}
      <div className="ideas-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <FaLightbulb style={{ color: '#ffcc00', marginRight: '10px' }} />
          Ötletbörze
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '10px auto' }}>
          Van egy jó ötleted, de nem tudod megrajzolni? Vagy inspirációt keresel? 
          Oszd meg az elképzelésedet, és a közösség alkotói megvalósítják!
        </p>
        <button className="new-idea-btn">
          <FaPenFancy style={{ marginRight: '8px' }} /> Új Ötlet Közzététele
        </button>
      </div>

      {/* ÖTLETEK LISTÁJA */}
      <div className="ideas-list">
        {ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            
            <div className="idea-header">
              <div className="idea-user">
                <img src={idea.avatar} alt="Avatar" className="user-avatar-small" />
                <span>@{idea.user}</span>
              </div>
              <span className="idea-category">{idea.category}</span>
            </div>

            <div className="idea-content">
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
            </div>

            <div className="idea-footer">
              <span>{idea.date} • {idea.responses} válasz</span>
              
              {/* Ez a gomb vinné a felhasználót a feltöltéshez, hivatkozva erre az ötletre */}
              <Link to="/upload" style={{ textDecoration: 'none' }}>
                <button className="action-btn">
                  <FaPalette style={{ marginRight: '5px' }} /> Megvalósítom
                </button>
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Ideas;