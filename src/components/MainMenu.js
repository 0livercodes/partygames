import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TYPES, GAME_METADATA } from '../constants/games';
import GameCard from './common/GameCard';

const MainMenu = () => {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // Check server status
    const checkServer = async () => {
      try {
        const response = await fetch(
          process.env.NODE_ENV === 'production' 
            ? '/api/health' 
            : 'http://localhost:3001/api/health'
        );
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online': return '#38a169';
      case 'offline': return '#e53e3e';
      default: return '#ed8936';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'online': return '🟢 Server Online';
      case 'offline': return '🔴 Server Offline';
      default: return '🟡 Checking...';
    }
  };

  // Handler functions
  const handleGameSelect = (game) => {
    if (!game.disabled && game.setupRoute) {
      navigate(game.setupRoute);
    }
  };

  const handleJoinGame = () => {
    // Navigate to the Tit Albert join page (default for now)
    navigate('/games/tit-albert/join');
  };

  // Available games - easily extensible
  const availableGames = [
    {
      ...GAME_METADATA[GAME_TYPES.TIT_ALBERT],
      disabled: serverStatus !== 'online'
    }
    // Future games can be added here:
    // {
    //   id: 'mafia',
    //   name: 'Mafia', 
    //   description: 'Classic mafia game...',
    //   icon: '🕴️',
    //   minPlayers: 5,
    //   maxPlayers: 12,
    //   setupRoute: '/games/mafia/setup',
    //   color: '#ff6b6b',
    //   disabled: true
    // }
  ];

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Ti-Albert</h1>
        <p className="subtitle">Party Games Hub</p>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '1.3rem', 
            marginBottom: '20px', 
            color: '#4a5568',
            textAlign: 'center'
          }}>
            Select a Game
          </h2>
          
          {availableGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => handleGameSelect(game)}
            />
          ))}
        </div>

        <div style={{ 
          borderTop: '2px solid #e2e8f0', 
          paddingTop: '25px',
          marginTop: '25px'
        }}>
          <h2 style={{ 
            fontSize: '1.3rem', 
            marginBottom: '20px', 
            color: '#4a5568',
            textAlign: 'center'
          }}>
            Or Join Existing Game
          </h2>
          
          <button
            className="button secondary"
            onClick={handleJoinGame}
            style={{
              fontSize: '1.2rem',
              padding: '18px'
            }}
          >
            🎮 Join Game
          </button>
        </div>

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#718096'
        }}>
          <p>Create games or join with friends locally</p>
          <p style={{ marginTop: '5px' }}>
            Connect to the same WiFi network
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;