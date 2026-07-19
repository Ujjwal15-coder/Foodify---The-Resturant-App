import { useState } from 'react';
import { useToast } from '../components/Toast';

function Wallet() {
  const toast = useToast();
  
  // Dynamic Balance State
  const [balance, setBalance] = useState(500.00);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', title: 'Cashback - Order #2847', time: 'Jul 10, 2026 • 10:30 AM', amt: 50.00 },
    { id: 2, type: 'debit', title: 'Payment - Biryani By Kilo', time: 'Jul 8, 2026 • 1:15 PM', amt: 399.00 },
    { id: 3, type: 'credit', title: 'Refund - Domino\'s Pizza', time: 'Jun 28, 2026 • 4:00 PM', amt: 249.00 },
    { id: 4, type: 'credit', title: 'Added Money', time: 'Jun 25, 2026 • 9:00 AM', amt: 1000.00 }
  ]);

  const handleAddMoney = () => {
    const amountStr = prompt('Enter the amount of money to add to your Wallet (₹):');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount entered');
      return;
    }

    setBalance(prev => prev + amount);
    
    const newTxn = {
      id: Date.now(),
      type: 'credit',
      title: 'Added Money',
      time: 'Just now',
      amt: amount
    };
    
    setTransactions(prev => [newTxn, ...prev]);
    toast.success(`Successfully added ₹${amount.toFixed(2)} to your Wallet!`);
  };

  const handleTransfer = () => {
    const phone = prompt('Enter the phone number or user ID of the recipient:');
    if (!phone) return;
    
    const amountStr = prompt(`Enter transfer amount (Max: ₹${balance.toFixed(2)}):`);
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      toast.error('Invalid transfer amount or insufficient balance');
      return;
    }
    
    setBalance(prev => prev - amount);
    
    const newTxn = {
      id: Date.now(),
      type: 'debit',
      title: `Transfer to ${phone}`,
      time: 'Just now',
      amt: amount
    };
    
    setTransactions(prev => [newTxn, ...prev]);
    toast.success(`Successfully transferred ₹${amount.toFixed(2)} to ${phone}!`);
  };

  return (
    <section id="page-wallet" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">Wallet 💰</h1>
        <div className="wallet-card">
          <div className="wallet-balance">
            <small>Available Balance</small>
            <h2>₹{balance.toFixed(2)}</h2>
          </div>
          <div className="wallet-actions">
            <button className="btn-main" onClick={handleAddMoney} style={{ background: '#fff', color: 'var(--primary)' }}>
              <i className="fas fa-plus"></i> Add Money
            </button>
            <button className="btn-outline" onClick={handleTransfer} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              <i className="fas fa-paper-plane"></i> Transfer
            </button>
          </div>
        </div>
        
        <div className="section-head"><h2>Transaction History</h2></div>
        <div className="txn-list">
          {transactions.map(txn => (
            <div key={txn.id} className="txn-item">
              <div className={`txn-icon ${txn.type}`}>
                <i className={`fas ${txn.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
              </div>
              <div className="txn-info">
                <strong>{txn.title}</strong>
                <small>{txn.time}</small>
              </div>
              <span className={`txn-amount ${txn.type}`}>
                {txn.type === 'credit' ? '+' : '-'} ₹{txn.amt.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Wallet;

