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
                <span className="attempts-label">Спроби:</span>
                <strong style={{ color: '#7dd3fc' }}>{user.attempts_left}</strong>
              </div>
              <div className="nav-icons">
                <Link to="/statistics" className="nav-icon-link" title="Статистика">
                  <img src="/statistics.png" alt="Статистика" className="nav-img" />
                </Link>
                <Link to="/history" className="nav-icon-link" title="Історія">
                  <img src="/history.png" alt="Історія" className="nav-img" />
                </Link>
              </div>
            </>
          )}
        </div>

        <Link to="/" className="logo">AIBirdLab</Link>

        <div className="side actions">
          {user ? (
            <>
              <span className="user-greeting">Привіт, {user.name}!</span>

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

              <button className="btn-ghost" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Вийти
              </button>
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