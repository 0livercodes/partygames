/**
 * Frontend socket event constants
 */

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Player events
  JOIN: 'join',
  JOIN_SUCCESS: 'joinSuccess',
  
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
  
  // Status events
  PLAYER_LIST_UPDATE: 'playerListUpdate',
  GET_PLAYER_LIST: 'getPlayerList',
  MODERATOR_STATUS_CONFIRMED: 'moderatorStatusConfirmed',
  ERROR: 'error'
};

export const GAME_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 15,
  DEFAULT_TIT_ALBERT_COUNT: 1,
  MODERATOR_NAME: 'moderator'
};