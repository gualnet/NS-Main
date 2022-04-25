
/**
 * incident type
 * @readonly
 * @enum {string}
 */
const incidentsTypes = {
  // existing
  INCENDIE: 'Incendie',
  PB_ELECTRIQUE: 'Problème électrique',
  POLLUTION: 'Pollution',
  AVARIE: 'Avarie',
  EFFRACTION: 'Effraction',
  FUITE_EAU: 'Fuite d\'eau',
  SANITAIRE: 'Sanitaires',
  ECLAIRAGE: 'Eclairage',
  PLANCHE_CASSEE: 'Planche cassée',
  COLLISION: 'Collision',
  PLAN_EAU: 'Plan d\'eau',
  EXTINCTEUR: 'Extincteur',
  CHAINE_PENDILLE: 'Chaîne / Pendille',
  ECHELLE: 'Echelle',
  REMORQUAGE: 'Remorquage',
  AMARRAGE: 'Amarrage',
  AUTRE: 'Autre',
  // new
  PLONGE: 'Plongée',
  ENTRETIEN_QUAI: 'Entretien quai',
  ESPACE_VERT: 'Espaces verts',
  PROPRETE_PLAN_EAU: 'Propreté plan d\'eau',
  PROPRETE_TERRESTRE: 'Propreté terrestre',
  SECURITE: 'Sûreté/Sécurité',
  ANIMATIONS: 'Animations',
};

module.exports = {
  incidentsTypes,
};
