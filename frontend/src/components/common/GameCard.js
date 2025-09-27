import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable GameCard component for displaying game options in the main menu
 * @param {Object} props - Component props
 * @param {Object} props.game - Game metadata object
 * @param {boolean} props.disabled - Whether the game is disabled
 */
const GameCard = ({ game, disabled = false }) => {
  const navigate = useNavigate();

  const handleGameSelect = () => {
    if (!disabled) {
      navigate(game.setupRoute);
    }
  };

  return (
    <div 
      className={`game-card ${disabled ? 'disabled' : ''}`}
      onClick={handleGameSelect}
      style={{
        background: disabled ? '#f7fafc' : `linear-gradient(135deg, ${game.color}20, ${game.color}40)`,
        border: `2px solid ${disabled ? '#e2e8f0' : game.color}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        marginBottom: '16px',
        boxShadow: disabled ? 'none' : `0 4px 20px ${game.color}20`
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = `0 8px 32px ${game.color}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0px)';
          e.target.style.boxShadow = `0 4px 20px ${game.color}20`;
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontSize: '2.5rem',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: disabled ? '#e2e8f0' : `${game.color}20`
        }}>
          {game.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            fontWeight: '600',
            color: disabled ? '#a0aec0' : '#2d3748',
            marginBottom: '4px'
          }}>
            {game.name}
            {disabled && <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>(Coming Soon)</span>}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            color: disabled ? '#a0aec0' : '#4a5568',
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            {game.description}
          </p>
          <div style={{
            fontSize: '0.8rem',
            color: disabled ? '#a0aec0' : '#718096',
            display: 'flex',
            gap: '16px'
          }}>
            <span>👥 {game.minPlayers}-{game.maxPlayers} players</span>
            {!disabled && <span>🎮 Ready to play</span>}
          </div>
        </div>
        
        {!disabled && (
          <div style={{
            fontSize: '1.2rem',
            color: game.color,
            fontWeight: '600'
          }}>
            →
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;