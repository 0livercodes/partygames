/**
 * Game role definitions and constants
 */

const ROLE_TYPES = {
  WEREWOLF: 'werewolf',
  VILLAGER: 'villager',
  NEUTRAL: 'neutral'
};

const ROLE_NAMES = {
  TIT_ALBERT: 'Tit Albert',
  VILAZWAS: 'Vilazwas',
  BHAI_LOOKE: 'Bhai looké',
  CLIFFEURD: 'Cliffeurd',
  AGWA: 'Agwa',
  LONGANIS: 'Longanis',
  TIFI: 'Tifi',
  VOLER: 'Voler'
};

const ROLES = {
  [ROLE_NAMES.TIT_ALBERT]: {
    name: ROLE_NAMES.TIT_ALBERT,
    description: "To enn Tit Albert. Dan lannwit, to leve ansam ar lezot Tit Albert pou touy enn dimounn dan vilaz.",
    team: ROLE_TYPES.WEREWOLF,
    icon: "🐺"
  },
  [ROLE_NAMES.VILAZWAS]: {
    name: ROLE_NAMES.VILAZWAS,
    description: "To enn vilazwas normal. Pandan zour, to vot ar lezot pou esey trouv kisannla ki Tit Albert.",
    team: ROLE_TYPES.VILLAGER,
    icon: "👥"
  },
  [ROLE_NAMES.BHAI_LOOKE]: {
    name: ROLE_NAMES.BHAI_LOOKE,
    description: "To enn Bhai Looké. Sak lannwit, to kapav get enn dimounn pou kone si li enn Tit Albert ouswa non.",
    team: ROLE_TYPES.VILLAGER,
    icon: "👁️"
  },
  [ROLE_NAMES.CLIFFEURD]: {
    name: ROLE_NAMES.CLIFFEURD,
    description: "Si Tit Albert touy twa, ouswa si bann vilazwas elimin twa, avan to mor to gagn drwa tir enn dimounn ar twa.",
    team: ROLE_TYPES.VILLAGER,
    icon: "⚕️"
  },
  [ROLE_NAMES.AGWA]: {
    name: ROLE_NAMES.AGWA,
    description: "Premie lannwit, to fer de dimounn tom dan lamour. Kapav 2 zom, 2 fam ouswa enn zom ek enn fam. To kapav mem met twa dan kouple si to anvi!",
    team: ROLE_TYPES.VILLAGER,
    icon: "🛡️"
  },
  [ROLE_NAMES.LONGANIS]: {
    name: ROLE_NAMES.LONGANIS,
    description: "To enn Longanis. To ena 2 potion: enn pou sov lavi, ek enn pou touy enn dimounn net.",
    team: ROLE_TYPES.VILLAGER,
    icon: "🏹"
  },
  [ROLE_NAMES.TIFI]: {
    name: ROLE_NAMES.TIFI,
    description: "Pandan lannwit, li zis bizin ouver lizye enn tigit pou kapav espiyon bann Tit Albert kan zot pe leve.",
    team: ROLE_TYPES.VILLAGER,
    icon: "🧪"
  },
  [ROLE_NAMES.VOLER]: {
    name: ROLE_NAMES.VOLER,
    description: "To enn Voler. To kapav kokin rol enn lezot dimounn pou vinn li.",
    team: ROLE_TYPES.NEUTRAL,
    icon: "🎭"
  }
};

module.exports = {
  ROLE_TYPES,
  ROLE_NAMES,
  ROLES
};