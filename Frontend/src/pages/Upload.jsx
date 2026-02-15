import { useState } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import './Upload.css';
import './Auth.css'; // Az input mezők stílusát innen vesszük kölcsön!

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Fájl kiválasztása
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected)); // Előnézet generálása
    }
  };

  // Fájl törlése
  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!file) return alert("Kérlek válassz képet!");
    alert("Kép feltöltése folyamatban... (Backend szükséges)");
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Új Alkotás Feltöltése</h2>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Mit töltesz fel?</label>
            <select 
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', 
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <option value="gallery">Saját alkotás (Galéria)</option>
              <option value="response">Válasz egy ötletre (Ötletbörze)</option>
            </select>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* DRAG & DROP ZÓNA VAGY ELŐNÉZET */}
          {!preview ? (
            <label className="upload-area">
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              <FaCloudUploadAlt className="upload-icon" />
              <h3>Kattints ide a kép kiválasztásához</h3>
              <p style={{ color: 'var(--text-secondary)' }}>JPG, PNG formátum</p>
            </label>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Előnézet" className="preview-img" />
              <button type="button" onClick={removeFile} className="remove-btn"><FaTimes /></button>
            </div>
          )}

          {/* INPUTOK */}
          <div className="form-group">
            <label>Cím</label>
            <input 
              type="text" 
              placeholder="Add meg a kép címét" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Leírás</label>
            <textarea 
              rows="3"
              placeholder="Írj valamit az alkotásról..."
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', 
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="auth-btn">
            <FaCloudUploadAlt style={{ marginRight: '8px' }} /> Feltöltés
          </button>
        </form>

      </div>
    </div>
  );
};

export default Upload;