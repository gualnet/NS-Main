const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const fs = require('fs');

/**
 * 
 * @param {string} table 
 * @param {object} whereOpt 
 * @returns {Promise<Array<*>>}
 */
const getElementsWhere = async (table, whereOpt) => {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Find(table, whereOpt, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}
/**
 * 
 * @param {string} table 
 * @param {object} whereOpt 
 * @param {object} updatedElement 
 * @returns {Promise<Array<*>>}
 */
async function updateElementWhere(table, whereOpt, updatedElement) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Update(table, whereOpt, updatedElement, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}
/**
 * @param {string} table
 * @param {object} newElement
 * @returns {Promise<Array<*>>}
 */
async function createElement(table, newElement) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Create(table, newElement, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}
/**
 * @param {string} table
 * @param {object} newElement
 * @returns {Promise<*>}
 */
async function deleteElementWhere(table, whereOpt) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Delete(table, whereOpt, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}

const harbourIdMatchTable = {
	"1": "4e.mx_85wK", "2": "NONE", "3": "Bgd22Svr45", "4": "4e2cd2p6mt", "5": "NxfYN1MNNY", "6": "EgDGCtXVVK", "7": "NONE", "8": "Nxs1tMY37Y", "9": "EgiqgIFh7K",
	"10": "EgDGCtXVVK", "11": "NONE", "12": "Nx6KHMP2mY", "13": "NONE", "14": "NONE", "15": "NONE", "16": "4eG9_R4jHNF", "17": "rgLXUSuBN9", "18": "NONE", "19": "VetjeuxdVF",
	"20": "NONE", "21": "NONE", "22": "Sld0Hl_BN5", "23": "NONE", "24": "NONE", "25": "NONE", "26": "NONE",
}

const newUserTemplate = {
	boat_id: null,
	category: null,
	contract_number: null,
	created_at: null,
	email: null,
	enabled: true,
	first_name: null,
	harbour_id: null,
	id: null,
	last_name: null,
	onesignal_userid: null,
	password: null,
	phone: null,
	prefix: null,
	prefixed_phone: null,
	resetPwdToken: null,
	roleMobileApp: null,
	show_communication_module: true,
	show_reporting_module: true,
	show_security_module: true,
	token: null,
	updated_at: null,
	username: null,
	reset_password_requested_at: null,
};
/**
 * Turns all user table object to a standard user struct
 * @param {*} req 
 * @param {*} res 
 */
const restructureUser = async (req, res) => {
	try {
		/** @type {Array<TYPES.T_user>} */
		const users = await getElementsWhere('user', {});

		/**@type {Array<TYPES.T_user>} */
		const updatedUsers = [];
		for (let i = 0; i < users.length; i++) {
			/**@type {T_user} */
			const updatedUser = { ...newUserTemplate, ...users[i] };
			if (updatedUser.date) {
				updatedUser.created_at = updatedUser.date;
				updatedUser.updated_at = Date.now();
				updatedUser.date = undefined;
			} else {
				updatedUser.created_at = Date.now();
				updatedUser.updated_at = Date.now();
			}
			if (updatedUser.harbourid && !updatedUser.harbour_id) {
				updatedUser.harbour_id = updatedUser.harbourid;
				updatedUser.harbourid = undefined;
			} else if (updatedUser.harbourid && updatedUser.harbour_id) {
				updatedUser.harbourid = undefined;
			}
			updatedUsers.push(updatedUser)
		}

		const updatePromises = [];
		updatedUsers.map((updatedUser) => {
			updatePromises.push(updateElementWhere('user', { id: updatedUser.id }, updatedUser));
		});
		const end = await Promise.all(updatePromises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({
			success: true,
			payload: end,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
}

const importUsersProcess = () => {
	// open user dump
	const userPath = `${__dirname}/IAS_user.json`;
	const userJsonData = fs.readFileSync(userPath, { encoding: 'utf-8' });
	const userData = JSON.parse(userJsonData);
	/**@type {Array<TYPES.T_user>} */
	const userList = userData[2].data;


	const userToHarbour = importUserToHarbourLinkTable();
	const userToHarbourMap = {};
	userToHarbour.map(item => userToHarbourMap[item.user_id] = item.harbour_id);

	/**@type {Array<TYPES.T_user>} */
	const mergedUsers = [];
	userList.map(user => {
		user.ias_id = user.id;
		user.id = undefined;
		if (user.phone_number) {
			user.prefixed_phone = user.phone_number;
			user.phone_number = undefined;
		}
		if (user.phone_number_normalized) {
			user.phone = user.phone_number_normalized;
			user.phone_number_normalized = undefined;
		}
		if (user.is_super_admin === 1) {
			user.roleMobileApp = ENUM.rolesMobileApp.SUPER_ADMIN;
			user.is_super_admin = undefined;
		} else if (user.category === 'yachtsman') {
			user.roleMobileApp = ENUM.rolesMobileApp.PLAISANCIER;
			user.is_super_admin = undefined;
		} else {
			user.roleMobileApp = ENUM.rolesMobileApp.VISITEUR;
			user.is_super_admin = undefined;
		}
		if (user.edited_at) {
			user.updated_at = user.edited_at;
		}

		const iasHarbourId = userToHarbourMap[user.ias_id];
		const harbourId = harbourIdMatchTable[iasHarbourId];
		user.harbour_id = harbourId || null;

		user.is_super_admin = undefined;
		user.password_changed_at = undefined;
		user.shown_tutorials = undefined;
		user.show_communication_module = undefined;
		user.show_reporting_module = undefined;
		user.show_security_module = undefined;
		user.validation_code = undefined;
		user.edited_at = undefined;
		user.end_user_license_agreement_accepted = undefined;
		user.locale = undefined;
		user.password = 'RESET';
		user.enabled = false;

		mergedUsers.push({ ...newUserTemplate, ...user });
	});
	return (mergedUsers);
}
const importUsersHandler = async (req, res) => {
	// INSERT IN DB
	try {
		const users = importUsersProcess();
		const createUsersPromises = [];
		const insertPromises = users.map(user => {
			const promise = createElement('user', user);
			createUsersPromises.push(promise);
		});
		const results = await Promise.all(createUsersPromises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({
			users: results,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error')
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const newBoatTemplate = {
	created_at: null,
	harbour_id: null,
	immatriculation: null,
	is_resident: null,
	largeur: null,
	longueur: null,
	name: null,
	place_id: null,
	tirant_eau: null,
	updated_at: null,
	user_id: null,
};

/**
 * Turns all boat table object to a standard boat struct
 * @param {*} req 
 * @param {*} res 
 */
const restructureBoats = async (req, res) => {
	try {
		/** @type {Array<TYPES.T_boat>} */
		const boats = await getElementsWhere('boat', {});

		/**@type {Array<TYPES.T_boat>} */
		const updatedBoats = [];
		for (let i = 0; i < boats.length; i++) {
			/**@type {TYPES.T_boat} */
			const updatedBoat = { ...newBoatTemplate, ...boats[i] };
			if (updatedBoat.date) {
				updatedBoat.created_at = updatedBoat.date;
				updatedBoat.updated_at = Date.now();
				updatedBoat.date = undefined;
			} else {
				updatedBoat.created_at = Date.now();
				updatedBoat.updated_at = Date.now();
			}
			if (updatedBoat.user) {
				updatedBoat.user_id = updatedBoat.user;
				updatedBoat.user = undefined;
			}
			if (updatedBoat.harbourid) {
				updatedBoat.harbour_id = updatedBoat.harbourid;
				updatedBoat.harbour = undefined;
			}
			if (updatedBoat.place) {
				updatedBoat.place_id = updatedBoat.place;
				updatedBoat.place = undefined;
			}
			if (updatedBoat.place_id === 'aucun') {
				updatedBoat.place_id = undefined;
			}
			updatedBoats.push(updatedBoat);
		}

		/**@type {Promise<TYPES.T_boat>} */
		const updatePromises = [];
		updatedBoats.map((boat) => {
			updatePromises.push(updateElementWhere('boat', { id: boat.id }, boat));
		});
		const endResults = await Promise.all(updatePromises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({
			success: true,
			payload: endResults,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const importBoatsProcess = async () => {
	// open boat dump
	const boatPath = `${__dirname}/IAS_boat.json`;
	const boatJson = fs.readFileSync(boatPath, { encoding: 'utf-8' });
	const boatsObj = JSON.parse(boatJson);
	/** @type {Array<TYPES.T_boat>} */
	const boatsList = boatsObj[2].data;
	/** @type {Array<TYPES.T_boat>} */

	/** @type {Array<TYPES.T_place>} */
	const places = await getElementsWhere('place', {});
	const iasPlaces = importPlacesProcess();
	iasPlacesMap = {}
	iasPlaces.map(place => iasPlacesMap[place.id] = place);
	placeMapNameToIas = {};
	places.map(place => {
		placeMapNameToIas[place.number] = place;
	});

	const mergedBoats = [];
	boatsList.map(boat => {
		boat.ias_id = boat.id;
		delete boat.id;

		boat.harbour_id = harbourIdMatchTable[boat.harbour_id];
		// boat.ias_harbour_id = boat.harbour_id;
		// delete boat.harbour_id;
		boat.largeur = boat.width;
		delete boat.width;
		boat.longueur = boat.length;
		delete boat.length;
		boat.tirant_eau = boat.draught;
		delete boat.draught;
		boat.updated_at = boat.edited_at;
		delete boat.edited_at;

		if (boat.place_id) {
			const iasPlace = iasPlacesMap[boat.place_id];
			const place = placeMapNameToIas[iasPlace.code];
			boat.place_id = place?.id || null
		}

		delete boat.boat_type;
		delete boat.has_tank;
		delete boat.synox_device_id;
		delete boat.contract_reference;
		const mergedBoat = { ...newBoatTemplate, ...boat };
		mergedBoats.push(mergedBoat);
	});
	return (mergedBoats);
}
const importBoatsHandler = async (req, res) => {
	const boats = await importBoatsProcess();
	// INSERT IN DB
	try {
		const createBoatsPromises = [];
		const insertPromises = boats.map(boat => {
			const promise = createElement('boat', boat);
			createBoatsPromises.push(promise);
		});
		const results = await Promise.all(createBoatsPromises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: results.length,
			boats: results,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const importUserToBoatLinkTable = () => {
	const linksPath = `${__dirname}/IAS_user_boat_link.json`;
	const linksJson = fs.readFileSync(linksPath, { encoding: 'utf-8' });
	const linksObj = JSON.parse(linksJson);
	const links = linksObj[2].data;
	return (links);
}

const importUserToHarbourLinkTable = () => {
	const linksPath = `${__dirname}/IAS_user_harbour_link.json`;
	const linksJson = fs.readFileSync(linksPath, { encoding: 'utf-8' });
	const linksObj = JSON.parse(linksJson);
	const links = linksObj;
	return (links);
}

const joinUsersAndBoats = async (req, res) => {
	try {

		/** @type {Array<TYPES.T_user>} */
		const users = await getElementsWhere('user', { password: 'RESET' });
		/** @type {Array<TYPES.T_boat>} */
		const allBoats = await getElementsWhere('boat', {});
		const boats = allBoats.filter(boat => boat.ias_id); // get only boat extracted from ias db

		const userToHarbourMap = {};
		const userToHarbourArr = importUserToHarbourLinkTable();
		userToHarbourArr.map(elem => userToHarbourMap[elem.user_id] = userToHarbourArr[elem.harbour_id]); // userToHarbourMap[iasId] = iasHarbourId

		const userToBoatMap = {};
		const userToBoatArr = importUserToBoatLinkTable();
		userToBoatArr.map(
			/**
			 * 
			 * @param {{user_id: string, boat_id: string}} elem 
			 * @returns 
			 */
			elem => userToBoatMap[elem.user_id] = elem.boat_id); // userToBoatMap[iasUserId] = iasBoatId

		const boatByIasIdMap = {};
		boats.map(boat => boatByIasIdMap[boat.ias_id] = boat); // boatByIasIdMap[iasBoatId] = boatObj

		users.map(user => {
			const userId = user.id;
			const userIasId = user.ias_id;

			const iasBoatId = userToBoatMap[userIasId];
			/** @type {TYPES.T_boat} */
			const boat = boatByIasIdMap[iasBoatId];
			if (boat) {
				user.boat_id = boat?.id;
				boat.user_id = user.id;
				boat.harbour = harbourIdMatchTable[boat.ias_harbour_id];
			} else {
				user.boat_id = null;
			}
		});

		// update users
		const userUpdatesPromises = [];
		users.map(user => {
			userUpdatesPromises.push(updateElementWhere('user', { id: user.id }, user));
		});
		const updatedUsers = await Promise.all(userUpdatesPromises);

		// update users
		const boatUpdatesPromises = [];
		boats.map(boat => {
			boatUpdatesPromises.push(updateElementWhere('boat', { id: boat.id }, boat));
		});
		const updatedBoats = await Promise.all(boatUpdatesPromises);


		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({
			success: true,
			usersCount: updatedUsers.length,
			users: updatedUsers,
			boatsCount: updatedBoats.length,
			boats: updatedBoats,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500)
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
}

/**
 * @typedef IAS_Place
 * @property {string} id
 * @property {string} harbour_id
 * @property {string} place_zone_id
 * @property {string} code
 * @property {string} place_type
 * @property {["motorboat","multihull","sailboat"]} boat_types_serealized
 * @property {string} draught
 * @property {string} length
 * @property {string} width
 * @property {string} device_id
 * @property {string} created_at
 * @property {string} edited_at
 * @property {string} deleted_at
 * @property {string} received_state_at
 * @property {string} empty
 * @property {string} first_out_date_time
 * @property {string} counter_out
 * @property {string} first_in_date_time
 * @property {string} counter_in
 * @property {string} ultrasonic_min_threshold
 * @property {string} ultrasonic_max_threshold
 * @property {string} min_in_frame_threshold
 * @property {string} min_out_frame_threshold
 * @property {string} pontoon_id
 * @property {string} device_type
 */
/**
 * @returns {Array<IAS_Place>}
 */
const importPlacesProcess = () => {
	const placePath = `${__dirname}/IAS_place.json`;
	const placeJson = fs.readFileSync(placePath, { encoding: 'utf-8' });
	const placesObj = JSON.parse(placeJson);
	const placeList = placesObj[2].data;
	return (placeList);
}
const mergeBoatsToPlace = async (req, res) => {
	try {


		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: boats.length || 'error',
			absences: boats || [],
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}

};

const deleteIasUsers = async (req, res) => {
	try {
		const deletedUsers = await deleteElementWhere('user', { password: 'RESET' });

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedUsers?.length,
			payload: deletedUsers,
		}));

	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

// ABSENCES
const absenceTemplate = {
	created_at: null,
	date_end: null,
	date_start: null,
	previous_date_end: null,
	previous_date_start: null,
	updated_at: null,
	boat_id: null,
	harbour_id: null,
	id: null,
	token: null,
	user_id: null,
}
const restructureAbsences = async (req, res) => {
	try {
		/** @type {Array<TYPES.T_absence>} */
		const absences = await getElementsWhere('absences', {});


		/** @type {Array<TYPES.T_absence>} */
		const updatedAbsences = [];
		for (let i = 0; i < absences.length; i++) {
			/** @type {TYPES.T_absence} */
			const updatedAbsence = { ...absenceTemplate, ...absences[i] };
			if (updatedAbsence.date) {
				updatedAbsence.created_at = updatedAbsence.date;
				updatedAbsence.updated_at = Date.now();
				updatedAbsence.date = undefined;
			} else if (updatedAbsence.created_at) {
				updatedAbsence.updated_at = Date.now();
			}
			updatedAbsences.push(updatedAbsence);
		}

		const updatePromises = [];
		updatedAbsences.map((absence) => {
			updatePromises.push(updateElementWhere('absences', { id: absence.id }, absence));
		});
		const endResults = await Promise.all(updatePromises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: endResults.length,
			absences: endResults,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const importAbsencesProcess = async () => {
	const absencePath = `${__dirname}/IAS_absence.json`;
	const absenceJson = fs.readFileSync(absencePath, { encoding: 'utf-8' });
	const absencesObj = JSON.parse(absenceJson);
	const absenceList = absencesObj[2].data;


	const boats = await getElementsWhere('boat', {});
	const boatsMap = {};
	boats.map(boat => {
		if (boat.ias_id) {
			boatsMap[boat.ias_id] = boat;
		}
	})

	/** @type {Array<TYPES.T_absence>} */
	const newAbsences = [];
	absenceList.map(absence => {
		/** @type {TYPES.T_absence} */
		const newAbsence = { ...absenceTemplate };

		newAbsence.id = undefined;

		if (absence.created_at) {
			newAbsence.created_at = new Date(absence.created_at).getTime();
			newAbsence.updated_at = Date.now();
		} else {
			newAbsence.created_at = Date.now();
		}

		const harbourId = harbourIdMatchTable[absence.harbour_id];
		newAbsence.harbour_id = harbourId;

		/**@type {TYPES.T_boat} */
		const boat = boatsMap[absence.boat_id];
		newAbsence.boat_id = boat.id;
		newAbsence.place_id = boat.place_id;

		newAbsence.date_start = absence.departure_date;
		newAbsence.date_end = absence.return_date;

		newAbsence.user_id = boat.user_id;

		newAbsences.push(newAbsence);
		if (newAbsence.harbour_id && newAbsence.user_id) {
		}
	})
	return (newAbsences);
}

const importAbsencesHandler = async (req, res) => {
	try {
		const absences = await importAbsencesProcess();
		const promises = [];
		absences.map(absence => {
			promises.push(createElement('absences', absence));
		});

		const endResults = await Promise.all(promises);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: endResults.length,
			absences: endResults || [],
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}

};

// SORTIES
const importSortiesProcess = async () => {
	const outingPath = `${__dirname}/IAS_outing.json`;
	const outingJson = fs.readFileSync(outingPath, { encoding: 'utf-8' });
	const outingsObj = JSON.parse(outingJson);
	/** @type {Array<TYPES.T_sortie>} */
	const outingList = outingsObj[2].data;

	/** @type {Array<TYPES.T_boat>} */
	const boats = await STORE.API_NEXT.getElements('boat', { harbour_id: '4e.mx_85wK'});

	const boatsMapboatIasIdToboat = {};
	boats.map(boat => {
		boatsMapboatIasIdToboat[boat.ias_id] = boat;
	});

	// Match IAS index
	outingList.map(sortie => {
		sortie.ias_id = sortie.id;
		sortie.id = undefined;

		const iasBoatId = sortie.boat_id;
		if (sortie.boat_id) {
			sortie.ias_boat_id = iasBoatId;
			sortie.boat_id = boatsMapboatIasIdToboat[iasBoatId].id;

			const iasPlaceId = sortie.place_id;
			sortie.ias_place_id = iasPlaceId;
			sortie.place_id = boatsMapboatIasIdToboat[iasBoatId].place_id;
		}
		if (sortie.harbour_id) {
			const iasHarbourId = sortie.harbour_id;
			sortie.ias_harbour_id = iasHarbourId;
			sortie.harbour_id = harbourIdMatchTable[iasHarbourId];
		}

		if (sortie.datetime_out) {
			sortie.datetime_out = new Date(sortie.datetime_out).getTime();
		}
		if (sortie.datetime_in) {
			sortie.datetime_in = new Date(sortie.datetime_in).getTime();
		}
		if (sortie.created_at) {
			sortie.created_at = new Date(sortie.created_at).getTime();
		}
		if (sortie.edited_at) {
			sortie.edited_at = new Date(sortie.edited_at).getTime();
		}
		if (sortie.deleted_at) {
			sortie.deleted_at = new Date(sortie.deleted_at).getTime();
		}

		if (typeof(sortie.duration) === 'string') {
			sortie.duration = parseInt(sortie.duration);
		}
	});
	return(outingList);
}

const importOutingsHandler = async (req, res) => {
	try {
		/** @type {Array<TYPES.T_sortie>} */
		const sorties = await importSortiesProcess();
		/** @type {Array<Promise<TYPES.T_sortie>>} */
		const promises = [];
		sorties.map(sortie => {
			promises.push(STORE.API_NEXT.createElement('sorties', sortie));
		});
		const results = await Promise.all(promises);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: results.length,
			absences: results,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
}

exports.router = [
	{
		on: true,
		route: "/api-dev/restructure-users",
		handler: restructureUser,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/restructure-boats",
		handler: restructureBoats,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/restructure-absences",
		handler: restructureAbsences,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/import-users",
		handler: importUsersHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/import-boats",
		handler: importBoatsHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/join-users-boats",
		handler: joinUsersAndBoats,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/import-absences",
		handler: importAbsencesHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api-dev/ias-users",
		handler: deleteIasUsers,
		method: "DELETE",
	},
	{
		on: true,
		route: "/api-dev/import-outings",
		handler: importOutingsHandler,
		method: "GET",
	},
];

exports.handler = async (req, res) => {
	res.end('DB_UPGRADER');
}

exports.plugin = {};

exports.setup = {
	title: "DB_UPGRADER",
	description: "Manage DB data structures",
	version: "0.0.1",
}
