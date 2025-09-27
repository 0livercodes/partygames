/**
 * Legacy role constants - for backward compatibility 
 * New code should use game-specific constants from /games/tit-albert/constants/
 */

export const ROLE_NAMES = {
  TIT_ALBERT: 'Tit Albert',
  VILAZWAS: 'Vilazwas',
  BHAI_LOOKE: 'Bhai looké',
  CLIFFEURD: 'Cliffeurd',
  AGWA: 'Agwa',
  LONGANIS: 'Longanis',
  TIFI: 'Tifi',
  SEFVILAZ: 'Sefvilaz',
  VOLER: 'Voler'
};

export const ROLE_ICONS = {
  [ROLE_NAMES.TIT_ALBERT]: '🐺',
  [ROLE_NAMES.VILAZWAS]: '👥',
  [ROLE_NAMES.BHAI_LOOKE]: '👁️',
  [ROLE_NAMES.CLIFFEURD]: '⚕️',
  [ROLE_NAMES.AGWA]: '🛡️',
  [ROLE_NAMES.LONGANIS]: '🏹',
  [ROLE_NAMES.TIFI]: '🧪',
  [ROLE_NAMES.SEFVILAZ]: '👑',
  [ROLE_NAMES.VOLER]: '🎭'
};

export const getRoleIcon = (roleName) => {
  return ROLE_ICONS[roleName] || '👤';
};