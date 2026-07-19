import { useState } from 'react';
import { useToast } from '../components/Toast';

function Offers() {
  const toast = useToast();
  
  // Spin Wheel States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  // Scratch Cards States (revealed IDs)
  const [revealedCards, setRevealedCards] = useState([]);

  const coupons = [
    { code: 'WELCOME50', title: 'First Order Special', desc: 'Valid on orders above ₹199', amt: '50%', color: 'linear-gradient(135deg,var(--primary),var(--primary-light))' },
    { code: 'FLAT100', title: 'Flat ₹100 Off', desc: 'On orders above ₹499', amt: '₹100', cashback: true },
    { code: 'FREERIDE', title: 'Free Delivery Weekend', desc: 'Orders above ₹299', amt: 'FREE', freeDel: true }
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);

    const prizes = [
      'Free Delivery Coupon!',
      '₹50 Wallet Bonus!',
      '10% Off Next Meal Coupon!',
      'Better luck next time!',
      '₹200 Off Premium Dine Coupon!',
      'Free Drink on next order!'
    ];

    setTimeout(() => {
      const randIdx = Math.floor(Math.random() * prizes.length);
      setIsSpinning(false);
      setSpinResult(prizes[randIdx]);
      toast.success(`Congratulations! You won: ${prizes[randIdx]}`);
    }, 3000);
  };

  const handleScratchCard = (id, reward) => {
    if (revealedCards.includes(id)) return;
    setRevealedCards(prev => [...prev, id]);
    toast.success(`Scratched Card revealed: ${reward}!`);
  };

  return (
    <section id="page-offers" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">Offers & Rewards 🎁</h1>
        
        {/* Spin Wheel */}
        <div className="spin-wheel-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div className="spin-content">
            <h2>Spin & Win!</h2>
            <p>Try your luck and win exciting rewards</p>
            <button className="btn-main" onClick={handleSpinWheel} disabled={isSpinning} style={{ background: '#fff', color: '#8B5CF6' }}>
              {isSpinning ? 'Spinning...' : 'Spin Now'} <i className={`fas fa-sync-alt ${isSpinning ? 'fa-spin' : ''}`}></i>
            </button>
            {spinResult && (
              <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
                🎉 Prize: {spinResult}
              </div>
            )}
          </div>
          <div 
            className="spin-visual" 
            style={{ 
              fontSize: '100px', 
              opacity: 0.4, 
              animation: isSpinning ? 'spin 0.5s linear infinite' : 'spin 12s linear infinite',
              transition: 'animation 0.5s ease-out'
            }}
          >
            <i className="fas fa-dharmachakra"></i>
          </div>
        </div>

        {/* Scratch Cards */}
        <div className="section-head"><h2>🃏 Scratch Cards</h2></div>
        <div className="scratch-grid">
          
          <div 
            className={`scratch-card ${revealedCards.includes(1) ? 'revealed' : 'unscratched'}`}
            onClick={() => handleScratchCard(1, '$5 Cashback')}
          >
            {revealedCards.includes(1) ? (
              <div className="scratch-reveal">
                <h3>₹50 OFF</h3>
                <p>On orders above ₹299</p>
                <span>SCRATCH50</span>
              </div>
            ) : (
              <div className="scratch-front">
                <i className="fas fa-gift"></i>
                <p>Scratch to reveal</p>
              </div>
            )}
          </div>

          <div 
            className={`scratch-card ${revealedCards.includes(2) ? 'revealed' : 'unscratched'}`}
            onClick={() => handleScratchCard(2, 'Free Dessert')}
          >
            {revealedCards.includes(2) ? (
              <div className="scratch-reveal">
                <h3>FREE DESSERT</h3>
                <p>Valid on all bakeries</p>
                <span>SWEETFREE</span>
              </div>
            ) : (
              <div className="scratch-front">
                <i className="fas fa-gift"></i>
                <p>Scratch to reveal</p>
              </div>
            )}
          </div>

          <div className="scratch-card revealed">
            <div className="scratch-reveal">
              <h3>₹75 OFF</h3>
              <p>On orders above ₹399</p>
              <span>SCRATCH3</span>
            </div>
          </div>
        </div>

        {/* Coupon Cards */}
        <div className="section-head"><h2>🏷️ Available Coupons</h2></div>
        <div className="coupon-list">
          {coupons.map((coupon, idx) => (
            <div key={idx} className="coupon-card">
              <div className={`coupon-left ${coupon.cashback ? 'cashback' : coupon.freeDel ? 'free-del' : ''}`}>
                <span className="coupon-amt">{coupon.amt}</span>
                <small>{coupon.freeDel ? 'DELIVERY' : 'OFF'}</small>
              </div>
              <div className="coupon-right">
                <h4>{coupon.title}</h4>
                <p>{coupon.desc}</p>
                <div className="coupon-meta">
                  <span>Expires: Jul 31</span>
                  <button className="coupon-copy" onClick={() => handleCopyCode(coupon.code)}>
                    {coupon.code}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div className="referral-banner">
          <div className="referral-content">
            <h3>Refer & Earn ₹100 🤝</h3>
            <p>Share your code with friends. Both get ₹100 off!</p>
            <div className="referral-code">
              <span>ARJUN2026</span>
              <button onClick={() => handleCopyCode('ARJUN2026')}>
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Offers;

