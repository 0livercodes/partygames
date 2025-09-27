/**
 * Tit Albert game socket events
 */

export const TIT_ALBERT_SOCKET_EVENTS = {
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