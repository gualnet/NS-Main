
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

/**
 * user roles
 * @readonly
 * @enum {string}
 */
const rolesBackOffice = {
  VISITEUR: 'Visiteur',
  PLAISANCIER: 'Plaisancier',
  AGENT_CAPITAINERIE: 'Agent Capitainerie',
  AGENT_ADMINISTRATEUR: 'Agent Administrateur',
  AGENT_SUPERVISEUR: 'Agent Superviseur',
  ADMIN_MULTIPORTS: 'Admin Multi-Ports',
  SUPER_ADMIN: 'Super Admin Nauticspot',
}

/**
 * user roles
 * @readonly
 * @enum {string}
 */
const rolesMobileApp = {
  VISITEUR: 'Visiteur',
  PLAISANCIER: 'Plaisancier',
  CAPITAINERIE: 'Capitainerie',
  AGENT_SECURITE: 'Agent Sécurité',
  SUPERVISEUR: 'Superviseur',
  PROFESSIONNEL: 'Professionnel',
  ADMINISTRATEUR: 'Administrateur',
  SUPER_ADMIN: 'Super Admin',
};

/**
 * BD TABLE NAMES
 */
const TABLES = {
	USERS: 'user',
	BOATS: 'boat',
	ABSENCES: 'absences',
	SORTIES: 'sorties',
	ZONES: 'zone',
	EVENTS: 'events',
	HARBOURS: 'harbour',
	OFFERS: 'offers',
}

module.exports = {
  incidentsTypes,
  rolesMobileApp,
  rolesBackOffice,
	TABLES,
};
