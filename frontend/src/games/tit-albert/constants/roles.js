/**
 * Tit Albert game specific constants
 */

export const TIT_ALBERT_ROLE_NAMES = {
  TIT_ALBERT: 'Tit Albert',
  VILAZWAS: 'Vilazwas',
  BHAI_LOOKE: 'Bhai looké',
  CLIFFEURD: 'Cliffeurd',
  AGWA: 'Agwa',
  LONGANIS: 'Longanis',
  TIFI: 'Tifi',
  VOLER: 'Voler'
};

export const TIT_ALBERT_ROLE_ICONS = {
  [TIT_ALBERT_ROLE_NAMES.TIT_ALBERT]: '🐺',
  [TIT_ALBERT_ROLE_NAMES.VILAZWAS]: '👥',
  [TIT_ALBERT_ROLE_NAMES.BHAI_LOOKE]: '👁️',
  [TIT_ALBERT_ROLE_NAMES.CLIFFEURD]: '⚕️',
  [TIT_ALBERT_ROLE_NAMES.AGWA]: '🛡️',
  [TIT_ALBERT_ROLE_NAMES.LONGANIS]: '🏹',
  [TIT_ALBERT_ROLE_NAMES.TIFI]: '🧪',
  [TIT_ALBERT_ROLE_NAMES.VOLER]: '🎭'
};

export const TIT_ALBERT_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 15,
  DEFAULT_TIT_ALBERT_COUNT: 1,
  MODERATOR_NAME: 'moderator'
};

export const getTitAlbertRoleIcon = (roleName) => {
  return TIT_ALBERT_ROLE_ICONS[roleName] || '👤';
};