require('../../types');
const FM = require('../lib-js/formatDate');
const erpUsersServices = require('../erpUsers/services');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');

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
 * 
 * @param {T_absence['id']} _id absence unique id
 * @returns {Promise<T_absence>}
 */
async function getAbsenceById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_absenceCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * Return all absences
 * @returns {Promise<Array<T_absence>>}
 */
async function getAbsence() {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_absenceCol, {}, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * 
 * @param {string} _harbour_id 
 * @returns {Promise<Array<T_absence>>}
 */
async function getAbsencesByHarbourId(_harbour_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_absenceCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
};

async function getAbsenceByUserIdAndHarbourId(_user_id, _harbour_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_absenceCol, { user_id: _user_id, harbour_id: _harbour_id }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function delAbsence(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_absenceCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function createAbsence(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Create(_absenceCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * 
 * @param {T_absence} _obj 
 * @returns {Promise<Array<T_absence>>}
 */
async function updateAbsence(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Update(_absenceCol, { id: _obj.id }, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function getAdminById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.FindById(_userCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * 
 * @param {string} _id 
 * @returns {Promise<Array<T_boat>>}
 */
async function getBoatById(boatId) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_boatCol, boatId, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
};

//handler that return absence by user id and harbour id
async function getAbsenceHandler(req, res) {
	try {
		const data = await getAbsenceByUserIdAndHarbourId(req.get.user_id, req.get.harbour_id);
		UTILS.httpUtil.dataSuccess(req, res, "success", data, "1.0");
	} catch (error) {
		UTILS.httpUtil.dataError(req, res, "Error", "Aucune absence trouvé", "100", "1.0");
	}
}

//handle absence declaration
async function createAbsenceHandler(req, res) {
	console.log('CALL createAbsenceHandler', req.post)
	if (!verifyPostReq(req, res)) {
		console.error('createAbsenceHandler verification nok');
		return;
	}

	const newAbsence = { ...req.post };

	newAbsence.date = Date.now();
	newAbsence.previous_date_start = null;
	newAbsence.previous_date_end = null;
	newAbsence.created_at = Date.now();
	newAbsence.updated_at = newAbsence.created_at;

	var harbour = await STORE.harbourmgmt.getHarbourById(req.post.harbour_id);

	if (harbour) {
		var absence = await createAbsence(newAbsence);
		if (absence.id) {
			if (false === true) { // ! DEV

				//get data from db
				var user = await STORE.usermgmt.getUserById(absence.user_id);
				var boat = await STORE.boatmgmt.getBoatById(absence.boat_id);
				var place = await STORE.mapmgmt.getPlaceById(boat.place_id);

				//prepare mail
				var subject = "Declaration d'absence";
				var body = `
							<img id="logo" src="https://api.nauticspot.io/images/logo.png" alt="Nauticspot logo" style="width: 30%;">
							<h1>Bonjour</h1>
							<p style="font-size: 12pt">Le plaisancier ${user.first_name} ${user.last_name}, propriétaire de ${boat.name} a déclaré une absence du ${absence.date_start} au ${absence.date_end}.</p>
							<p style="font-size: 10pt">À bientôt,</p>
							<p style="font-size: 10pt">L'équipe Nauticspot</p>
							`;

				//send mail
				await STORE.mailjet.sendHTML(harbour.id_entity, harbour.email, harbour.name, subject, body);

			}
			UTILS.httpUtil.dataSuccess(req, res, "success", absence, "1.0");
			return;
		}
		else {
			UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
			return;
		}

	} else {
		UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
		return;
	}
}

async function updateAbsenceHandler(req, res) {
	const { absence_id, newStartDate, newEndDate } = req.body;

	try {
		const absence = await getAbsenceById(absence_id);
		const newAbsence = { ...absence };

		newAbsence.previous_date_start = newAbsence.date_start;
		newAbsence.date_start = newStartDate;
		newAbsence.previous_date_end = newAbsence.date_end;
		newAbsence.date_end = newEndDate;
		newAbsence.updated_at = Date.now();
		const [result] = await updateAbsence(newAbsence);

		const boat = await getBoatById(result.boat_id);
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
					<p style="font-size: 12pt">Le bateau  place n° "${place.number}" vous signale son absence du "${FM.formatDate(absence.date_start)} au ${FM.formatDate(absence.date_end)}" au lieu de l'absence initiale du "${FM.formatDate(absence.previous_date_start)} au ${FM.formatDate(absence.previous_date_end)}".</p>
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

		// validate api token
		const [erpUsers] = await erpUsersServices.getErpUserWhere({ apiToken: apiAuthToken });
		console.log('>\tERP User: ', erpUsers.name);
		console.log('>\tHarbour ID: ', harbourId);
		if (!erpUsers) {
			res.writeHead(403);
			res.end(JSON.stringify({
				code: 403,
				message: 'Validation Failed',
				description: 'Invalid api token.'
			}));
			return;
		}
		// verify if ERP can access to the requested port absences
		if (!harbourId || !erpUsers.harbourIds.includes(harbourId)) {
			res.writeHead(403);
			res.end(JSON.stringify({
				code: 403,
				message: 'Validation Failed',
				description: 'Invalid \'harbour-id\' parameter.'
			}));
			return;
		}

		// Get the absences
		const absences = await getAbsencesByHarbourId(harbourId);
		// ASBSENCE SORT BY DATE
		absences.sort((A, B) => A.date > B.date ? 1 : -1);

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
		absencesOfTheDay.map(absence => boatsPromises.push(getBoatById(absence.boat_id)));
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
			results: eprAbsences
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({
			code: 500,
			message: 'Unexpected internal server error',
			details: '',
		}));
	}
}

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
	var _absence = await getAbsence();
	res.end(JSON.stringify(_absence));
	return;
}

exports.plugin =
{
	title: "Gestion des absences",
	desc: "",
	handler: async (req, res) => {
		//get users from FORTPRESS db <
		var admin = await getAdminById(req.userCookie.data.id);
		var _role = admin.role;
		var _type = admin.data.type;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)){
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.absence_id) {
				console.log("eeeeeeeeeeeeeeeeeeeeeeeee");
				await delAbsence(req.get.absence_id);
			}
			else if (req.get.absence_id) {
				await getAbsenceById(req.get.absence_id);
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				if (!req.post.date_start) {
					UTILS.httpUtil.dataError(req, res, "Error", "Date de début requise", "100", "1.0");
					return;
				}
				if (!req.post.date_end) {
					UTILS.httpUtil.dataError(req, res, "Error", "Date de fin requis", "100", "1.0");
					return;
				}
				var currentAbsence = await getAbsenceById(req.post.id);
				var _FD = req.post;


				var absence = await updateAbsence(_FD);
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
				if (typeof req.body == "object" && req.multipart) {
					if (verifyPostReq(req, res)) {
						var _FD = req.post;

						_FD.category = 'absence';
						_FD.date_start = Date.parse(_FD.date_start);
						_FD.date_end = Date.parse(_FD.date_end);
						var absence = await createAbsence(_FD);
						console.log(absence);
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
			var _Absences = [];
			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_Absences = _Absences.concat(await getAbsencesByHarbourId(_harbour_id[i]));
				}
			}
			else if (_role == "admin")
				_Absences = await getAbsence();

			//modify html dynamically <
			var _absenceGen = "";
			for (var i = 0; i < _Absences.length; i++) {
				if (_Absences[i].category == "absence") {
					_Absences[i].category = "événement";
				}

				let formatedDate = '-';
				if (_Absences[i].date) {
					const dateObj = new Date(_Absences[i].date)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				date = new Date(_Absences[i].date_start);
				var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				date = new Date(_Absences[i].date_end);
				var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Absences[i].harbour_id);
				var currentUser = await STORE.usermgmt.getUserById(_Absences[i].user_id);
				var currentBoat = await STORE.boatmgmt.getBoatById(_Absences[i].boat_id);
				var currentPlace = await STORE.mapmgmt.getPlaceById(currentBoat.place_id);

				_absenceGen += _absenceHtml.replace(/__ID__/g, _Absences[i].id)
					.replace(/__FORMID__/g, _Absences[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__USER_NAME__/g, currentUser.id + "\\" + currentUser.first_name + " " + currentUser.last_name)
					.replace(/__BOAT_NAME__/g, currentBoat.id + "\\" + currentBoat.name)
					.replace(/__PLACE_NUMBER__/g, currentPlace.number)
					.replace(/__DATE_START__/g, startDateFormated)
					.replace(/__DATE_END__/g, endDateFormated)
					.replace(/__DATE__/g, formatedDate)
					.replace(/__DATETIMEORDER__/g, _Absences[i].date)
			}
			_indexHtml = _indexHtml.replace("__ABSENCES__", _absenceGen).replace(/undefined/g, '');
			// >

			//set harbour lists from user role <
			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				for (var i = 0; i < _harbour_id.length; i++) {
					userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbour();

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