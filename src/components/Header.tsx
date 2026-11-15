import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WalletModal } from './WalletModal';
import './Header.css';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <div className="side">
          {user && (
            <>  
              <div 
              onClick={() => navigate('/subscription')}
              className="btn-ghost"
              style={{ cursor: 'pointer' }}
              title="Купити спроби"
            >
              <span>Спроби:</span>
              <strong style={{ color: '#7dd3fc' }}>{user.attempts_left}</strong>
            </div>
            <Link to="/statistics" className="nav-link">Статистика</Link>
            <Link to="/history" className="nav-link">Історія</Link>
            </>
          )}
        </div>

        <Link to="/" className="logo">AIBirdLab</Link>

        <div className="side actions">
          {user ? (
            <>
              <span style={{ color: '#cbd5e1', fontSize: 14, marginRight: 10 }}>Привіт, {user.name}!</span>

              <button 
                className="btn-ghost" 
                onClick={() => setIsWalletOpen(true)}
                style={{ cursor: 'pointer' }}
                title={user.wallet_address || 'Гаманець не прив’язано'}
              >
                {user.wallet_address 
                  ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                  : 'Прив’язати гаманець'}
              </button>

              <button className="btn-ghost" onClick={handleLogout} style={{ cursor: 'pointer' }}>Вийти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Увійти</Link>
              <Link to="/register" className="btn-primary">Реєстрація</Link>
            </>
          )}
        </div>
      </header>

      {isWalletOpen && <WalletModal onClose={() => setIsWalletOpen(false)} />}
    </>
  );
}