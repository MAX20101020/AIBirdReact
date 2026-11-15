import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToken, ApiError } from '../api/client';
import './HomePage.css';

type Prediction = {
  species?: string;
  scientific_name?: string;
  common_name?: string;
  score: number;
};

type AnalyzeResponse = {
  status: string;
  predictions: Prediction[];
  file_url?: string;
  attempts_left?: number;
  message?: string;
};

export function HomePage() {
  const { refreshBalance } = useAuth();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [photoResult, setPhotoResult] = useState<AnalyzeResponse | null>(null);
  const [audioResult, setAudioResult] = useState<AnalyzeResponse | null>(null);
  const [loadingType, setLoadingType] = useState<'photo' | 'audio' | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (fileType: 'photo' | 'audio') => {
    const file = fileType === 'photo' ? photoFile : audioFile;
    if (!file) return;

    setError('');
    setLoadingType(fileType);
    
    if (fileType === 'photo') setPhotoResult(null);
    else setAudioResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8001/central/bird/analyze/${fileType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'Помилка аналізу', data);
      }

      if (data.status === 'error') {
         throw new ApiError(500, data.message || 'Помилка на сервері ШІ', data);
      }

      if (fileType === 'photo') setPhotoResult(data);
      else setAudioResult(data);

      await refreshBalance();
    } 
    catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } 
      else {
        setError('Сталася помилка при завантаженні файлу');
      }
    } 
    finally {
      setLoadingType(null);
    }
  };

  const renderResult = (result: AnalyzeResponse, type: 'photo' | 'audio') => {
    if (!result.predictions || result.predictions.length === 0) {
      return <div className="result-box">Птахів не знайдено</div>;
    }

    return (
      <div className="result-box" style={{ background: 'transparent', padding: 0 }}>
        <div className="result-title">Результати аналізу</div>
        
        {result.file_url && type === 'photo' && (
          <img src={result.file_url} alt="Analyzed" className="result-image" />
        )}

        {result.predictions.slice(0, 5).map((pred, idx) => {
          const name = pred.species || pred.scientific_name || 'Невідомий вид';
          const common = pred.common_name || '';
          const confidence = ((pred.score || 0) * 100).toFixed(1);

          return (
            <div key={idx} className="result-card">
              {common && <h4>{common}</h4>}
              <div className="result-scientific">{name}</div>
              
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ 
                    width: `${confidence}%`,
                    background: Number(confidence) > 70 
                      ? '#10b981' 
                      : Number(confidence) > 40 
                        ? '#f59e0b' 
                        : '#ef4444'
                  }} 
                />
              </div>
              <div className="confidence-text">Впевненість: {confidence}%</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Аналіз птахів</h1>
      
      {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="analyze-grid">
        <div className="analyze-card">
          <h3>Аналіз фото</h3>
          
          <label className="file-drop-zone">
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} 
            />
            <p>{photoFile ? photoFile.name : 'Натисніть, щоб вибрати фото'}</p>
          </label>

          <button 
            className="analyze-btn" 
            disabled={!photoFile || loadingType !== null}
            onClick={() => handleAnalyze('photo')}
          >
            {loadingType === 'photo' ? 'Аналізуємо...' : 'Аналізувати фото'}
          </button>

          {photoResult && renderResult(photoResult, 'photo')}
        </div>

        <div className="analyze-card">
          <h3>Аналіз аудіо</h3>
          
          <label className="file-drop-zone">
            <input 
              type="file" 
              accept=".mp3" 
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)} 
            />
            <p>{audioFile ? audioFile.name : 'Натисніть, щоб вибрати аудіо'}</p>
          </label>

          <button 
            className="analyze-btn" 
            disabled={!audioFile || loadingType !== null}
            onClick={() => handleAnalyze('audio')}
          >
            {loadingType === 'audio' ? 'Аналізуємо...' : 'Аналізувати аудіо'}
          </button>

          {audioResult && renderResult(audioResult, 'audio')}
        </div>
      </div>
    </div>
  );
}