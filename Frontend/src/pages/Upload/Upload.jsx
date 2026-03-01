import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import './Upload.css'; // Használhatod a meglévő CSS-edet, ha van

const Upload = () => {
  const navigate = useNavigate();
  
  // --- ÁLLAPOTOK ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Kép előnézethez
  const [loading, setLoading] = useState(false);

  // Kategóriák (Ezek egyeznek a DB-ben lévőkkel: 1-Természet, 2-Város, stb.)
  const categories = [
    { id: 1, name: 'Természet' },
    { id: 2, name: 'Város' },
    { id: 3, name: 'Tech' },
    { id: 4, name: 'Digitális Art' },
    { id: 5, name: 'Design' }
  ];

  // Ellenőrizzük, hogy be van-e lépve
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('A feltöltéshez be kell jelentkezned!');
      navigate('/login');
    }
  }, [navigate]);

  // Fájl kiválasztásának kezelése (és előnézet generálása)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Kép előnézet URL generálása a memóriában
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // --- ŰRLAP KÜLDÉSE (A VARÁZSLAT ITT TÖRTÉNIK) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      alert("Cím és kép megadása kötelező!");
      return;
    }

    setLoading(true);

    // 1. Készítünk egy "virtuális csomagot" (FormData) a fájlnak és a szövegeknek
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    
    // FIGYELEM: Ennek a neve 'image' kell legyen, mert a backend ezt várja: upload.single('image')
    formData.append('image', file); 

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NAGYON FONTOS: Ide TILOS beírni a 'Content-Type': 'application/json'-t! 
          // A böngésző automatikusan beállítja a 'multipart/form-data'-t a fájlok miatt.
        },
        body: formData // A csomagot küldjük
      });

      if (response.ok) {
        alert("Kép sikeresen feltöltve!");
        navigate('/gallery'); // Feltöltés után átvisszük a galériába
      } else {
        const data = await response.json();
        alert(data.error || "Hiba a feltöltéskor.");
      }
    } catch (error) {
      console.error("Hiba:", error);
      alert("Nem sikerült kapcsolódni a szerverhez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-primary)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <FaCloudUploadAlt style={{ color: 'var(--accent-color)' }} /> Új Alkotás Feltöltése
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* KÉP KIVÁLASZTÁSA */}
        <div style={{ border: '2px dashed var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center', position: 'relative' }}>
          {previewUrl ? (
            <div style={{ position: 'relative' }}>
              <img src={previewUrl} alt="Előnézet" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
              <button 
                type="button" 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(231, 76, 60, 0.8)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Mégse
              </button>
            </div>
          ) : (
            <>
              <FaImage style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Kattints ide, vagy húzd ide a képet!</p>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleFileChange} 
                required 
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer' }}
              />
            </>
          )}
        </div>

        {/* ŰRLAP MEZŐK */}
        <input 
          type="text" 
          placeholder="Alkotás címe *" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />

        <select 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <textarea 
          placeholder="Oszd meg a gondolataidat a képről (opcionális)..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows="4"
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
        />

        <button 
          type="submit" 
          disabled={loading || !file}
          style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: (loading || !file) ? 'var(--text-secondary)' : 'var(--accent-color)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: (loading || !file) ? 'not-allowed' : 'pointer', transition: '0.3s' }}
        >
          {loading ? 'Feltöltés folyamatban...' : 'Megosztás a közösséggel'}
        </button>

      </form>
    </div>
  );
};

export default Upload;