const TYPES = require('../../types');
const FM = require('../lib-js/formatDate');
const erpUsersServices = require('../erpUsers/services');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

//gestions des absences


//set datatable cols
var _absenceCol = "absences";
var _userCol = "user";
var _boatCol = "boat";


//verify if url start with https
function addProtocolToUrl(url) {
	var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
	console.log(url);
	console.log(patternProtocol.test(url));
	if (patternProtocol.test(url)) {
		console.log(url);
		return url;
	} else {
		console.log(url);
		return ("https://" + url);
	}
}

//verify some data in post
function verifyPostReq(_req, _res) {
	if (!_req.post.boat_id || _req.post.boat_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Bateau requis", "100", "1.0");
		return false;
	}
	if (!_req.post.date_start) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Date de début requise", "100", "1.0");
		return false;
	}
	if (!_req.post.date_end) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Date de fin requis", "100", "1.0");
		return false;
	}
	return true;
}

//db functions <


/**
 * @param {Pick<TYPES.T_absence, "id" | "harbour_id" | "user_id" | "boat_id">} where 
 * @returns {Promise<TYPES.T_absence[]>}
 */
const getAbsencesV2 = async (where = {}) => {
	console.log('====getAbsencesV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search absences where: ', where);
	const findAbsencesResp = await DB_NS.absences.find(where);
	if (findAbsencesResp.error) {
		console.error('[Error]', findAbsencesResp)
		throw new Error(findAbsencesResp.message, { cause: findAbsencesResp });
	}
	const absences = findAbsencesResp.data;
	console.log(`Found ${absences.length} absence(s) items`);
	return absences;
}

/**
 * 
 * @param {TYPES.T_absence} absence 
 * @returns 
 */
const createAbsenceV2 = async (absence) => {
	console.log('====createAbsenceV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	// console.log('Search absences where: ', where);
	const createAbsenceResp = await DB_NS.absences.create(absence);
	if (createAbsenceResp.error) {
		console.error('[Error]', createAbsenceResp)
		throw new Error(createAbsenceResp.message, { cause: createAbsenceResp });
	}
	const absences = createAbsenceResp.data;
	console.log(`Created ${absences.length} absence:\n`.absences);
	return absences;
}

/**
 * 
 * @param {Pick<TYPES.T_absence, "id">} where 
 * @param {Partial<TYPES.T_absence>} updates 
 * @returns {Promise<TYPES.T_absence[]>}
 */
const updateAbsenceV2 = async (where, updates) => {
	console.log('====updateAbsenceV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update absences where: ', where);
	console.log('Update absences with: ', updates);
	updates.updated_at = Date.now();
	const updateAbsenceResp = await DB_NS.absences.update(where, updates);
	if (updateAbsenceResp.error) {
		console.error('[Error]', updateAbsenceResp)
		throw new Error(updateAbsenceResp.message, { cause: updateAbsenceResp });
	}
	const absences = updateAbsenceResp.data;
	console.log(`${absences.length} absence(s) Updated`);
	return absences;
}

/**
 * 
 * @param {Pick<TYPES.T_absence, "id">} where 
 * @returns {Promise<TYPES.T_absence[]>}
 */
const deleteAbsenceV2 = async (where = {}) => {
	console.log('====deleteAbsenceV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Delte absence where: ', where);
	if (Object.keys(where).length === 0) {
		throw new Error('Wrong parameter: ', where);
	}

	const deleteAbsencesResp = await DB_NS.absences.delete(where);
	if (deleteAbsencesResp.error) {
		console.error('[Error]', deleteAbsencesResp)
		throw new Error(deleteAbsencesResp.message, { cause: deleteAbsencesResp });
	}
	const absences = deleteAbsencesResp.data;
	console.log(`Deleted ${absences.length} absence(s) items`, absences);
	return absences;
};

//handler that return absence by user id and harbour id
async function getAbsenceHandler(req, res) {
	console.log('[INFO] /api/get/absence')
	try {
		const data = await getAbsencesV2({
			user_id: req.get.user_id,
			harbour_id: req.get.harbour_id,
		});
		UTILS.httpUtil.dataSuccess(req, res, "success", data, "1.0");
	} catch (error) {
		myLogger.logError(error, { module: 'absencemgmt' })
		UTILS.httpUtil.dataError(req, res, "Error", "Aucune absence trouvé", "100", "1.0");
	}
}

//handle absence declaration
async function createAbsenceHandler(req, res) {
	console.log('CALL createAbsenceHandler', req.post)
	if (!verifyPostReq(req, res)) {
		const err = new Error('createAbsenceHandler verification nok')
		console.error(err);
		myLogger.logError(err, { module: 'absencemgmt' })
		return;
	}

	/**@type {TYPES.T_absence} */
	const newAbsence = {
		user_id: req.post.user_id,
		created_at: req.post.created_at || Date.now(),
		updated_at: req.post.updated_at || Date.now(),
		previous_date_end: req.post.previous_date_end || null,
		previous_date_start: req.post.previous_date_start || null,
		date_end: req.post.date_end,
		date_start: req.post.date_start,
		harbour_id: req.post.harbour_id,
		boat_id: req.post.boat_id,
	};

	if (!newAbsence.harbour_id) return UTILS.httpUtil.dataError(req, res, "Error", "Erreur: Harbour id missing", "400", "1.0");
	if (!newAbsence.user_id) return UTILS.httpUtil.dataError(req, res, "Error", "Erreur: User id missing", "400", "1.0");
	if (!newAbsence.boat_id) return UTILS.httpUtil.dataError(req, res, "Error", "Erreur: Boat id missing", "400", "1.0");
	if (!newAbsence.date_start) return UTILS.httpUtil.dataError(req, res, "Error", "Erreur: Start date missing", "400", "1.0");
	if (!newAbsence.date_end) return UTILS.httpUtil.dataError(req, res, "Error", "Erreur: End date missing", "400", "1.0");

	/**@type {TYPES.T_harbour} */
	var harbour = await STORE.harbourmgmt.getHarbour({ id: req.post.harbour_id });

	if (harbour) {
		let absence;
		try {
			absence = await createAbsenceV2(newAbsence);
		} catch (error) {
			console.error('[ERROR]', error);
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la creation d'absence", "500", "1.0");
			return;
		}

		if (absence.id) {
			try {
				//get data from db
				var user = await STORE.usermgmt.getUsers({ id: absence.user_id });
				var boat = await STORE.boatmgmt.getBoats({ id: absence.boat_id });
				var place = await STORE.mapmgmt.getPlaceById(boat.place_id);
				//prepare mail
				var subject = "Declaration d'absence";
				var body = `
					<img id="logo" src="https://api.nauticspot.io/images/logo.png" alt="Nauticspot logo" style="width: 30%;">
					<h1>Bonjour</h1>
					<p style="font-size: 12pt">Le plaisancier ${user.first_name} ${user.last_name}, propriétaire de ${boat.name} place n°${place.number} a déclaré une absence du ${FM.formatDate(absence.date_start)} au ${FM.formatDate(absence.date_end)}.</p>
					<p style="font-size: 10pt">À bientôt,</p>
					<p style="font-size: 10pt">L'équipe Nauticspot</p>
				`;
				//send mail
				const emailAddress = harbour.email_absence || harbour.email;
				if (emailAddress?.includes(';')) {
					emailAddress
						.split(';')
						?.map(async (mail) => {
							await STORE.mailjet.sendHTML(harbour.id_entity, mail, harbour.name, subject, body);
						})
				} else {
					await STORE.mailjet.sendHTML(harbour.id_entity, emailAddress, harbour.name, subject, body);
				}
				UTILS.httpUtil.dataSuccess(req, res, "success", absence, "1.0");
				return;
			} catch (error) {
				console.error('[INTERNAL ERROR]', error);
				UTILS.httpUtil.dataSuccess(req, res, "success", absence, "1.0");
				// Error sending absence mail creation to capitainerie / do not send error to users
			}
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
			return;
		}
	} else {
		UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
		return;
	}
};

async function updateAbsenceHandler(req, res) {
	const { absence_id, newStartDate, newEndDate } = req.body;

	try {
		const [absence] = await getAbsencesV2({ id: absence_id });
		/**@type {TYPES.T_absence} */
		const newAbsence = {
			user_id: req.post.user_id || absence.user_id,
			created_at: req.post.created_at || absence.created_at,
			updated_at: Date.now(),
			previous_date_end: absence.date_end || null,
			previous_date_start: absence.date_start || null,
			date_end: newEndDate,
			date_start: newStartDate,
			harbour_id: req.post.harbour_id || absence.harbour_id,
			boat_id: req.post.boat_id || absence.boat_id,
			// token: req.post.token || ,
		};

		const [result] = await updateAbsenceV2({ id: absence_id }, newAbsence);

		const boats = await STORE.boatmgmt.getBoats({ id: result.boat_id });
		const boat = boats[0];
		if (!boat) {
			console.error('[ERROR] Boat is empty');
			throw new Error('Sorry an error occured, please retry.');
		}
		/** @type {Array<T_place>} */
		const place = await STORE.mapmgmt.getPlaceById(boat.place_id);
		if (!place) {
			console.error('[ERROR] Place is empty');
			throw new Error('Sorry an error occured, please retry.');
		}
		/** @type {Array<T_harbour>} */
		const harbour = await STORE.harbourmgmt.getHarbourById(absence.harbour_id);
		if (!harbour) {
			console.error('[ERROR] Harbour is empty');
			throw new Error('Sorry an error occured, please retry.');
		}

		//prepare mail
		var subject = "Modification d'absence";
		var body = `
			<img id="logo" src="https://api.nauticspot.io/images/logo.png" alt="Nauticspot logo" style="width: 30%;">
			<h2>Bonjour</h2>
			<p style="font-size: 12pt">Le bateau place n° "${place.number}" vous signale son absence du "${FM.formatDate(absence.date_start)} au ${FM.formatDate(absence.date_end)}" au lieu de l'absence initiale du "${FM.formatDate(absence.previous_date_start)} au ${FM.formatDate(absence.previous_date_end)}".</p>
			<p style="font-size: 10pt">À bientôt,</p>
			<p style="font-size: 10pt">L'équipe Nauticspot</p>
		`;

		//send mail
		await STORE.mailjet.sendHTML(harbour.id_entity, harbour.email, harbour.name, subject, body);
		res.end(JSON.stringify({
			success: true,
			payload: result,
			error: null,
		}));
	} catch (error) {
		console.log('[ERRROR]', error);
		myLogger.logError(error, { module: 'absencemgmt' })
		res.writeHead(500)
		res.end(JSON.stringify({
			success: false,
			error: error.message,
		}))
	}
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns {Promis<{results: Array<T_absence>}>}
 */
async function getAbsenceOfTheDayByHarbour(req, res) {
	console.log('[INFO] /api-erp/absences')

	try {
		const apiAuthToken = req.headers['x-auth-token'];
		const harbourId = req.get["harbour-id"];
		console.log('harbourId', harbourId)

		// validate api token
		const [erpUsers] = await erpUsersServices.getErpUserWhere({ apiToken: apiAuthToken });
		console.log('erpUsers', erpUsers)
		if (!erpUsers) {
			throw new Error('Invalide API Token', { cause: { httpCode: 401 } });
		}
		// verify if ERP can access to the requested port absences
		if (!harbourId || !erpUsers.harbourIds.includes(harbourId)) {
			throw new Error('Invalid \'harbour-id\' parameter.', { cause: { httpCode: 401 } });
		}

		// Get the absences
		/** @type {Array<TYPES.T_absence>} */
		const absences = await getAbsencesV2({ harbour_id: harbourId });
		// ASBSENCE SORT BY DATE
		absences.sort((A, B) => A.created_at > B.created_at ? 1 : -1);

		const startLimit = new Date;
		startLimit.setHours(0);
		startLimit.setMinutes(0);
		startLimit.setSeconds(0);
		startLimit.setMilliseconds(0);
		const endLimit = new Date;
		endLimit.setHours(23);
		endLimit.setMinutes(59);
		endLimit.setSeconds(59);
		endLimit.setMilliseconds(999);

		// search the start + end idx of the interesting part
		let startIdx = undefined;
		let endIdx = undefined;
		for (let i = 0; i < absences.length; i++) {
			if (startIdx === undefined && absences[i].updated_at >= startLimit) {
				startIdx = i;
			}
			if (endIdx === undefined && absences[i].updated_at > endLimit) {
				endIdx = i;
				break;
			}
		}
		// set endIdx to take the last object of the absence array if not set
		if (startIdx !== undefined && endIdx === undefined) endIdx = absences.length;

		const absencesOfTheDay = absences.slice(startIdx || 0, endIdx + 1 || 0);

		// Get the needed data and Construct the response object
		const boatsPromises = [];
		absencesOfTheDay.map(absence => boatsPromises.push(STORE.boatmgmt.getBoats({ id: absence.boat_id })));
		/**@type {Array<T_boat>} */
		const boats = await Promise.all(boatsPromises);

		const placesPromises = [];
		boats.map(boat => placesPromises.push(STORE.mapmgmt.getPlaceById(boat.place_id)));
		/** @type {Array<T_place>} */
		const places = await Promise.all(placesPromises);

		const zonesPromises = [];
		places.map(place => zonesPromises.push(STORE.mapmgmt.getZoneById(place.pontonId)));
		/** @type {Array<T_zone>} */
		const zones = await Promise.all(zonesPromises);

		const eprAbsences = [];
		for (let i = 0; i < boats.length; i++) {
			eprAbsences.push({
				id: absencesOfTheDay[i].id,
				startDate: absencesOfTheDay[i].date_start,
				endDate: absencesOfTheDay[i].date_end,
				prevStartDate: absencesOfTheDay[i].previous_date_start || null,
				prevEndDate: absencesOfTheDay[i].previous_date_end || null,
				createdAt: absencesOfTheDay[i].created_at,
				updatedAt: absencesOfTheDay[i].updated_at,
				boatName: boats[i].name || 'unknown',
				place: places[i].number || 'unknown',
				ponton: zones[i].name || 'unknow',
			});
		}

		res.end(JSON.stringify({
			results: eprAbsences,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'absencemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const getUserByIdWithMemo = async (userId, usersMapById) => {
	// console.log('===getUserByIdWithMemo===', userId)
	// console.log('usersMapById', Object.keys(usersMapById));
	if (usersMapById[userId]) {
		// console.log('==> FOUND IN MEMO')
		return [usersMapById[userId], usersMapById];
	}
	// console.log('==> NOT FOUND IN MEMO')
	const foundUsers = await STORE.usermgmt.getUsers({ id: userId });
	// console.log('==> FOUND FROM DB')
	const user = foundUsers[0]
	usersMapById[user.id] = user;

	return [user, usersMapById];
};

const getBoatByIdWithMemo = async (boatId, boatsMapById) => {
	// console.log('===getBoatByIdWithMemo===', boatId)
	// console.log('boatsMapById', Object.keys(boatsMapById));
	if (boatsMapById[boatId]) {
		// console.log('==> FOUND IN MEMO')
		return [boatsMapById[boatId], boatsMapById];
	}
	// console.log('==> NOT FOUND IN MEMO')
	/**@type {TYPES.T_boat[]} */
	const foundBoats = await STORE.boatmgmt.getBoats({ id: boatId });
	// console.log('==> FOUND FROM DB', foundBoats)
	const boat = foundBoats[0];
	if (!boat) {
		console.error('[ERRROR] BOAT NOT FOUND - an absence is attributed to a boat that does not exists!')
	}
	boatsMapById[boatId] = boat;

	return [boat, boatsMapById];
};

const getPlaceByIdWithMemo = async (placeId, placesMapById) => {
	// console.log('===getPlaceByIdWithMemo===', placeId)
	// console.log('boatsMapById', Object.keys(placesMapById));
	if (placesMapById[placeId]) {
		// console.log('==> FOUND IN MEMO')
		return [placesMapById[placeId], placesMapById];
	}
	// console.log('==> NOT FOUND IN MEMO')
	const foundHarbour = await STORE.mapmgmt.getPlaceById(placeId);
	// console.log('==> FOUND FROM DB')

	placesMapById[foundHarbour.id] = foundHarbour;

	return [foundHarbour, placesMapById];
};

exports.router = [
	{
		on: true,
		route: "/api/get/absence",
		handler: getAbsenceHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/create/absence",
		handler: createAbsenceHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/absence",
		handler: updateAbsenceHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api-erp/absences",
		handler: getAbsenceOfTheDayByHarbour,
		method: "GET",
	},
];

exports.handler = async (req, res) => {
	var _absence = await getAbsencesV2();
	res.end(JSON.stringify(_absence));
	return;
}

exports.plugin =
{
	title: "Gestion des absences",
	desc: "",
	handler: async (req, res) => {
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		//get users from FORTPRESS db <
		const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: 1 });
		if (findAdminResp.error) {
			console.error(findAdminResp.error);
			res.writeHead(500);
			res.end('Internal Error');
			return;
		} else if (findAdminResp.data.length < 1) {
			console.error('No dashboard user found');
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		const admin = findAdminResp.data[0];
		var _role = admin.role;
		var _type = admin.data.type;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.method == "GET") {
			console.log('PLUGIN DELETE', req.get)
			if (req.get.mode && req.get.mode == "delete" && req.get.absence_id) {
				const absence = await deleteAbsenceV2({ id: req.get.absence_id });
				console.log('DALETED', absence);
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				console.log('PLUGIN UPDATE')
				if (!req.post.date_start) {
					UTILS.httpUtil.dataError(req, res, "Error", "Date de début requise", "100", "1.0");
					return;
				}
				if (!req.post.date_end) {
					UTILS.httpUtil.dataError(req, res, "Error", "Date de fin requis", "100", "1.0");
					return;
				}
				var _FD = req.post;


				var absence = await updateAbsenceV2({ id: _FD.id }, _FD);
				console.log(absence);
				if (absence[0].id) {
					UTILS.httpUtil.dataSuccess(req, res, "Success", "Absence mis à jour", "1.0");
					return;
				} else {
					UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
					return;
				}
			}
			else {
				console.log('ELSE 001 ??');
				if (typeof req.body == "object" && req.multipart) {
					if (verifyPostReq(req, res)) {
						var _FD = req.post;

						_FD.category = 'absence';
						_FD.date_start = Date.parse(_FD.date_start);
						_FD.date_end = Date.parse(_FD.date_end);
						const absence = await createAbsenceV2(_FD);
						if (absence.id) {
							UTILS.httpUtil.dataSuccess(req, res, "Success", "Absence créé", "1.0");
							return;
						} else {
							UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'événement", "1.0");
							return;
						}
					}
				}
			}
		}
		else {
			//get html files
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _absenceHtml = fs.readFileSync(path.join(__dirname, "absence.html")).toString();

			//get absences from user role
			/** @type {TYPES.T_absence[]} */
			var _Absences = [];
			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_Absences = _Absences.concat(await getAbsencesV2({ harbour_id: _harbour_id[i] }));
				}
			}
			else if (_role == "admin") {
				_Absences = await getAbsencesV2({ harbour_id: "4e2cd2p6mt" });
				// _Absences = _Absences.splice(0, 4);
			}


			//modify html dynamically <
			var _absenceGen = "";
			let harboursMapById = await STORE.harbourmgmt.getAllHarboursMappedById();
			let usersMapById = {};
			let boatsMapById = {};
			let placesMapById = {};
			for (var i = 0; i < _Absences.length; i++) {
				console.log('I = ', i);
				if (_Absences[i].category == "absence") {
					_Absences[i].category = "événement";
				}

				let formatedDate = '-';
				if (_Absences[i].created_at) {
					const dateObj = new Date(_Absences[i].created_at)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				date = new Date(_Absences[i].date_start);
				var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				date = new Date(_Absences[i].date_end);
				var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');

				const harbourId = _Absences[i].harbour_id;
				let currentHarbour = (harbourId) ? harboursMapById[harbourId] : undefined;
				perfStart = performance.now();
				let currentUser;
				if (_Absences[i].user_id) {
					[currentUser, usersMapById] = await getUserByIdWithMemo(_Absences[i].user_id, usersMapById);
				} else {
					currentUser = undefined;
				}
				let currentBoat;
				if (_Absences[i].user_id) {
					[currentBoat, boatsMapById] = await getBoatByIdWithMemo(_Absences[i].boat_id, boatsMapById);
				} else {
					currentBoat = undefined;
				}

				let currentPlace;
				if (_Absences[i].user_id && currentBoat) {
					[currentPlace, placesMapById] = await getPlaceByIdWithMemo(currentBoat.place_id, placesMapById);
				} else {
					currentPlace = undefined;
				}

				_absenceGen += _absenceHtml.replace(/__ID__/g, _Absences[i].id)
					.replace(/__FORMID__/g, _Absences[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__USER_NAME__/g, currentUser?.id + "\\" + currentUser?.first_name + " " + currentUser?.last_name)
					.replace(/__BOAT_NAME__/g, currentBoat?.id + "\\" + currentBoat?.name || '')
					.replace(/__PLACE_NUMBER__/g, currentPlace?.number)
					.replace(/__DATE_START__/g, startDateFormated)
					.replace(/__DATE_END__/g, endDateFormated)
					.replace(/__DATE__/g, formatedDate)
					.replace(/__DATETIMEORDER__/g, _Absences[i]?.date)
			}
			_indexHtml = _indexHtml.replace("__ABSENCES__", _absenceGen).replace(/undefined/g, '');

			//set harbour lists from user role <
			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				for (var i = 0; i < _harbour_id.length; i++) {
					userHarbours[i] = harboursMapById[_harbour_id[i]];
					harbour_select += '<option value="' + userHarbours[i]?.id + '">' + userHarbours[i]?.name + '</option>';
				}
				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';

				userHarbours = await STORE.harbourmgmt.getHarbours();
				for (var i = 0; i < userHarbours.length; i++) {
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			}
			_indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);
			// >

			//send plugin html page
			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}
exports.store = {
	getAbsences: getAbsencesV2,
	createAbsences: createAbsenceV2,
	updateAbsences: updateAbsenceV2,
	deleteAbsences: deleteAbsenceV2,
}