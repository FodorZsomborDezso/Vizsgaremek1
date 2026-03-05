import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheckCircle, FaLightbulb, FaCrop, FaExpandArrowsAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';
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

  // --- KÉPVÁGÓ (CROPPER) ÁLLAPOTOK ---
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null); // Amit épp vágunk (URL)
  const [tempFile, setTempFile] = useState(null);         // 🔥 ÚJ: Az eredeti fájl megjegyzése
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // A régi kategóriák megtartásával (hogy a régi képek ne törjenek el) + az újak
  const categoryMap = {
    'Természet': 1,
    'Város / Építészet': 2, // ID marad 2, de szebben írjuk ki
    'Tech': 3,
    'Általános Digitális Art': 4,
    'Általános Design': 5,
    'Portré': 6,
    'Makró Fotózás': 7,
    'Éjszakai Fotózás': 8,
    '3D Render': 9,
    'Illusztráció': 10,
    'Koncepciórajz': 11,
    'AI Művészet': 12,
    'Festmény': 13,
    'Rajz / Grafika': 14,
    'Szobrászat': 15,
    'Web / UI Design': 16,
    'Logó / Arculat': 17,
    'Tipográfia': 18
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idea = searchParams.get('idea_id');
    if (idea) {
      setIdeaId(idea);
      toast.info("💡 Szuper! Egy létező ötletet valósítasz meg!");
    }
  }, [location]);

  // --- KÉP BEHÚZÁSA / KIVÁLASZTÁSA ---
  const handleFileProcess = (file) => {
    if (file && file.type.startsWith('image/')) {
      setTempFile(file); // 🔥 Megjegyezzük az eredeti fájlt
      setTempImageUrl(URL.createObjectURL(file));
      setIsCropping(true);
    } else {
      toast.error("Kérlek, csak érvényes képfájlt (JPG, PNG) tölts fel!");
    }
  };

  const handleFileChange = (e) => handleFileProcess(e.target.files[0]);
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  // --- VÁGÁS FOLYAMATA ---
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedFile = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      toast.error("Hiba történt a kép vágásakor!");
    }
  };

  // 🔥 ÚJ: Eredeti kép megtartása vágás nélkül
  const keepOriginalImage = () => {
    setSelectedFile(tempFile);
    setPreviewUrl(tempImageUrl);
    setIsCropping(false);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setTempImageUrl(null);
    setTempFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- CÍMKÉK (HASHTAGEK) KEZELÉSE ---
  const handleTagKeyDown = (e) => {
    // Ha Entert vagy Vesszőt nyom, hozzáadjuk a címkét
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9áéíóöőúüű]/g, ''); // Csak betűk és számok
      if (newTag && !tags.includes(newTag) && tags.length < 5) { // Max 5 címke
        setTags([...tags, newTag]);
        setTagInput('');
      } else if (tags.length >= 5) {
        toast.warning("Maximum 5 címkét adhatsz meg!");
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Ha üres a mező és visszatörlőt nyom, törli az utolsó címkét
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- ŰRLAP BEKÜLDÉSE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.warning("Kérlek, válassz ki egy képet a feltöltéshez!");
    if (!title.trim()) return toast.warning("A cím megadása kötelező!");

    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile); 
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    if (ideaId) formData.append('idea_id', ideaId);

    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });

      if (res.ok) {
        toast.success("Alkotásod sikeresen feltöltve! 🎉");
        navigate('/gallery');
      } else {
        toast.error("Hiba történt a feltöltés során.");
      }
    } catch (err) { toast.error("Szerver hiba."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-content-wrapper">
        
        <div className="upload-header">
          <h1>Új alkotás feltöltése <FaImage style={{ color: '#00d2ff' }} /></h1>
          <p>Oszd meg a legújabb munkádat a közösséggel!</p>
          {ideaId && <div className="idea-implementation-badge"><FaLightbulb /> Egy közösségi ötletet valósítasz meg</div>}
        </div>

        <form onSubmit={handleSubmit} className="upload-form-layout">
          
          {/* BAL OLDAL */}
          <div className="upload-left-side">
            {!previewUrl ? (
              <div 
                className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <FaCloudUploadAlt className="upload-icon-large" />
                <h3>Húzd ide a képet!</h3>
                <p>Vagy kattints a böngészéshez</p>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Előnézet" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={clearImage}>
                  <FaTimes /> Másik kép
                </button>
              </div>
            )}
          </div>

          {/* JOBB OLDAL */}
          <div className="upload-right-side">
            <div className="form-group">
              <label>Kategória</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)} 
                className="modern-input"
                style={{ padding: '12px', cursor: 'pointer' }}
              >
                <optgroup label="- Fotózás">
                  <option value={categoryMap['Természet']}>Természet</option>
                  <option value={categoryMap['Város / Építészet']}>Város / Építészet</option>
                  <option value={categoryMap['Portré']}>Portré</option>
                  <option value={categoryMap['Makró Fotózás']}>Makró Fotózás</option>
                  <option value={categoryMap['Éjszakai Fotózás']}>Éjszakai Fotózás</option>
                </optgroup>
                
                <optgroup label="- Digitális Művészet">
                  <option value={categoryMap['Általános Digitális Art']}>Általános Digitális Art</option>
                  <option value={categoryMap['3D Render']}>3D Render</option>
                  <option value={categoryMap['Illusztráció']}>Illusztráció</option>
                  <option value={categoryMap['Koncepciórajz']}>Koncepciórajz</option>
                  <option value={categoryMap['AI Művészet']}>AI Művészet</option>
                </optgroup>

                <optgroup label="- Klasszikus Művészet">
                  <option value={categoryMap['Festmény']}>Festmény</option>
                  <option value={categoryMap['Rajz / Grafika']}>Rajz / Grafika</option>
                  <option value={categoryMap['Szobrászat']}>Szobrászat</option>
                </optgroup>

                <optgroup label="- Tervezés & Design">
                  <option value={categoryMap['Általános Design']}>Általános Design</option>
                  <option value={categoryMap['Web / UI Design']}>Web / UI Design</option>
                  <option value={categoryMap['Logó / Arculat']}>Logó / Arculat</option>
                  <option value={categoryMap['Tipográfia']}>Tipográfia</option>
                  <option value={categoryMap['Tech']}>Tech / UI</option>
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label>Alkotás címe</label>
              <input type="text" placeholder="Adj egy találó nevet a képednek..." value={title} onChange={(e) => setTitle(e.target.value)} required className="modern-input" />
            </div>
            <div className="form-group">
              <label>Leírás (opcionális)</label>
              <textarea rows="6" placeholder="Milyen technikával készült? Meséld el!" value={description} onChange={(e) => setDescription(e.target.value)} className="modern-input"></textarea>
              <div className="form-group">
              <label>Címkék (nyomj Entert vagy Vesszőt)</label>
              <div className="tags-input-container">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    #{tag} <FaTimes className="remove-tag-icon" onClick={() => removeTag(tag)} />
                  </span>
                ))}
                <input 
                  type="text" 
                  placeholder={tags.length < 5 ? "Pl. naplemente, portré..." : "Elérted a limitet (5)"} 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                  className="tag-input-field"
                />
              </div>
            </div>
            </div>
            <button type="submit" className="submit-upload-btn" disabled={loading || !selectedFile}>
              {loading ? 'Feltöltés folyamatban...' : <><FaCheckCircle style={{ marginRight: '8px' }} /> Közzététel</>}
            </button>
          </div>

        </form>

        {/* ========================================= */}
        {/* 🔥 KÉPVÁGÓ (CROPPER) MODAL 🔥             */}
        {/* ========================================= */}
        {isCropping && tempImageUrl && (
          <div className="crop-modal-overlay">
            <div className="crop-modal-content">
              <h2><FaCrop /> Kép igazítása</h2>
              
              <div className="crop-container">
                <Cropper
                  image={tempImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3} 
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="crop-controls">
                <input 
                  type="range" value={zoom} min={1} max={3} step={0.1}
                  aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)} className="zoom-slider"
                />
              </div>

              <div className="crop-modal-actions">
                <button type="button" onClick={cancelCrop} className="btn-cancel">Mégse</button>
                {/* 🔥 ÚJ GOMB AZ EREDETI MÉRETHEZ */}
                <button type="button" onClick={keepOriginalImage} className="btn-secondary">
                  <FaExpandArrowsAlt style={{ marginRight: '5px' }} /> Eredeti méret
                </button>
                <button type="button" onClick={showCroppedImage} className="btn-save">Vágás mentése</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Upload;