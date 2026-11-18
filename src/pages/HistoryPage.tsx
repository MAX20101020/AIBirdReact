import { useState, useEffect } from 'react';
import { api, ApiError } from '../api/client';
import { BackButton } from '../components/BackButton';
import './HistoryPage.css';

type AnalysisRecord = {
  id: number;
  filename: string;
  bird_name: string;
  confidence: number | null;
  analyzed_at: string;
  description?: string;
  source_details?: string;
  file_url?: string;
};

export function HistoryPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (query) {
        response = await api.get<AnalysisRecord[]>('/central/bird/search', { name: query });
        setIsSearching(true);
      } else {
        response = await api.get<AnalysisRecord[]>('/central/bird/history');
        setIsSearching(false);
      }
      setRecords(response || []);
    }
    catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Помилка завантаження даних');
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchData('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="history-container">
      <BackButton />

      <h1 className="history-title">Історія аналізів</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Пошук за назвою птаха..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn" disabled={loading}>
          Знайти
        </button>
        {isSearching && (
          <button type="button" className="clear-btn" onClick={handleClearSearch} disabled={loading}>
            Скинути
          </button>
        )}
      </form>

      {error && <div className="auth-error">{error}</div>}
      {loading && <div className="history-loading">Завантаження...</div>}

      {!loading && records.length === 0 && (
        <div className="history-empty">
          {isSearching ? 'За вашим запитом нічого не знайдено' : 'Історія порожня. Зробіть свій перший аналіз!'}
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="history-grid">
          {records.map((record) => (
            <div key={record.id} className="history-card">
                {record.file_url && (
                <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="history-image-link">
                    {record.filename.endsWith('.mp3') ? (
                    <div className="history-audio-placeholder">Аудіофайл</div>
                    ) : (
                    <img src={record.file_url} alt={record.bird_name} className="history-image" />
                    )}
                </a>
                )}

                <div className="history-card-header">
                <h3>{record.bird_name}</h3>
                <span className={`history-score ${record.confidence && record.confidence > 0.5 ? 'good' : 'bad'}`}>
                    {record.confidence != null ? (record.confidence * 100).toFixed(1) : '0.0'}%
                </span>
                </div>
                
                <div className="history-meta">
                <span>{record.filename}</span>
                <span>{formatDate(record.analyzed_at)}</span>
                </div>

                {record.description && (
                <p className="history-description">{record.description}</p>
                )}
            </div>
            ))}
        </div>
      )}
    </div>
  );
}