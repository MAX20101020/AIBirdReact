import { useState } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { api, ApiError } from '../api/client';
import './SubscriptionPage.css';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = ["function buySubscription(uint8 _type) external payable"];
const Plan = {BASIC: 0, PRO: 1, PRO_PLUS: 2 };

const PLANS = [
  { id: Plan.BASIC, name: 'BASIC', price: '99.99', attempts: 10, popular: false },
  { id: Plan.PRO, name: 'PRO', price: '449.99', attempts: 50, popular: true },
  { id: Plan.PRO_PLUS, name: 'PRO+', price: '799.99', attempts: 100, popular: false },
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleBuy = async (plan: typeof PLANS[0]) => {
    setError('');
    setLoadingPlan(plan.id);

    try {
      if (!window.ethereum) {
        throw new Error("Будь ласка, встановіть MetaMask!");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error('Адрес смарт-контракту не налаштований.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const priceInWei = ethers.parseEther(plan.price);
      const tx = await contract.buySubscription(plan.id, { value: priceInWei });
      await tx.wait();

      const response = await api.post<{ attempts_left: number }>('/central/pay/subscribe', {
        tx_hash: tx.hash,
        wallet_address: userAddress
      });

      if (user) {
        updateUser({ 
          ...user, 
          wallet_address: userAddress, 
          attempts_left: response.attempts_left 
        });
      }
      alert(`Успіх! Ви придбали ${plan.attempts} спроб.`);

    } 
    catch (err: any) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Ви скасували транзакцію в MetaMask.');
      } 
      else if (err instanceof ApiError) {
        setError(err.message);
      } 
      else {
        setError(err.message || 'Сталася помилка при оплаті.');
      }
    } 
    finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="subs-container">
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <BackButton />
      </div>

      <h1 className="subs-title">Оберіть свій план</h1>
      <p className="subs-subtitle">Оплата відбувається через ваш гаманець MetaMask</p>

      {error && <div className="sub-error">{error}</div>}

      <div className="subs-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`sub-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Популярний</div>}
            
            <div className="sub-name">{plan.name}</div>
            <div className="sub-price">{plan.price} <span>ETH</span></div>
            <div className="sub-attempts">{plan.attempts} генерацій (спроб)</div>

            <button 
              className={`sub-btn ${plan.popular ? 'primary' : ''}`}
              onClick={() => handleBuy(plan)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === plan.id ? 'Обробка...' : 'Купити'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}