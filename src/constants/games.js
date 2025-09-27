/**
 * Game type definitions and metadata
 */

export const GAME_TYPES = {
  TIT_ALBERT: 'tit-albert',
  MAFIA: 'mafia',
  AMONG_US: 'among_us'
  // Add more games here in the future
};

export const GAME_METADATA = {
  [GAME_TYPES.TIT_ALBERT]: {
    id: GAME_TYPES.TIT_ALBERT,
    name: 'Tit Albert',
    description: 'A social deduction game where villagers try to eliminate the Tit Alberts among them.',
    icon: '🐺',
    minPlayers: 4,
    maxPlayers: 15,
    setupRoute: '/games/tit-albert/setup',
    joinRoute: '/games/tit-albert/join',
    color: '#667eea'
  }
  // Future games can be added here
  // [GAME_TYPES.MAFIA]: {
  //   id: GAME_TYPES.MAFIA,
  //   name: 'Mafia',
  //   description: 'Classic mafia game...',
  //   icon: '🕴️',
  //   minPlayers: 5,
  //   maxPlayers: 12,
  //   setupRoute: '/games/mafia/setup',
  //   joinRoute: '/games/mafia/join',
  //   color: '#ff6b6b'
  // }
};

export const getGameMetadata = (gameType) => {
  return GAME_METADATA[gameType] || null;
};