const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import custom modules
const { ROLES, ROLE_NAMES } = require('./src/constants/roles');
const { GAME_CONFIG, SOCKET_EVENTS } = require('./src/constants/gameConfig');
const GameState = require('./src/models/GameState');
const { createRoleArray, validateGameConfig } = require('./src/utils/gameUtils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  console.log('Looking for frontend build at:', buildPath);
  
  // Check if build directory exists
  const fs = require('fs');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Frontend build directory found');
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      const indexPath = path.join(buildPath, 'index.html');
      console.log('Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    });
  } else {
    console.log('❌ Frontend build directory not found at:', buildPath);
    console.log('Available files in parent directory:');
    try {
      const parentDir = path.join(__dirname, '..');
      console.log(fs.readdirSync(parentDir));
    } catch (err) {
      console.log('Could not list parent directory:', err.message);
    }
  }
}

// Game state
const gameState = new GameState();



// Socket.IO connection handling
io.on(SOCKET_EVENTS.CONNECT, (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Handle player joining
  socket.on(SOCKET_EVENTS.JOIN, (playerName) => {
    if (!playerName || playerName.trim() === '') {
      socket.emit(SOCKET_EVENTS.ERROR, 'Please enter a valid name');
      return;
    }
    
    const trimmedName = playerName.trim();
    
    // Check if moderator
    if (trimmedName.toLowerCase() === GAME_CONFIG.MODERATOR_NAME) {
      gameState.setModerator(socket.id);
      gameState.addPlayer(socket.id, {
        name: trimmedName,
        role: null,
        isModerator: true
      });
      
      // Send current game state to reconnecting moderator
      if (gameState.gameStarted) {
        const roleAssignments = gameState.getNonModeratorPlayers()
          .filter(p => p.role)
          .map(p => ({
            name: p.name,
            role: p.role
          }));
        
        socket.emit(SOCKET_EVENTS.ALL_ROLES_ASSIGNED, roleAssignments);

      }
      
      socket.emit(SOCKET_EVENTS.JOIN_SUCCESS, {
        name: trimmedName,
        isModerator: true,
        isSpectator: false
      });
    } else {
      // Check if name is already taken (in both players and spectators)
      const allParticipants = [
        ...gameState.getNonModeratorPlayers(),
        ...gameState.getSpectators()
      ];
      const existingPlayer = allParticipants
        .find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      
      if (existingPlayer) {
        socket.emit(SOCKET_EVENTS.ERROR, 'Name already taken');
        return;
      }
      
      // Add as player or spectator based on game state
      const isSpectator = gameState.gameStarted && gameState.roundStarted;
      
      gameState.addPlayer(socket.id, {
        name: trimmedName,
        role: null,
        isModerator: false
      });
      
      socket.emit(SOCKET_EVENTS.JOIN_SUCCESS, {
        name: trimmedName,
        isModerator: false,
        isSpectator: isSpectator
      });
      
      if (isSpectator) {
        // Send all current roles to spectator (only if roles have been assigned)
        const playersWithRoles = gameState.getNonModeratorPlayers().filter(p => p.role);
        
        if (playersWithRoles.length > 0) {
          const allRoles = playersWithRoles.map(p => ({
            name: p.name,
            role: p.role,
            isAlive: p.isAlive !== false
          }));
          
          socket.emit(SOCKET_EVENTS.PLAYER_DIED, { allRoles });
        }
        
        socket.emit(SOCKET_EVENTS.SPECTATOR_JOINED, {
          message: 'You joined as a spectator. You can watch the current game and will be able to play in the next round.'
        });
      }
    }
    
    // Broadcast updated player list
    broadcastPlayerList();
  });
  
  // Handle role assignment (moderator only)
  socket.on(SOCKET_EVENTS.ASSIGN_ROLES, (config) => {
    if (!gameState.isModerator(socket.id)) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Only moderator can assign roles');
      return;
    }
    
    const { playerCount, titAlbertCount, specialRoles } = config;
    
    // Validation
    const validation = validateGameConfig({ playerCount, titAlbertCount, specialRoles });
    if (!validation.isValid) {
      socket.emit(SOCKET_EVENTS.ERROR, validation.error);
      return;
    }
    
    const nonModeratorPlayers = gameState.getNonModeratorPlayers();
    
    if (nonModeratorPlayers.length !== playerCount) {
      socket.emit(SOCKET_EVENTS.ERROR, `Expected ${playerCount} players, but have ${nonModeratorPlayers.length}`);
      return;
    }
    
    // Create and assign roles
    const roles = createRoleArray(playerCount, titAlbertCount, specialRoles);

    gameState.roles = roles;
    gameState.startGame();
    
    // Assign roles to players
    nonModeratorPlayers.forEach((player, index) => {
      player.role = roles[index];
      gameState.players.set(player.id, player);
      

      
      // Send role to player
      io.to(player.id).emit('roleAssigned', {
        role: ROLES[roles[index]]
      });
    });
    
    // Send role list to moderator
    const roleAssignments = nonModeratorPlayers.map((player, index) => ({
      name: player.name,
      role: roles[index]
    }));
    
    socket.emit('allRolesAssigned', roleAssignments);
    
    // Broadcast updated game state to all clients
    broadcastPlayerList();
    

  });
  
  // Handle getting player list
  socket.on('getPlayerList', () => {
    broadcastPlayerList();
  });
  
  // Handle reset game (moderator only)
  socket.on(SOCKET_EVENTS.RESET_GAME, () => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Only moderator can reset the game');
      return;
    }
    
    // Reset game state using GameState method (this handles spectator promotion)
    gameState.resetGame();
    
    // Notify all players
    io.emit(SOCKET_EVENTS.GAME_RESET);
    
    // Confirm moderator status to the moderator
    socket.emit(SOCKET_EVENTS.MODERATOR_STATUS_CONFIRMED, {
      isModerator: true,
      message: 'You remain the moderator after reset'
    });
    
    broadcastPlayerList();
    

  });

  // Handle start round (moderator only)
  socket.on('startRound', () => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit('error', 'Only moderator can start rounds');
      return;
    }

    if (!gameState.gameStarted) {
      socket.emit('error', 'Assign roles first before starting a round');
      return;
    }

    gameState.roundStarted = true;
    
    // Notify all players that the round has started
    io.emit('roundStarted');
    broadcastPlayerList();
    

  });

  // Handle kill player (moderator only)
  socket.on('killPlayer', (playerId) => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit('error', 'Only moderator can kill players');
      return;
    }

    if (!gameState.roundStarted) {
      socket.emit('error', 'Start a round first before killing players');
      return;
    }

    if (!gameState.players.has(playerId)) {
      socket.emit('error', 'Player not found');
      return;
    }

    const player = gameState.players.get(playerId);
    if (player.isModerator) {
      socket.emit('error', 'Cannot kill the moderator');
      return;
    }

    if (gameState.deadPlayers.has(playerId)) {
      socket.emit('error', 'Player is already dead');
      return;
    }

    // Mark player as dead
    player.isAlive = false;
    player.isDead = true;
    gameState.deadPlayers.add(playerId);
    gameState.players.set(playerId, player);

    // Send all role assignments to the dead player
    const allRoleAssignments = Array.from(gameState.players.values())
      .filter(p => !p.isModerator && p.role)
      .map(p => ({
        name: p.name,
        role: p.role,
        isAlive: !gameState.deadPlayers.has(p.id)
      }));

    io.to(playerId).emit('playerDied', {
      message: 'You have been eliminated!',
      allRoles: allRoleAssignments
    });

    // Notify all players about the death
    io.emit('playerKilled', {
      playerName: player.name,
      playerId: playerId
    });

    broadcastPlayerList();
    

  });

  // Handle revive player (moderator only)
  socket.on('revivePlayer', (playerId) => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit('error', 'Only moderator can revive players');
      return;
    }

    if (!gameState.players.has(playerId)) {
      socket.emit('error', 'Player not found');
      return;
    }

    const player = gameState.players.get(playerId);
    if (!gameState.deadPlayers.has(playerId)) {
      socket.emit('error', 'Player is not dead');
      return;
    }

    // Revive player
    player.isAlive = true;
    player.isDead = false;
    gameState.deadPlayers.delete(playerId);
    gameState.players.set(playerId, player);

    // Send role back to player
    io.to(playerId).emit('playerRevived', {
      message: 'You have been revived!',
      role: ROLES[player.role]
    });

    // Notify all players about the revival
    io.emit('playerRevived', {
      playerName: player.name,
      playerId: playerId
    });

    broadcastPlayerList();
    

  });

  // Handle Sefvilaz assignment (moderator only)
  socket.on(SOCKET_EVENTS.ASSIGN_SEFVILAZ, (playerId) => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Only moderator can assign Sefvilaz');
      return;
    }

    if (!gameState.roundStarted) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Round must be active to assign Sefvilaz');
      return;
    }

    const player = gameState.getPlayer(playerId);
    if (!player || player.isModerator || gameState.isSpectator(playerId)) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Invalid player for Sefvilaz assignment');
      return;
    }

    // Assign Sefvilaz to the player
    gameState.setSefvilazPlayer(playerId);

    // Notify all players
    io.emit(SOCKET_EVENTS.SEFVILAZ_ASSIGNED, {
      playerName: player.name,
      playerId: playerId
    });

    broadcastPlayerList();

  });

  // Handle Sefvilaz removal (moderator only)
  socket.on(SOCKET_EVENTS.REMOVE_SEFVILAZ, () => {
    if (socket.id !== gameState.moderatorId) {
      socket.emit(SOCKET_EVENTS.ERROR, 'Only moderator can remove Sefvilaz');
      return;
    }

    const currentHolder = gameState.getSefvilazPlayer();
    if (!currentHolder) {
      socket.emit(SOCKET_EVENTS.ERROR, 'No player currently has Sefvilaz');
      return;
    }

    // Remove Sefvilaz
    gameState.removeSefvilaz();

    // Notify all players
    io.emit(SOCKET_EVENTS.SEFVILAZ_REMOVED, {
      playerName: currentHolder.name,
      playerId: currentHolder.id
    });

    broadcastPlayerList();

  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    if (gameState.players.has(socket.id)) {
      const player = gameState.players.get(socket.id);
      console.log(`${player.name} left the game`);
      
      if (player.isModerator) {
        gameState.moderatorId = null;
      }
      
      gameState.players.delete(socket.id);
      broadcastPlayerList();
    }
  });
  
  function broadcastPlayerList() {
    const playerList = Array.from(gameState.players.values())
      .filter(p => !p.isModerator)
      .map(p => ({
        id: p.id,
        name: p.name,
        hasRole: !!p.role,
        isAlive: p.isAlive !== false, // Default to alive if not set
        isDead: !!p.isDead, // Convert to boolean, default to false
        isSpectator: false,
        hasSefvilaz: gameState.hasSefvilaz(p.id) // Check if player has Sefvilaz
      }));

    const spectatorList = gameState.getSpectators()
      .map(s => ({
        id: s.id,
        name: s.name,
        isSpectator: true
      }));
    
    // Debug logging
    const mayorPlayer = playerList.find(p => p.hasSefvilaz);
    console.log('Broadcasting player list - Current Mayor:', mayorPlayer?.name || 'None');
    console.log('Sefvilaz player ID in GameState:', gameState.sefvilazPlayerId);
    
    io.emit(SOCKET_EVENTS.PLAYER_LIST_UPDATE, {
      players: playerList,
      spectators: spectatorList,
      gameStarted: gameState.gameStarted,
      roundStarted: gameState.roundStarted,
      moderatorConnected: !!gameState.moderatorId,
      deadPlayersCount: gameState.deadPlayers.size
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', players: gameState.players.size });
});

// Get server IP for QR code generation
app.get('/api/server-info', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
      }
    });
  });
  
  res.json({
    ip: localIP,
    port: PORT,
    url: `http://${localIP}:${PORT}`
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ti-Albert Werewolf server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  
  // Get and display local network IP
  const os = require('os');
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Network: http://${iface.address}:${PORT}`);
      }
    });
  });
});