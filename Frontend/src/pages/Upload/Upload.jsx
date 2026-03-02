import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheckCircle, FaLightbulb } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Állapotok
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [ideaId, setIdeaId] = useState(null);
  
  // Kép kezelése
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['Természet', 'Város', 'Tech', 'Digitális Art', 'Design'];
  const categoryMap = { 'Természet': 1, 'Város': 2, 'Tech': 3, 'Digitális Art': 4, 'Design': 5 };

  // Megnézzük, hogy az Ötletbörzéből jött-e a felhasználó
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idea = searchParams.get('idea_id');
    if (idea) {
      setIdeaId(idea);
      toast.info("💡 Szuper! Egy létező ötletet valósítasz meg!");
    }
  }, [location]);

  // --- KÉP KEZELÉSE (Drag & Drop + Tallózás) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Kérlek, csak érvényes képfájlt (JPG, PNG) tölts fel!");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Kérlek, csak érvényes képfájlt (JPG, PNG) tölts fel!");
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- ŰRLAP BEKÜLDÉSE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.warning("Kérlek, válassz ki egy képet a feltöltéshez!");
    if (!title.trim()) return toast.warning("A cím megadása kötelező!");

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("A feltöltéshez be kell jelentkezned!");
      navigate('/login');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    if (ideaId) {
      formData.append('idea_id', ideaId);
    }

    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // A fetch automatikusan beállítja a multipart/form-data headert!
      });

      if (res.ok) {
        toast.success("Alkotásod sikeresen feltöltve! 🎉");
        navigate('/gallery'); // Sikeres feltöltés után visszadobjuk a galériába
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Hiba történt a feltöltés során.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-content-wrapper">
        
        <div className="upload-header">
          <h1>Új alkotás feltöltése <FaImage style={{ color: '#00d2ff' }} /></h1>
          <p>Oszd meg a legújabb munkádat a közösséggel!</p>
          {ideaId && (
            <div className="idea-implementation-badge">
              <FaLightbulb /> Egy közösségi ötletet valósítasz meg
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="upload-form-layout">
          
          {/* BAL OLDAL: KÉP FELTÖLTÉSE (Drag & Drop) */}
          <div className="upload-left-side">
            {!previewUrl ? (
              <div 
                className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <FaCloudUploadAlt className="upload-icon-large" />
                <h3>Húzd ide a képet!</h3>
                <p>Vagy kattints a böngészéshez (JPG, PNG)</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Előnézet" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={clearImage}>
                  <FaTimes /> Másik kép választása
                </button>
              </div>
            )}
          </div>

          {/* JOBB OLDAL: ADATOK MEGADÁSA */}
          <div className="upload-right-side">
            <div className="form-group">
              <label>Kategória</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="modern-input">
                {categories.map(cat => (
                  <option key={cat} value={categoryMap[cat]}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Alkotás címe</label>
              <input 
                type="text" 
                placeholder="Adj egy találó nevet a képednek..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label>Leírás (opcionális)</label>
              <textarea 
                rows="6" 
                placeholder="Milyen technikával készült? Mi inspirált? Meséld el a történetét!" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="modern-input"
              ></textarea>
            </div>

            <button type="submit" className="submit-upload-btn" disabled={loading || !selectedFile}>
              {loading ? 'Feltöltés folyamatban...' : <><FaCheckCircle style={{ marginRight: '8px' }} /> Közzététel</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Upload;