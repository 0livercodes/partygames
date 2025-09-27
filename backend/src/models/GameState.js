/**
 * Game state management utilities
 */

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.players = new Map();
    this.spectators = new Map();
    this.gameStarted = false;
    this.roundStarted = false;
    this.roles = [];
    this.moderatorId = null;
    this.deadPlayers = new Set();
    this.sefvilazPlayerId = null; // Track who has the Sefvilaz role
  }

  addPlayer(id, playerData) {
    // If game is started and round is active, add as spectator
    if (this.gameStarted && this.roundStarted) {
      this.addSpectator(id, playerData);
      return;
    }
    
    this.players.set(id, {
      id,
      isAlive: true,
      isDead: false,
      isSpectator: false,
      ...playerData
    });
  }

  addSpectator(id, playerData) {
    this.spectators.set(id, {
      id,
      isSpectator: true,
      ...playerData
    });
  }

  removePlayer(id) {
    const player = this.players.get(id) || this.spectators.get(id);
    if (player?.isModerator) {
      this.moderatorId = null;
    }
    this.players.delete(id);
    this.spectators.delete(id);
  }

  getPlayer(id) {
    return this.players.get(id) || this.spectators.get(id);
  }

  getSpectators() {
    return Array.from(this.spectators.values());
  }

  isSpectator(id) {
    return this.spectators.has(id);
  }

  getNonModeratorPlayers() {
    return Array.from(this.players.values()).filter(p => !p.isModerator);
  }

  killPlayer(playerId) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isAlive = false;
      player.isDead = true;
      this.deadPlayers.add(playerId);
      this.players.set(playerId, player);
    }
    return player;
  }

  revivePlayer(playerId) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isAlive = true;
      player.isDead = false;
      this.deadPlayers.delete(playerId);
      this.players.set(playerId, player);
    }
    return player;
  }

  setModerator(id) {
    this.moderatorId = id;
  }

  isModerator(id) {
    return this.moderatorId === id;
  }

  startGame() {
    this.gameStarted = true;
  }

  startRound() {
    this.roundStarted = true;
  }

  resetGame() {
    this.gameStarted = false;
    this.roundStarted = false;
    this.roles = [];
    this.deadPlayers.clear();
    
    // Reset player roles and life status but preserve moderator status
    this.players.forEach((player, id) => {
      player.role = null;
      player.isAlive = true;
      player.isDead = false;
      this.players.set(id, player);
    });

    // Promote spectators to players for next round
    this.spectators.forEach((spectator, id) => {
      if (!spectator.isModerator) {
        this.players.set(id, {
          ...spectator,
          isSpectator: false,
          isAlive: true,
          isDead: false,
          role: null
        });
      }
    });
    this.spectators.clear();
    
    // Clear Sefvilaz assignment
    this.sefvilazPlayerId = null;
  }

  // Sefvilaz role management methods
  setSefvilazPlayer(playerId) {
    // Simply update the sefvilazPlayerId - no need to set properties on player objects
    this.sefvilazPlayerId = playerId;
  }

  removeSefvilaz() {
    // Simply clear the sefvilazPlayerId
    this.sefvilazPlayerId = null;
  }

  getSefvilazPlayer() {
    return this.sefvilazPlayerId ? this.getPlayer(this.sefvilazPlayerId) : null;
  }

  hasSefvilaz(playerId) {
    return this.sefvilazPlayerId === playerId;
  }
}

module.exports = GameState;