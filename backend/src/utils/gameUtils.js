/**
 * Game utility functions
 */

const { ROLES, ROLE_NAMES } = require('../constants/roles');

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create role distribution array
 * @param {number} playerCount - Total number of players
 * @param {number} titAlbertCount - Number of Tit Albert roles
 * @param {Array} specialRoles - Array of special role names
 * @returns {Array} - Shuffled roles array
 */
function createRoleArray(playerCount, titAlbertCount, specialRoles) {
  const roles = [];
  
  console.log(`Creating roles for ${playerCount} players, ${titAlbertCount} Tit Albert, special roles:`, specialRoles);
  
  // Add Tit Albert (werewolves)
  for (let i = 0; i < titAlbertCount; i++) {
    roles.push(ROLE_NAMES.TIT_ALBERT);
    console.log(`Added Tit Albert role ${i + 1}`);
  }
  
  // Add special roles (excluding Sefvilaz which is a transferable secondary role)
  specialRoles.forEach(role => {
    if (role === ROLE_NAMES.SEFVILAZ) {
      console.log(`Skipping ${role} - it's a transferable secondary role, not assigned at start`);
      return;
    }
    
    if (ROLES[role]) {
      roles.push(role);
      console.log(`Added special role: ${role}`);
    } else {
      console.log(`Warning: Role "${role}" not found in ROLES object`);
    }
  });
  
  // Fill remaining slots with Vilazwas (villagers)
  const remainingSlots = playerCount - roles.length;
  for (let i = 0; i < remainingSlots; i++) {
    roles.push(ROLE_NAMES.VILAZWAS);
  }
  
  console.log('Final roles array before shuffle:', roles);
  const shuffledRoles = shuffleArray(roles);
  console.log('Final roles array after shuffle:', shuffledRoles);
  
  return shuffledRoles;
}

/**
 * Validate game configuration
 * @param {Object} config - Game configuration
 * @returns {Object} - Validation result
 */
function validateGameConfig(config) {
  const { playerCount, titAlbertCount, specialRoles } = config;
  
  if (!playerCount || !titAlbertCount || !Array.isArray(specialRoles)) {
    return { isValid: false, error: 'Invalid configuration parameters' };
  }
  
  const totalSpecialRoles = specialRoles.length + titAlbertCount;
  if (totalSpecialRoles > playerCount) {
    return { 
      isValid: false, 
      error: `Too many special roles (${totalSpecialRoles}) for ${playerCount} players` 
    };
  }
  
  if (totalSpecialRoles >= playerCount) {
    return { 
      isValid: false, 
      error: `Need at least 1 regular villager. Currently ${totalSpecialRoles} special roles for ${playerCount} players` 
    };
  }
  
  return { isValid: true };
}

module.exports = {
  shuffleArray,
  createRoleArray,
  validateGameConfig
};