import { useState } from 'react';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Feedback.css';

const Feedback = () => {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Javaslat', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Köszönjük a visszajelzést! Üzenetedet továbbítottuk az adminoknak. 🚀");
        setFormData({ name: '', email: '', type: 'Javaslat', message: '' });
      } else {
        toast.error("Hiba történt a küldés során.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <div className="feedback-header">
          <FaCommentDots className="feedback-icon" />
          <h1>Visszajelzés & Kapcsolat</h1>
          <p>Találtál egy hibát? Van egy jó fejlesztési ötleted? Vagy csak beköszönnél? Írd meg nekünk!</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-row">
            <div className="form-group">
              <label>Neved</label>
              <input type="text" placeholder="Pl. Kovács Péter" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email címed</label>
              <input type="email" placeholder="peter@pelda.hu" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Milyen jellegű az üzenet?</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="Javaslat">💡 Fejlesztési javaslat / Ötlet</option>
              <option value="Hiba">🐛 Hiba bejelentése (Bug)</option>
              <option value="Kérdés">❓ Kérdés</option>
              <option value="Egyéb">💬 Egyéb</option>
            </select>
          </div>

          <div className="form-group">
            <label>Üzeneted</label>
            <textarea rows="6" placeholder="Írd le részletesen..." required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
          </div>

          <button type="submit" className="feedback-submit-btn" disabled={loading}>
            {loading ? 'Küldés folyamatban...' : <><FaPaperPlane style={{ marginRight: '8px' }} /> Üzenet elküldése</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;