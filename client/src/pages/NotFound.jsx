import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-icon">
        <i className="fas fa-bowl-food"></i>
      </div>
      <h1>404</h1>
      <p>Oops! The page you are looking for has been eaten or does not exist.</p>
      <button className="btn-main" onClick={() => navigate('/')}>
        <i className="fas fa-house"></i> Go Back Home
      </button>
    </div>
  );
}

export default NotFound;
