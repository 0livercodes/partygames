import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { TIT_ALBERT_SOCKET_EVENTS } from '../constants/socketEvents';
import { TIT_ALBERT_ROLE_NAMES } from '../constants/roles';

const TitAlbertSetup = () => {
  const navigate = useNavigate();
  const [titAlbertCount, setTitAlbertCount] = useState(1);
  const [specialRoles, setSpecialRoles] = useState({
    [TIT_ALBERT_ROLE_NAMES.BHAI_LOOKE]: false,
    [TIT_ALBERT_ROLE_NAMES.CLIFFEURD]: false,
    [TIT_ALBERT_ROLE_NAMES.AGWA]: false,
    [TIT_ALBERT_ROLE_NAMES.LONGANIS]: false,
    [TIT_ALBERT_ROLE_NAMES.TIFI]: false,
    [TIT_ALBERT_ROLE_NAMES.VOLER]: false
  });
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    // Get server info for QR code
    const fetchServerInfo = async () => {
      try {
        const backendUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/server-info`);
        const data = await response.json();
        const url = data.url;
        setServerUrl(url);
        
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#4a5568',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.error('Failed to get server info:', err);
        // Fallback to localhost with correct port
        const fallbackUrl = `http://localhost:3000`;
        setServerUrl(fallbackUrl);
        const qrUrl = await QRCode.toDataURL(fallbackUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#4a5568',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrUrl);
      }
    };

    fetchServerInfo();
  }, []);

  const specialRolesList = [
    { id: TIT_ALBERT_ROLE_NAMES.BHAI_LOOKE, name: TIT_ALBERT_ROLE_NAMES.BHAI_LOOKE, description: 'The Seer - can see one player\'s role each night' },
    { id: TIT_ALBERT_ROLE_NAMES.CLIFFEURD, name: TIT_ALBERT_ROLE_NAMES.CLIFFEURD, description: 'The Doctor - can protect one player each night' },
    { id: TIT_ALBERT_ROLE_NAMES.AGWA, name: TIT_ALBERT_ROLE_NAMES.AGWA, description: 'The Bodyguard - can protect players during day phase' },
    { id: TIT_ALBERT_ROLE_NAMES.LONGANIS, name: TIT_ALBERT_ROLE_NAMES.LONGANIS, description: 'The Hunter - can eliminate someone when eliminated' },
    { id: TIT_ALBERT_ROLE_NAMES.TIFI, name: TIT_ALBERT_ROLE_NAMES.TIFI, description: 'The Witch - has save and kill potions' },
    { id: TIT_ALBERT_ROLE_NAMES.VOLER, name: TIT_ALBERT_ROLE_NAMES.VOLER, description: 'The Thief - can steal roles' }
  ];

  // Note: Sefvilaz (The Mayor) is not assigned at setup - it's a transferable secondary role during gameplay

  const getSelectedSpecialRoles = () => {
    return Object.keys(specialRoles).filter(role => specialRoles[role]);
  };

  const validateSetup = () => {
    if (titAlbertCount < 1) {
      return 'Must have at least 1 Tit Albert!';
    }
    
    if (titAlbertCount > 4) {
      return 'Maximum 4 Tit Albert allowed!';
    }
    
    return null;
  };

  const handleSpecialRoleChange = (roleId) => {
    setSpecialRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
    setError('');
  };

  const handleTitAlbertCountChange = (count) => {
    setTitAlbertCount(count);
    setError('');
  };

  const handleStartGame = () => {
    const validationError = validateSetup();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Store game configuration in sessionStorage for the join page
    const gameConfig = {
      titAlbertCount,
      specialRoles: getSelectedSpecialRoles()
    };
    
    sessionStorage.setItem('titAlbertConfig', JSON.stringify(gameConfig));
    navigate('/games/tit-albert/join');
  };

  return (
    <div className="container">
      <button 
        className="back-button"
        onClick={() => navigate('/')}
        title="Back to Main Menu"
      >
        ←
      </button>
      
      <div className="card">
        <h1 className="title">Tit Albert Setup</h1>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Number of Tit Albert</label>
          <select
            className="select"
            value={titAlbertCount}
            onChange={(e) => handleTitAlbertCountChange(parseInt(e.target.value))}
          >
            {Array.from({ length: 4 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num} Tit Albert</option>
            ))}
          </select>
          <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
            Will be validated against actual number of players when roles are assigned
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Roles</label>
          <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#718096' }}>
            Select additional roles for more interesting gameplay
          </div>
          
          {specialRolesList.map(role => (
            <div key={role.id} className="checkbox-container">
              <input
                type="checkbox"
                id={role.id}
                checked={specialRoles[role.id]}
                onChange={() => handleSpecialRoleChange(role.id)}
              />
              <label htmlFor={role.id} className="checkbox-label">
                <div>
                  <strong>{role.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '2px' }}>
                    {role.description}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div style={{ 
          background: 'rgba(102, 126, 234, 0.1)', 
          padding: '15px', 
          borderRadius: '10px',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#4a5568' }}>Game Configuration</h3>
          <div style={{ color: '#2d3748' }}>
            <div>🐺 Tit Albert: <strong>{titAlbertCount}</strong></div>
            <div>⭐ Special Roles: <strong>{getSelectedSpecialRoles().length}</strong></div>
            <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '10px' }}>
              👥 Player count will be determined by how many join the game
            </div>
            <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
              🏘️ Remaining players will be assigned as Vilazwas (regular villagers)
            </div>
          </div>
        </div>

        <button
          className="button"
          onClick={handleStartGame}
          style={{ fontSize: '1.3rem', padding: '20px' }}
        >
          🎲 Start Game Setup
        </button>

        {qrCodeUrl && (
          <div className="qr-container">
            <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>
              🔗 Players Join Here
            </h3>
            <div className="qr-code">
              <img src={qrCodeUrl} alt="Join Game QR Code" />
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#718096',
              marginTop: '10px',
              wordBreak: 'break-all'
            }}>
              {serverUrl}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#a0aec0',
              marginTop: '5px'
            }}>
              Scan QR code or visit URL to join
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '25px', 
          padding: '15px',
          background: 'rgba(237, 137, 54, 0.1)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          color: '#c05621'
        }}>
          <strong>💡 Tip:</strong> One person should be the moderator. 
          When joining the game, enter "moderator" as your name to access game controls.
        </div>
      </div>
    </div>
  );
};

export default TitAlbertSetup;