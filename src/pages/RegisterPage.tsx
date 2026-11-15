import { useState, type SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { ApiError } from '../api/client';
import './AuthPages.css';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ 
        email, 
        password, 
        name, 
        wallet_address: wallet || undefined 
      });
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
        <h2>Реєстрація</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <label>
          Ім'я (від 3 до 20 символів)
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            minLength={3}
            maxLength={20}
          />
        </label>
        
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        
        <label>
          Пароль (від 8 до 32 символів)
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={8}
            maxLength={32}
          />
        </label>

        <label>
          Адреса гаманця (необов'язково)
          <input type="text" value={wallet} onChange={e => setWallet(e.target.value)} />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Зачекайте...' : 'Зареєструватися'}
        </button>
        
        <p className="auth-switch"> Вже є акаунт? <Link to="/login">Увійти</Link></p>
      </form>
    </div>
  );
}