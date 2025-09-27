/**
 * Game configuration constants
 */

const GAME_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 15,
  DEFAULT_TIT_ALBERT_COUNT: 1,
  MODERATOR_NAME: 'moderator'
};

const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Player events
  JOIN: 'join',
  JOIN_SUCCESS: 'joinSuccess',
  JOIN_AS_SPECTATOR: 'joinAsSpectator',
  SPECTATOR_JOINED: 'spectatorJoined',
  
  // Game management events
  ASSIGN_ROLES: 'assignRoles',
  ROLE_ASSIGNED: 'roleAssigned',
  ALL_ROLES_ASSIGNED: 'allRolesAssigned',
  RESET_GAME: 'resetGame',
  GAME_RESET: 'gameReset',
  
  // Round management events
  START_ROUND: 'startRound',
  ROUND_STARTED: 'roundStarted',
  
  // Player management events
  KILL_PLAYER: 'killPlayer',
  PLAYER_KILLED: 'playerKilled',
  PLAYER_DIED: 'playerDied',
  REVIVE_PLAYER: 'revivePlayer',
  PLAYER_REVIVED: 'playerRevived',
  
  // Sefvilaz role management events
  ASSIGN_SEFVILAZ: 'assignSefvilaz',
  SEFVILAZ_ASSIGNED: 'sefvilazAssigned',
  REMOVE_SEFVILAZ: 'removeSefvilaz',
  SEFVILAZ_REMOVED: 'sefvilazRemoved',
  
  // Status events
  PLAYER_LIST_UPDATE: 'playerListUpdate',
  GET_PLAYER_LIST: 'getPlayerList',
  SPECTATOR_LIST_UPDATE: 'spectatorListUpdate',
  MODERATOR_STATUS_CONFIRMED: 'moderatorStatusConfirmed',
  ERROR: 'error'
};

const GAME_STATES = {
  WAITING: 'waiting',
  READY: 'ready',
  IN_PROGRESS: 'inProgress',
  ROUND_ACTIVE: 'roundActive'
};

module.exports = {
  GAME_CONFIG,
  SOCKET_EVENTS,
  GAME_STATES
};