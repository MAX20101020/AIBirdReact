import { useState, type SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { ApiError } from '../api/client';
import './AuthPages.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } 
    catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } 
      else {
        setError('Сталася невідома помилка');
      }
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <BackButton />
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вхід</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        
        <label>
          Пароль
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required  minLength={8} maxLength={32}/>
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Зачекайте...' : 'Увійти'}
        </button>
        
        <p className="auth-switch"> Немає акаунту? <Link to="/register">Зареєструватися</Link> </p>
      </form>
    </div>
  );
}