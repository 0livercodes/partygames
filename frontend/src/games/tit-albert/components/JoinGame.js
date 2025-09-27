import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { TIT_ALBERT_SOCKET_EVENTS } from '../constants/socketEvents';
import { TIT_ALBERT_ROLE_NAMES, getTitAlbertRoleIcon } from '../constants/roles';

const JoinGame = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [spectatorList, setSpectatorList] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [moderatorConnected, setModeratorConnected] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);
  const [deadPlayersCount, setDeadPlayersCount] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    // Load game configuration from session storage
    const config = sessionStorage.getItem('titAlbertConfig');
    if (config) {
      setGameConfig(JSON.parse(config));
    }

    // Connect to socket server
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.JOIN_SUCCESS, (data) => {
      setIsJoined(true);
      setIsModerator(data.isModerator);
      setIsSpectator(data.isSpectator || false);
      
      if (data.isModerator) {
        setSuccess('Joined as Moderator');
      } else if (data.isSpectator) {
        setSuccess(`Joined as Spectator - You can watch the current game and will play in the next round`);
      } else {
        setSuccess(`Joined as ${data.name}`);
      }
      
      setError('');
      
      // If moderator, request current player list and game state
      if (data.isModerator) {
        newSocket.emit(TIT_ALBERT_SOCKET_EVENTS.GET_PLAYER_LIST);
      }
    });

    newSocket.on('error', (message) => {
      setError(message);
      setSuccess('');
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.PLAYER_LIST_UPDATE, (data) => {
      setPlayerList(data.players || []);
      setSpectatorList(data.spectators || []);
      setGameStarted(data.gameStarted);
      setRoundStarted(data.roundStarted || false);
      setModeratorConnected(data.moderatorConnected);
      setDeadPlayersCount(data.deadPlayersCount || 0);
      
      // Ensure moderator status is preserved - if we're connected and moderator is connected,
      // and our name is 'moderator' (case insensitive), we should be the moderator
      if (isJoined && playerName.toLowerCase() === 'moderator' && data.moderatorConnected) {
        setIsModerator(true);
      }
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.SPECTATOR_JOINED, (data) => {
      setSuccess(data.message);
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.ROLE_ASSIGNED, (data) => {
      setPlayerRole(data.role);
      setSuccess('Role assigned! Game starting...');
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.ALL_ROLES_ASSIGNED, (assignments) => {
      setRoleAssignments(assignments);
      if (assignments.length > 0) {
        // Set game as started when roles are assigned
        setGameStarted(true);
        // Check if this is from a fresh assignment or reconnection
        const hasCurrentAssignments = roleAssignments.length > 0;
        setSuccess(hasCurrentAssignments ? 'All roles assigned successfully!' : 'Reconnected - showing current game state');
      }
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.GAME_RESET, () => {
      setPlayerRole(null);
      setRoleAssignments([]);
      setGameStarted(false);
      setRoundStarted(false);
      setIsDead(false);
      setIsSpectator(false); // Reset spectator status
      setAllRoles([]);
      setDeadPlayersCount(0);
      setSuccess('Game has been reset - all players revived');
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.ROUND_STARTED, () => {
      setRoundStarted(true);
      setSuccess('Round has started!');
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.PLAYER_DIED, (data) => {
      if (isSpectator) {
        // For spectators, just update the roles view
        setAllRoles(data.allRoles);
      } else {
        // For dead players
        setIsDead(true);
        setAllRoles(data.allRoles);
        setSuccess('You have been eliminated! You can now see all roles.');
      }
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.PLAYER_KILLED, (data) => {
      setSuccess(`${data.playerName} has been eliminated!`);
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.PLAYER_REVIVED, (data) => {
      if (data.role) {
        // This player was revived
        setIsDead(false);
        setAllRoles([]);
        setSuccess('You have been revived!');
      } else {
        // Another player was revived
        setSuccess(`${data.playerName} has been revived!`);
      }
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.SEFVILAZ_ASSIGNED, (data) => {
      setSuccess(`🏛️ ${data.playerName} has been granted the Sefvilaz (Mayor) role!`);
      // Request updated player list to refresh UI
      newSocket.emit(TIT_ALBERT_SOCKET_EVENTS.GET_PLAYER_LIST);
    });

    newSocket.on(TIT_ALBERT_SOCKET_EVENTS.SEFVILAZ_REMOVED, (data) => {
      setSuccess(`🏛️ Sefvilaz (Mayor) role has been removed from ${data.playerName}`);
      // Request updated player list to refresh UI
      newSocket.emit(TIT_ALBERT_SOCKET_EVENTS.GET_PLAYER_LIST);
    });

    newSocket.on('moderatorStatusConfirmed', (data) => {
      setIsModerator(true);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter a name');
      return;
    }
    
    if (socket && isConnected) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.JOIN, playerName.trim());
    } else {
      setError('Not connected to server');
    }
  };

  const handleAssignRoles = () => {
    if (!gameConfig) {
      setError('No game configuration found. Please go back to setup.');
      return;
    }

    if (playerList.length < 4) {
      setError(`Need at least 4 players to start. Currently have ${playerList.length}.`);
      return;
    }

    if (playerList.length > 15) {
      setError(`Maximum 15 players supported. Currently have ${playerList.length}.`);
      return;
    }

    const totalSpecialRoles = (gameConfig.specialRoles || []).length + (gameConfig.titAlbertCount || 1);
    if (totalSpecialRoles >= playerList.length) {
      setError(`Too many special roles (${totalSpecialRoles}) for ${playerList.length} players. Need at least 1 regular villager.`);
      return;
    }

    // Clear previous role assignments
    setRoleAssignments([]);
    setError('');

    const config = {
      playerCount: playerList.length,
      titAlbertCount: gameConfig.titAlbertCount || 1,
      specialRoles: gameConfig.specialRoles || []
    };

    console.log('Sending config to backend:', config);
    socket.emit(TIT_ALBERT_SOCKET_EVENTS.ASSIGN_ROLES, config);
  };

  const handleResetGame = () => {
    if (socket) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.RESET_GAME);
      // Clear local state
      setRoleAssignments([]);
      setGameStarted(false);
      setRoundStarted(false);
      setIsDead(false);
      setIsSpectator(false); // Reset spectator status
      setAllRoles([]);
      setDeadPlayersCount(0);
      setError('');
      setSuccess('');
    }
  };

  const handleStartRound = () => {
    if (socket && gameStarted) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.START_ROUND);
    } else {
      setError('Assign roles first before starting a round');
    }
  };

  const handleKillPlayer = (playerId) => {
    if (socket && roundStarted) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.KILL_PLAYER, playerId);
    } else {
      setError('Start a round first before killing players');
    }
  };

  const handleRevivePlayer = (playerId) => {
    if (socket) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.REVIVE_PLAYER, playerId);
    }
  };

  const handleAssignSefvilaz = (playerId) => {
    if (socket && roundStarted) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.ASSIGN_SEFVILAZ, playerId);
    } else {
      setError('Round must be active to assign Sefvilaz');
    }
  };

  const handleRemoveSefvilaz = () => {
    if (socket && roundStarted) {
      socket.emit(TIT_ALBERT_SOCKET_EVENTS.REMOVE_SEFVILAZ);
    }
  };

  const handleBackToSetup = () => {
    navigate('/games/tit-albert/setup');
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const getConnectionStatus = () => {
    if (!isConnected) return { text: 'Disconnected', class: 'status-disconnected' };
    if (!isJoined) return { text: 'Connected', class: 'status-connected' };
    if (isJoined && !gameStarted) return { text: 'Waiting', class: 'status-waiting' };
    return { text: 'In Game', class: 'status-connected' };
  };

  const status = getConnectionStatus();

  return (
    <div className="container">
      <button 
        className="back-button"
        onClick={handleBackToMenu}
        title="Back to Main Menu"
      >
        ←
      </button>
      
      <div className="card">
        <h1 className="title">Join Tit Albert Game</h1>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <span className={`status-indicator ${status.class}`}></span>
          <span style={{ fontWeight: '500' }}>Status: {status.text}</span>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {!isJoined ? (
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="form-label">Enter Your Name</label>
              <input
                type="text"
                className="input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name..."
                disabled={!isConnected}
              />
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
                Enter "moderator" to access game controls
              </div>
            </div>
            
            <button
              type="submit"
              className="button"
              disabled={!isConnected || !playerName.trim()}
            >
              {isConnected ? '🎮 Join Game' : '⏳ Connecting...'}
            </button>
          </form>
        ) : (
          <div>
            {/* Spectator Status Display */}
            {isSpectator && !isDead && (
              <div style={{
                marginBottom: '24px',
                padding: '24px',
                backgroundColor: '#6366f1',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px', 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    👁️
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.4rem', 
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      Spectator
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      opacity: 0.9,
                      lineHeight: '1.4'
                    }}>
                      You're watching the current game. You'll be able to play in the next round!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Player Role Display - Enhanced Card */}
            {playerRole && !isDead && !isSpectator && (
              <div style={{
                marginBottom: '24px',
                padding: '24px',
                backgroundColor: '#059669',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px', 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {getTitAlbertRoleIcon(playerRole.name)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.4rem', 
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {playerRole.name}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      opacity: 0.9,
                      lineHeight: '1.4'
                    }}>
                      {playerRole.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dead Player / Spectator - All Roles Display */}
            {(isDead || (isSpectator && allRoles.length > 0)) && (
              <div style={{
                marginBottom: '24px',
                padding: '24px',
                backgroundColor: isSpectator ? '#6366f1' : '#dc2626',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{ 
                  margin: 0,
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {isSpectator ? '👁️ Spectator View - All Roles Visible' : '💀 You are eliminated - All Roles Revealed'}
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {allRoles.map((playerRole, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      opacity: playerRole.isAlive ? 1 : 0.6,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <span style={{
                        fontWeight: '500',
                        textDecoration: playerRole.isAlive ? 'none' : 'line-through',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {getTitAlbertRoleIcon(playerRole.role)}
                        </span>
                        {playerRole.isAlive ? '' : '💀 '}{playerRole.name}
                      </span>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {playerRole.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderator Controls */}
            {isModerator && (
              <div style={{
                marginBottom: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
              }}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    🎯
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: '#1f2937' }}>
                      Moderator Controls
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                      Manage the game session
                    </div>
                  </div>
                  {/* Current Mayor Badge */}
                  {(() => {
                    const mayorPlayer = playerList.find(p => p.hasSefvilaz);
                    return mayorPlayer && (
                      <div style={{ 
                        backgroundColor: '#fbbf24',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🏛️ {mayorPlayer.name}
                      </div>
                    );
                  })()}
                </div>
                
                {/* Game Info */}
                {gameConfig && (
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>{playerList.length} players</strong> • <strong>{gameConfig.titAlbertCount}</strong> Tit Albert • <strong>{gameConfig.specialRoles.length}</strong> special roles
                    {spectatorList.length > 0 && (
                      <span> • <strong>{spectatorList.length}</strong> spectator{spectatorList.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <button
                    className="button"
                    onClick={handleAssignRoles}
                    disabled={!gameConfig || playerList.length < 4 || gameStarted}
                    style={{ 
                      backgroundColor: gameStarted ? '#10b981' : '#3b82f6',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: (!gameConfig || playerList.length < 4 || gameStarted) ? 'not-allowed' : 'pointer',
                      opacity: (!gameConfig || playerList.length < 4 || gameStarted) ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      flex: '1',
                      minWidth: '140px'
                    }}
                  >
                    {gameStarted ? '✅ Roles Assigned' : '🎲 Assign Roles'}
                  </button>
                  
                  <button
                    className="button"
                    onClick={handleResetGame}
                    disabled={!gameStarted}
                    style={{ 
                      backgroundColor: '#ef4444',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: !gameStarted ? 'not-allowed' : 'pointer',
                      opacity: !gameStarted ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      flex: '1',
                      minWidth: '100px'
                    }}
                  >
                    🔄 Reset
                  </button>


                </div>

                {/* Secondary Actions */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                  <button
                    className="button"
                    onClick={handleStartRound}
                    disabled={!gameStarted || roundStarted}
                    style={{ 
                      width: '100%',
                      backgroundColor: (!gameStarted || roundStarted) ? '#f3f4f6' : '#059669',
                      border: 'none',
                      color: (!gameStarted || roundStarted) ? '#9ca3af' : 'white',
                      fontWeight: '600',
                      padding: '14px 20px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: (!gameStarted || roundStarted) ? 'not-allowed' : 'pointer',
                      marginBottom: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {!gameStarted ? '⏳ Assign Roles First' : 
                     roundStarted ? '⏸️ Round in Progress' : 
                     '▶️ Start Round'}
                  </button>

                  <button
                    className="button"
                    onClick={handleBackToSetup}
                    style={{ 
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      color: '#6b7280',
                      fontWeight: '500',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ⚙️ Back to Setup
                  </button>
                </div>
                
                {/* Mayor Management - Only during round */}
                {roundStarted && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>🏛️</span>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '0.95rem', 
                        fontWeight: '600',
                        color: '#92400e'
                      }}>
                        Mayor (Sefvilaz) Control
                      </h4>
                    </div>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: '#a16207', 
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}>
                      Assign or remove the transferable Mayor role during the round
                    </p>
                    <button
                      className="button"
                      onClick={handleRemoveSefvilaz}
                      style={{
                        width: '100%',
                        fontSize: '0.85rem',
                        padding: '10px 16px',
                        backgroundColor: '#d97706',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Remove Current Mayor
                    </button>
                  </div>
                )}

                {/* Game Stats */}
                {gameStarted && deadPlayersCount > 0 && (
                  <div style={{ 
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: '#dc2626',
                    fontWeight: '600',
                    marginTop: '16px'
                  }}>
                    💀 {deadPlayersCount} player{deadPlayersCount > 1 ? 's' : ''} eliminated
                  </div>
                )}
              </div>
            )}

            {/* Players List */}
            <div className="player-list" style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <h3 style={{ 
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  👥 Players {gameStarted && '& Roles'} 
                  <span style={{ 
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {playerList.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {spectatorList.length > 0 && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      👁️ {spectatorList.length} spectator{spectatorList.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: playerList.length < 4 ? '#dc2626' : '#059669',
                    fontWeight: '600'
                  }}>
                    {playerList.length < 4 ? `Need ${4 - playerList.length} more` : 'Ready!'}
                  </span>
                </div>
              </div>
              
              {playerList.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#718096',
                  fontSize: '0.9rem',
                  padding: '20px 0'
                }}>
                  Waiting for players to join...
                </div>
              ) : (
                playerList.map((player, index) => {
                  // Find the role for this player from roleAssignments (for moderator)
                  const playerRole = roleAssignments.find(assignment => assignment.name === player.name);
                  
                  return (
                    <div key={index} className="player-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: player.isDead ? '#fef2f2' : '#fafafa',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      border: `2px solid ${player.hasSefvilaz ? '#fbbf24' : player.isDead ? '#fca5a5' : '#e5e7eb'}`,
                      boxShadow: player.hasSefvilaz ? '0 2px 8px rgba(251, 191, 36, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                      opacity: player.isDead ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span className="player-name" style={{
                          fontSize: '1rem',
                          fontWeight: player.hasSefvilaz ? '700' : '600',
                          color: player.hasSefvilaz ? '#92400e' : player.isDead ? '#6b7280' : '#1f2937',
                          textDecoration: player.isDead ? 'line-through' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {player.isDead && '💀'}
                          {player.hasSefvilaz && <span style={{ fontSize: '1.1em' }}>🏛️</span>}
                          {player.name}
                        </span>
                        
                        {/* Role & Status Display */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Mayor Badge */}
                          {player.hasSefvilaz && (
                            <span style={{
                              backgroundColor: '#fbbf24',
                              color: '#92400e',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Mayor
                            </span>
                          )}
                          
                          {/* Role Display (for moderator when roles are assigned) */}
                          {isModerator && playerRole ? (
                            <span style={{
                              backgroundColor: playerRole.role === TIT_ALBERT_ROLE_NAMES.TIT_ALBERT ? '#fee2e2' : '#dcfce7',
                              color: playerRole.role === TIT_ALBERT_ROLE_NAMES.TIT_ALBERT ? '#dc2626' : '#16a34a',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>
                              {playerRole.role}
                            </span>
                          ) : (
                            <span style={{ 
                              fontSize: '0.8rem',
                              color: player.hasRole ? '#059669' : '#6b7280',
                              fontWeight: '500'
                            }}>
                              {player.hasRole ? '✓ Ready' : '⏳ Waiting'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Moderator Controls */}
                      {isModerator && roundStarted && player.hasRole && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {/* Kill/Revive Controls */}
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {player.isDead ? (
                              <button
                                className="button"
                                onClick={() => handleRevivePlayer(player.id)}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '4px 8px',
                                  backgroundColor: '#059669',
                                  borderColor: '#047857',
                                  color: 'white',
                                  borderRadius: '6px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                ↻ Revive
                              </button>
                            ) : (
                              <button
                                className="button"
                                onClick={() => handleKillPlayer(player.id)}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '4px 8px',
                                  backgroundColor: '#dc2626',
                                  borderColor: '#b91c1c',
                                  color: 'white',
                                  borderRadius: '6px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                ⚔️ Kill
                              </button>
                            )}
                          </div>
                          
                          {/* Sefvilaz Toggle Control */}
                          {!player.isDead && (
                            <button
                              className="button"
                              onClick={() => player.hasSefvilaz ? handleRemoveSefvilaz() : handleAssignSefvilaz(player.id)}
                              style={{
                                fontSize: '0.6rem',
                                padding: '3px 6px',
                                backgroundColor: player.hasSefvilaz ? '#dc2626' : '#fbbf24',
                                borderColor: player.hasSefvilaz ? '#b91c1c' : '#f59e0b',
                                color: player.hasSefvilaz ? 'white' : '#92400e',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                                fontWeight: '500'
                              }}
                            >
                              {player.hasSefvilaz ? '🏛️ Remove Mayor' : '🏛️ Make Mayor'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Spectators List */}
              {spectatorList.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ 
                    marginBottom: '10px', 
                    color: '#4a5568',
                    fontSize: '1rem'
                  }}>
                    👁️ Spectators ({spectatorList.length})
                  </h4>
                  {spectatorList.map((spectator, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#e6fffa',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      border: '1px solid #b2f5ea'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#2d3748' }}>
                        👁️ {spectator.name}
                      </span>
                      <span style={{ 
                        fontSize: '0.7rem',
                        color: '#718096',
                        marginLeft: 'auto'
                      }}>
                        Will play next round
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Game Status */}
            <div style={{ 
              marginTop: '20px',
              padding: '20px',
              backgroundColor: gameStarted ? '#f0fdf4' : '#fef3c7',
              border: `2px solid ${gameStarted ? '#16a34a' : '#f59e0b'}`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              {gameStarted ? (
                <div style={{ color: '#15803d' }}>
                  <strong>🎉 Game Started!</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: '8px', color: '#374151' }}>
                    All roles have been assigned
                    {roundStarted && (
                      <div style={{ marginTop: '8px', color: '#374151' }}>
                        ⚔️ Round in progress
                        {deadPlayersCount > 0 && ` • ${deadPlayersCount} eliminated`}
                        {spectatorList.length > 0 && ` • ${spectatorList.length} spectating`}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#d97706' }}>
                  <strong>⏳ Waiting to Start</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: '8px', color: '#374151' }}>
                    {!moderatorConnected && 'Waiting for moderator to join...'}
                    {moderatorConnected && playerList.length < 4 && 
                      `Need ${4 - playerList.length} more players (minimum 4)`}
                    {moderatorConnected && playerList.length >= 4 && 
                      'Ready! Moderator can assign roles.'}
                    {spectatorList.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        {spectatorList.length} spectator{spectatorList.length > 1 ? 's' : ''} waiting for next round
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGame;