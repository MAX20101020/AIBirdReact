import { useState, useEffect } from 'react';
import { api, ApiError } from '../api/client';
import { BackButton } from '../components/BackButton';
import './StatisticsPage.css';

type SpeciesStat = { label: string; count: number };
type AnalysisRecord = {
  id: number;
  filename: string;
  bird_name: string;
  confidence: number | null;
  analyzed_at: string;
};

type StatisticsData = {
  record_count: number;
  species: SpeciesStat[];
  highest: AnalysisRecord[];
  lowest: AnalysisRecord[];
  same_confidence: boolean;
};

export function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<StatisticsData>('/central/bird/statistics');
        setData(response);
      } 
      catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Помилка завантаження статистики');
      } 
      finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="stat-loading">Завантаження...</div>;
  if (error) return <div className="auth-error" style={{ margin: 20 }}>{error}</div>;
  if (!data) return null;

  return (
    <div className="stat-container">
      <BackButton />
      <h1 className="stat-title">Статистика аналізів</h1>
      
      <div className="stat-total">
        Всього записів: <strong>{data.record_count}</strong>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <h2>Топ видів</h2>
          <ul className="species-list">
            {data.species.map((s, i) => (
              <li key={i}>
                <span>{s.label}</span>
                <strong>{s.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Найвища впевненість</h2>
          {data.same_confidence && <p style={{ fontSize: 12, color: '#94a3b8' }}>Всі результати мають однакову впевненість</p>}
          <ul className="analysis-list">
            {data.highest.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.bird_name}</strong>
                  <div className="stat-file">{r.filename}</div>
                </div>
                <span className="stat-score good">{r.confidence != null ? (r.confidence * 100).toFixed(1) : '0.0'}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Найнижча впевненість</h2>
          {data.same_confidence && <p style={{ fontSize: 12, color: '#94a3b8' }}>Всі результати мають однакову впевненість</p>}
          <ul className="analysis-list">
            {data.lowest.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.bird_name}</strong>
                  <div className="stat-file">{r.filename}</div>
                </div>
                <span className="stat-score bad">{r.confidence != null ? (r.confidence * 100).toFixed(1) : '0.0'}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}