import { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation az ötlet válaszhoz
import './Upload.css';
import './Auth.css';

const Upload = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Ha az Ideas oldalról jövünk, itt lehet adat
  
  // Állapotok
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('1'); // Alapértelmezett: 1
  const [uploadType, setUploadType] = useState('gallery'); // 'gallery' vagy 'response'
  const [ideaId, setIdeaId] = useState(null); // Ha válasz, melyik ötletre?

  const [loading, setLoading] = useState(false);

  // Ha az Ötletek oldalról jöttünk a "Megvalósítom" gombbal,
  // akkor automatikusan beállítjuk a módot
  // (Ehhez majd az Ideas.jsx-ben a Link-et módosítani kell state-tel)
  
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!file) return alert("Kérlek válassz képet!");

    setLoading(true);

    // Adatok összekészítése
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('category_id', categoryId);
    formData.append('image', file);
    
    // Ha ötletre válaszolunk, küldjük el az ID-t is
    if (uploadType === 'response' && ideaId) {
        formData.append('idea_id', ideaId);
    }

    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                // FONTOS: Itt küldjük a "Belépőkártyát"
                'Authorization': `Bearer ${token}` 
                // A Content-Type-ot a böngésző intézi a FormData miatt!
            },
            body: formData
        });

        if (response.ok) {
            alert("Sikeres feltöltés!");
            navigate('/gallery'); // Visszairányítjuk a galériába
        } else {
            const data = await response.json();
            alert(data.error || "Hiba történt.");
        }

    } catch (error) {
        console.error(error);
        alert("Nem sikerült elérni a szervert.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Új Alkotás Feltöltése</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* TÍPUS VÁLASZTÓ */}
          <div className="form-group">
            <label>Feltöltés típusa</label>
            <select 
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="input-field" // Stílust az Auth.css vagy Upload.css adja
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}}
            >
                <option value="gallery">Saját alkotás (Galéria)</option>
                <option value="response">Válasz egy ötletre</option>
            </select>
          </div>

          {/* HA VÁLASZ, KELL AZ IDEA ID (Ezt most manuálisan kérjük be teszteléshez, 
              később automatizáljuk az Ideas oldalról) */}
          {uploadType === 'response' && (
              <div className="form-group">
                  <label>Ötlet ID-ja (Amire válaszolsz)</label>
                  <input 
                    type="number" 
                    placeholder="Írd be az ötlet sorszámát"
                    value={ideaId || ''}
                    onChange={(e) => setIdeaId(e.target.value)}
                    required
                  />
              </div>
          )}

          {/* DRAG & DROP ZÓNA */}
          {!preview ? (
            <label className="upload-area">
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              <FaCloudUploadAlt className="upload-icon" />
              <h3>Kattints a kép kiválasztásához</h3>
            </label>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Előnézet" className="preview-img" />
              <button type="button" onClick={removeFile} className="remove-btn"><FaTimes /></button>
            </div>
          )}

          <div className="form-group">
            <label>Cím</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {/* KATEGÓRIA VÁLASZTÓ (Fix ID-kkal a DB alapján) */}
          <div className="form-group">
            <label>Kategória</label>
            <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}}
            >
                <option value="1">Természet</option>
                <option value="2">Város</option>
                <option value="3">Tech</option>
                <option value="4">Digitális Art</option>
                <option value="5">Design</option>
            </select>
          </div>

          <div className="form-group">
            <label>Leírás</label>
            <textarea 
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)'}}
            ></textarea>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Feltöltés...' : 'Közzététel'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Upload;