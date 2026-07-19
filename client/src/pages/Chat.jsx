import { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/Toast';

function Chat() {
  const toast = useToast();
  const chatEndRef = useRef(null);

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi Arjun! 👋 I'm FoodyBot, your virtual assistant. How can I help you today?",
      time: '10:00 AM'
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Here are some things I can help with:',
      time: '10:00 AM',
      quickReplies: ['Track my order', 'Report an issue', 'Request refund', 'Talk to agent']
    }
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getFormatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendUserMsg = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: getFormatTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Trigger Bot response simulation
    setTimeout(() => {
      let botText = "I've received your request. Let me check that for you. 🔍";
      
      const lower = text.toLowerCase();
      if (lower.includes('track') || lower.includes('order')) {
        botText = "Your active order #FD-2847 is currently ON THE WAY! ETA is 12 mins. 🛵";
      } else if (lower.includes('issue') || lower.includes('report')) {
        botText = "Oh no, I'm sorry to hear that! Please type in details of the issue, and I will escalate to our support team.";
      } else if (lower.includes('refund')) {
        botText = "Refunds take 3-5 business days to process back to your Wallet. Would you like me to process one for your last order?";
      } else if (lower.includes('agent') || lower.includes('talk')) {
        botText = "Connecting you with a live support representative. Please hold... 📞";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botText,
        time: getFormatTime()
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleQuickReply = (replyText) => {
    handleSendUserMsg(replyText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendUserMsg(inputVal);
    }
  };

  return (
    <section id="page-chat" className="page active">
      <div className="page-inner stagger-in">
        <h1 className="page-title">Chat Support 💬</h1>
        <div className="chat-container">
          <div className="chat-messages" id="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                <div className="chat-avatar">
                  <i className={msg.sender === 'bot' ? 'fas fa-robot' : 'fas fa-user'}></i>
                </div>
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  
                  {msg.quickReplies && (
                    <div className="chat-quick-replies">
                      {msg.quickReplies.map(qr => (
                        <button 
                          key={qr} 
                          className="qr-btn"
                          onClick={() => handleQuickReply(qr)}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <small>{msg.time}</small>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="chat-input-bar">
            <button className="chat-attach" onClick={() => toast.info('Attachments coming soon!')}>
              <i className="fas fa-paperclip"></i>
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              id="chat-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="chat-emoji" onClick={() => toast.info('Emoji picker coming soon!')}>
              <i className="fas fa-face-smile"></i>
            </button>
            <button className="chat-voice" onClick={() => toast.info('Voice input coming soon!')}>
              <i className="fas fa-microphone"></i>
            </button>
            <button className="chat-send" onClick={() => handleSendUserMsg(inputVal)}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Chat;

