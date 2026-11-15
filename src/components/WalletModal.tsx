import { useState, type SyntheticEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import './WalletModal.css';

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { user, updateWallet } = useAuth();
  const [wallet, setWallet] = useState(user?.wallet_address || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateWallet(wallet);
      onClose();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Мій гаманець</h3>
        <form onSubmit={handleSubmit} className="wallet-form">
          {error && <div className="auth-error">{error}</div>}
          
          <label>
            Адреса гаманця:
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
              Скасувати
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}